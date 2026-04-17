const SHEET_ID = "1rz1x8CFf613_HjOUsDfxZ2DJ1W5IObc8c05tiCXLSfs";
const SHEET_TAB = "Sheet1";

// ── Google JWT auth ────────────────────────────────────────────────────────────
async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = obj => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the private key and sign
  const keyData = rawKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Buffer.from(keyData, "base64");
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(signature).toString("base64url")}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
  return tokenData.access_token;
}

// ── Ensure header row exists ───────────────────────────────────────────────────
async function ensureHeader(token) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_TAB}!A1:E1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const firstRow = data.values?.[0];

  if (!firstRow || firstRow[0] !== "Timestamp") {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_TAB}!A1:E1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["Timestamp", "Phase", "Checklist Item", "Completed By", "Details"]] }),
      }
    );
  }
}

// ── Append a row ───────────────────────────────────────────────────────────────
async function appendRow(token, row) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_TAB}!A:E:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Sheets append failed");
  }
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { itemLabel, phase, completedBy, fields } = req.body;
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

  // Flatten fields into a readable string
  const details = fields
    ? [
        ...Object.entries(fields)
          .filter(([k, v]) => k !== "rows" && v && v !== "")
          .map(([k, v]) => `${k}: ${v}`),
        ...(fields.rows
          ? fields.rows
              .filter(r => Object.values(r).some(v => v))
              .map(r => Object.values(r).filter(Boolean).join(" | "))
          : []),
      ].join(" · ")
    : "";

  try {
    const token = await getAccessToken();
    await ensureHeader(token);
    await appendRow(token, [timestamp, phase, itemLabel, completedBy || "Unknown", details || "(checked off)"]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("save-to-sheet error:", err);
    return res.status(500).json({ error: err.message });
  }
}
