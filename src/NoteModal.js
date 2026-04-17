import { useState } from "react";
import { saveToSheet } from "./saveToSheet";

const inp = (extra = {}) => ({
  width: "100%", padding: "10px 12px", border: "1px solid #ded8cf",
  borderRadius: 8, fontSize: 14, fontFamily: "Georgia, serif",
  color: "#2c2416", background: "#fdfaf7", boxSizing: "border-box", outline: "none",
  ...extra,
});
const lbl = { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8a7a", marginBottom: 5, display: "block", fontFamily: "Georgia, serif" };

function VendorForm({ data, onChange }) {
  const field = (key, label, placeholder, type = "text") => (
    <div key={key}>
      <label style={lbl}>{label}</label>
      {type === "textarea"
        ? <textarea style={inp({ resize: "vertical", minHeight: 72 })} placeholder={placeholder} value={data[key] || ""} onChange={e => onChange(key, e.target.value)} />
        : <input style={inp()} type={type} placeholder={placeholder} value={data[key] || ""} onChange={e => onChange(key, e.target.value)} />}
    </div>
  );
  return (
    <>
      {field("name", "Name (optional)", "e.g. Jane Smith")}
      {field("email", "Email (optional)", "e.g. jane@email.com", "email")}
      {field("phone", "Phone number (optional)", "e.g. (612) 555-0100", "tel")}
      {field("cost", "Cost / Price Paid (optional)", "e.g. $2,500")}
      {field("notes", "Notes (optional)", "Contract #, reminders…", "textarea")}
    </>
  );
}

function BudgetForm({ data, onChange }) {
  return (
    <>
      <div><label style={lbl}>Minimum Budget</label><input style={inp()} type="text" placeholder="e.g. $20,000" value={data.min || ""} onChange={e => onChange("min", e.target.value)} /></div>
      <div><label style={lbl}>Maximum Budget</label><input style={inp()} type="text" placeholder="e.g. $35,000" value={data.max || ""} onChange={e => onChange("max", e.target.value)} /></div>
    </>
  );
}

function CustomForm({ fields, data, onChange }) {
  return (
    <>
      {fields.map(f => (
        <div key={f.key}>
          <label style={lbl}>{f.label}{f.required ? " *" : ""}</label>
          {f.type === "textarea"
            ? <textarea style={inp({ resize: "vertical", minHeight: 72 })} placeholder={f.placeholder} value={data[f.key] || ""} onChange={e => onChange(f.key, e.target.value)} required={f.required} />
            : <input style={inp()} type={f.type || "text"} placeholder={f.placeholder} value={data[f.key] || ""} onChange={e => onChange(f.key, e.target.value)} required={f.required} />}
        </div>
      ))}
    </>
  );
}

function DelegatesForm({ data, onChange }) {
  const rows = data.rows || [{ name: "", assignment: "" }];
  const update = (i, key, val) => onChange("rows", rows.map((r, ri) => ri === i ? { ...r, [key]: val } : r));
  const addRow = () => onChange("rows", [...rows, { name: "", assignment: "" }]);
  const removeRow = i => onChange("rows", rows.filter((_, ri) => ri !== i));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: 6, marginBottom: 6 }}>
        <span style={{ ...lbl, marginBottom: 0 }}>Name</span>
        <span style={{ ...lbl, marginBottom: 0 }}>Assignment</span>
        <span />
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: 6, marginBottom: 6 }}>
          <input style={inp()} placeholder="Name" value={row.name} onChange={e => update(i, "name", e.target.value)} />
          <input style={inp()} placeholder="Task or role" value={row.assignment} onChange={e => update(i, "assignment", e.target.value)} />
          <button onClick={() => removeRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16, padding: 0 }}>✕</button>
        </div>
      ))}
      <button onClick={addRow} style={{ marginTop: 4, padding: "7px 14px", borderRadius: 7, border: "1px dashed #c9a96e", background: "transparent", color: "#c9a96e", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>+ Add Delegate</button>
    </div>
  );
}

function VendorsTableForm({ data, onChange }) {
  const rows = data.rows || [{ name: "", phone: "", email: "", type: "" }];
  const update = (i, key, val) => onChange("rows", rows.map((r, ri) => ri === i ? { ...r, [key]: val } : r));
  const addRow = () => onChange("rows", [...rows, { name: "", phone: "", email: "", type: "" }]);
  const removeRow = i => onChange("rows", rows.filter((_, ri) => ri !== i));
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 28px", gap: 6, marginBottom: 6, minWidth: 480 }}>
        {["Name", "Phone #", "Email", "Vendor Type", ""].map(h => <span key={h} style={{ ...lbl, marginBottom: 0 }}>{h}</span>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 28px", gap: 6, marginBottom: 6, minWidth: 480 }}>
          <input style={inp()} placeholder="Name" value={row.name} onChange={e => update(i, "name", e.target.value)} />
          <input style={inp()} placeholder="Phone" type="tel" value={row.phone} onChange={e => update(i, "phone", e.target.value)} />
          <input style={inp()} placeholder="Email" type="email" value={row.email} onChange={e => update(i, "email", e.target.value)} />
          <input style={inp()} placeholder="e.g. Florist" value={row.type} onChange={e => update(i, "type", e.target.value)} />
          <button onClick={() => removeRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16, padding: 0 }}>✕</button>
        </div>
      ))}
      <button onClick={addRow} style={{ marginTop: 4, padding: "7px 14px", borderRadius: 7, border: "1px dashed #9bb5d6", background: "transparent", color: "#9bb5d6", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>+ Add Vendor</button>
    </div>
  );
}

export default function NoteModal({ item, phase, color, existingData, completedBy, onClose, onSaved }) {
  const [data, setData] = useState(existingData || {});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    if (item.modal === "custom" && item.fields) {
      for (const f of item.fields) {
        if (f.required && !data[f.key]) return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) { setErrorMsg("Please fill in all required fields."); return; }
    setSaving(true); setStatus(null); setErrorMsg("");
    try {
      await saveToSheet({ itemLabel: item.label, phase, completedBy, fields: data });
      setStatus("success");
      setTimeout(() => onSaved(data), 800);
    } catch (e) {
      setErrorMsg(e.message || "Could not save to Google Sheets.");
      setStatus("error");
      setSaving(false);
    }
  };

  const renderForm = () => {
    switch (item.modal) {
      case "vendor":        return <VendorForm data={data} onChange={update} />;
      case "budget":        return <BudgetForm data={data} onChange={update} />;
      case "custom":        return <CustomForm fields={item.fields} data={data} onChange={update} />;
      case "delegates":     return <DelegatesForm data={data} onChange={update} />;
      case "vendors_table": return <VendorsTableForm data={data} onChange={update} />;
      default:              return null;
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(44,36,22,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#faf8f5", borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(44,36,22,0.35)", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "linear-gradient(135deg, #2c2416, #4a3728)", padding: "20px 24px", borderBottom: `3px solid ${color}` }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 6 }}>Add Details → Google Sheets</div>
          <div style={{ color: "#fdf6ec", fontSize: 15, lineHeight: 1.4 }}>{item.label}</div>
          <div style={{ color: "#9a8a6a", fontSize: 12, marginTop: 3, fontStyle: "italic" }}>{phase} · logged by {completedBy}</div>
        </div>
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {renderForm()}
          {errorMsg && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#b91c1c" }}>⚠ {errorMsg}</div>}
          {status === "success" && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#15803d", textAlign: "center" }}>✓ Saved to Google Sheets!</div>}
        </div>
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
