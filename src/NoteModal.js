import { useState } from "react";

const SHEET_ID = "1rz1x8CFf613_HjOUsDfxZ2DJ1W5IObc8c05tiCXLSfs";

async function saveToSheet({ itemName, phase, completedBy, vendor, cost, dateBooked, website, notes }) {
  const timestamp = new Date().toLocaleString();
  const userMsg = `Append a row to Google Sheets spreadsheet ID: ${SHEET_ID}, sheet tab: Sheet1.

If no header row exists yet, add this header first:
Timestamp | Phase | Checklist Item | Completed By | Vendor / Contact | Cost | Date Booked/Completed | Website / Link | Notes

Then append this row:
- Timestamp: ${timestamp}
- Phase: ${phase}
- Checklist Item: ${itemName}
- Completed By: ${completedBy || "Unknown"}
- Vendor / Contact: ${vendor || ""}
- Cost: ${cost || ""}
- Date Booked/Completed: ${dateBooked || ""}
- Website / Link: ${website || ""}
- Notes: ${notes || ""}

Use the Google Sheets tools available to you to write this data now.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      mcp_servers: [{ type: "url", url: "https://sheets.googleapis.com/mcp/v1", name: "google-sheets" }],
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const allText = (data.content || []).map(b => b.text || "").join(" ").toLowerCase();
  if (allText.includes("unable to") || allText.includes("failed")) throw new Error("Sheet write failed");
  return true;
}

export default function NoteModal({ item, phase, color, existingData, completedBy, onClose, onSaved }) {
  const [vendor, setVendor] = useState(existingData?.vendor || "");
  const [cost, setCost] = useState(existingData?.cost || "");
  const [dateBooked, setDateBooked] = useState(existingData?.dateBooked || "");
  const [website, setWebsite] = useState(existingData?.website || "");
  const [notes, setNotes] = useState(existingData?.notes || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveToSheet({ itemName: item, phase, completedBy, vendor, cost, dateBooked, website, notes });
      setStatus("success");
      setTimeout(() => onSaved({ vendor, cost, dateBooked, website, notes }), 900);
    } catch (e) {
      setErrorMsg(e.message || "Could not save to Google Sheets.");
      setStatus("error");
      setSaving(false);
    }
  };

  const inp = {
    width: "100%", padding: "10px 12px", border: "1px solid #ded8cf",
    borderRadius: 8, fontSize: 14, fontFamily: "Georgia, serif",
    color: "#2c2416", background: "#fdfaf7", boxSizing: "border-box", outline: "none",
  };
  const lbl = {
    fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#9a8a7a", marginBottom: 5, display: "block", fontFamily: "Georgia, serif",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(44,36,22,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#faf8f5", borderRadius: 16, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(44,36,22,0.35)", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #2c2416, #4a3728)", padding: "20px 24px", borderBottom: `3px solid ${color}` }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 6 }}>Log Details → Google Sheets</div>
          <div style={{ color: "#fdf6ec", fontSize: 15, lineHeight: 1.4 }}>{item}</div>
          <div style={{ color: "#9a8a6a", fontSize: 12, marginTop: 3, fontStyle: "italic" }}>{phase} · logged by {completedBy}</div>
        </div>

        {/* Form */}
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={lbl}>Vendor / Contact Name</label><input style={inp} placeholder="e.g. Jane Smith Photography" value={vendor} onChange={e => setVendor(e.target.value)} /></div>
          <div><label style={lbl}>Cost / Price Paid</label><input style={inp} placeholder="e.g. $2,500 deposit" value={cost} onChange={e => setCost(e.target.value)} /></div>
          <div><label style={lbl}>Date Booked or Completed</label><input style={inp} type="date" value={dateBooked} onChange={e => setDateBooked(e.target.value)} /></div>
          <div><label style={lbl}>Website or Link</label><input style={inp} placeholder="e.g. https://vendor.com" value={website} onChange={e => setWebsite(e.target.value)} /></div>
          <div><label style={lbl}>Notes</label><textarea style={{ ...inp, resize: "vertical", minHeight: 80 }} placeholder="Contract #, reminders, details…" value={notes} onChange={e => setNotes(e.target.value)} /></div>

          {status === "error" && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#b91c1c" }}>⚠ {errorMsg}</div>}
          {status === "success" && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#15803d", textAlign: "center" }}>✓ Saved to Google Sheets!</div>}
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #ede9e1", display: "flex", gap: 10, justifyContent: "flex-end", background: "#faf8f5" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ded8cf", background: "transparent", fontSize: 14, color: "#6a5a4a", cursor: "pointer", fontFamily: "Georgia, serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || status === "success"} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: saving || status === "success" ? "#aaa" : color, fontSize: 14, color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, minWidth: 150, justifyContent: "center" }}>
            {saving ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Saving…</> : status === "success" ? "✓ Saved!" : "Save to Sheets"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
