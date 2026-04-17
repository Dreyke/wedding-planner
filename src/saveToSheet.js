// Shared utility — calls our Vercel serverless function
export async function saveToSheet({ itemLabel, phase, completedBy, fields }) {
  const res = await fetch("/api/save-to-sheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemLabel, phase, completedBy, fields }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return true;
}
