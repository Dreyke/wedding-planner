import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";
import { sections } from "./sections";
import NoteModal from "./NoteModal";

const USER_KEY = "wedding_planner_user";

const AVATAR_COLORS = ["#c9a96e", "#a8c5a0", "#9bb5d6", "#c9a0c5", "#d6a88e", "#e8a0a0", "#a0c5c5", "#b0a0d6"];

function getAvatarColor(name) {
  if (!name) return "#ccc";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = 28 }) {
  const color = getAvatarColor(name);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, color: "#fff", fontWeight: 700, flexShrink: 0, fontFamily: "Georgia, serif", border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}

function UserSetup({ onComplete }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Guest");
  const roles = ["Partner 1 (You)", "Partner 2 (Fiancé/e)", "Mother of Bride", "Mother of Groom", "Father of Bride", "Father of Groom", "Maid of Honor", "Best Man", "Bridesmaid", "Groomsman", "Wedding Planner", "Other"];

  const handleSubmit = () => {
    if (!name.trim()) return;
    const user = { name: name.trim(), role };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    onComplete(user);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #2c2416 0%, #4a3728 60%, #2c2416 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif" }}>
      <div style={{ background: "#faf8f5", borderRadius: 20, padding: 40, maxWidth: 420, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💍</div>
        <h1 style={{ fontSize: 26, fontWeight: 400, color: "#2c2416", marginBottom: 6 }}>Welcome!</h1>
        <p style={{ color: "#9a8a7a", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Tell us who you are so we can track contributions across the planning team.</p>

        <div style={{ textAlign: "left", marginBottom: 18 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8a7a", display: "block", marginBottom: 6 }}>Your Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. Sarah"
            autoFocus
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #ded8cf", borderRadius: 10, fontSize: 15, fontFamily: "Georgia, serif", color: "#2c2416", background: "#fdfaf7", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ textAlign: "left", marginBottom: 28 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8a7a", display: "block", marginBottom: 6 }}>Your Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #ded8cf", borderRadius: 10, fontSize: 15, fontFamily: "Georgia, serif", color: "#2c2416", background: "#fdfaf7", outline: "none", boxSizing: "border-box" }}
          >
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: name.trim() ? "#c9a96e" : "#ddd", color: "#fff", fontSize: 16, fontFamily: "Georgia, serif", fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}
        >
          Enter Planner →
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});   // { key: { completedBy, completedAt } }
  const [savedNotes, setSavedNotes] = useState({});       // { key: { vendor, cost, ... } }
  const [activeUsers, setActiveUsers] = useState({});     // { key: [names] } — who's online
  const [openSection, setOpenSection] = useState("immediate");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Subscribe to Firebase checked items
  useEffect(() => {
    const unsub = onValue(ref(db, "checkedItems"), snap => {
      setCheckedItems(snap.val() || {});
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firebase notes
  useEffect(() => {
    const unsub = onValue(ref(db, "notes"), snap => {
      setSavedNotes(snap.val() || {});
    });
    return () => unsub();
  }, []);

  // Track presence — write current user to activeUsers, clean up on unmount
  useEffect(() => {
    if (!currentUser) return;
    const presenceKey = currentUser.name.replace(/[.#$[\]]/g, "_");
    const presenceRef = ref(db, `presence/${presenceKey}`);
    set(presenceRef, { name: currentUser.name, role: currentUser.role, lastSeen: Date.now() });
    const unsub = onValue(ref(db, "presence"), snap => {
      setActiveUsers(snap.val() || {});
    });
    return () => {
      unsub();
      set(presenceRef, null);
    };
  }, [currentUser]);

  const handleCheck = async (section, i) => {
    const key = `${section.id}-${i}`;
    const alreadyChecked = !!checkedItems[key];
    if (alreadyChecked) {
      // Uncheck — remove from Firebase
      await set(ref(db, `checkedItems/${key}`), null);
      await set(ref(db, `notes/${key}`), null);
    } else {
      // Check — write to Firebase + open modal
      await set(ref(db, `checkedItems/${key}`), {
        completedBy: currentUser.name,
        completedByRole: currentUser.role,
        completedAt: new Date().toLocaleString(),
      });
      setModal({ key, item: section.items[i], phase: section.label, color: section.color });
    }
  };

  const handleSaved = async (key, noteData) => {
    await set(ref(db, `notes/${key}`), noteData);
    setModal(null);
  };

  const sectionProgress = (section) => {
    const done = section.items.filter((_, i) => checkedItems[`${section.id}-${i}`]).length;
    return { done, total: section.items.length };
  };

  const totalDone = sections.reduce((acc, s) => acc + sectionProgress(s).done, 0);
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const overallPct = Math.round((totalDone / totalItems) * 100);

  const onlineUsers = Object.values(activeUsers);

  if (!currentUser) return <UserSetup onComplete={setCurrentUser} />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#faf8f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#9a8a7a", fontSize: 16 }}>
      Loading your planner… 💍
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5", fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #2c2416 0%, #4a3728 50%, #2c2416 100%)", padding: "40px 32px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Online users + current user */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            {/* Who's online */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {onlineUsers.slice(0, 6).map((u, i) => (
                <div key={i} title={`${u.name} (${u.role})`} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                  <Avatar name={u.name} size={30} />
                </div>
              ))}
              {onlineUsers.length > 0 && (
                <span style={{ color: "#7a6a5a", fontSize: 11, marginLeft: 8 }}>
                  {onlineUsers.map(u => u.name).join(", ")} online
                </span>
              )}
            </div>
            {/* Current user */}
            <button
              onClick={() => { localStorage.removeItem(USER_KEY); setCurrentUser(null); }}
              title="Switch user"
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 12px 5px 5px", cursor: "pointer" }}
            >
              <Avatar name={currentUser.name} size={26} />
              <span style={{ color: "#c9a96e", fontSize: 12 }}>{currentUser.name}</span>
            </button>
          </div>

          <div style={{ fontSize: 12, letterSpacing: "0.35em", color: "#c9a96e", textTransform: "uppercase", marginBottom: 10 }}>Our Wedding Planner</div>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 46px)", color: "#fdf6ec", fontWeight: 400, margin: "0 0 6px", letterSpacing: "0.02em" }}>From Yes to I Do</h1>
          <div style={{ color: "#7a6a5a", fontSize: 12, marginBottom: 26 }}>✦ Real-time · Shared · Every step along the way</div>

          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#c9a96e", fontSize: 12, letterSpacing: "0.1em" }}>OVERALL PROGRESS</span>
              <span style={{ color: "#fdf6ec", fontSize: 12, fontWeight: 600 }}>{totalDone} / {totalItems}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 99 }}>
              <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", width: `${overallPct}%`, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ color: "#a0906e", fontSize: 11, marginTop: 5, textAlign: "right" }}>{overallPct}% complete</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", overflowX: "auto", background: "#fff", borderBottom: "1px solid #ede9e1", scrollbarWidth: "none" }}>
        {sections.map(s => {
          const { done, total } = sectionProgress(s);
          const active = openSection === s.id;
          return (
            <button key={s.id} onClick={() => setOpenSection(s.id)} style={{ flex: "0 0 auto", padding: "13px 18px", background: "none", border: "none", borderBottom: active ? `3px solid ${s.color}` : "3px solid transparent", cursor: "pointer", textAlign: "center", minWidth: 105, transition: "all 0.2s" }}>
              <div style={{ fontSize: 17, marginBottom: 2 }}>{s.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: active ? "#2c2416" : "#8a7a6a", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: done === total && total > 0 ? s.color : "#bbb", marginTop: 2 }}>{done}/{total}</div>
            </button>
          );
        })}
      </div>

      {/* ── Active Section ── */}
      {sections.filter(s => s.id === openSection).map(section => {
        const { done, total } = sectionProgress(section);
        const pct = Math.round((done / total) * 100);
        return (
          <div key={section.id} style={{ maxWidth: 720, margin: "0 auto", padding: "26px 20px 60px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{section.emoji}</span>
                  <h2 style={{ margin: 0, fontSize: 21, fontWeight: 400, color: "#2c2416" }}>{section.label}</h2>
                </div>
                <div style={{ fontSize: 12, color: "#9a8a7a", marginTop: 2, marginLeft: 32, fontStyle: "italic" }}>{section.sublabel}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: section.color }}>{pct}%</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{done} of {total}</div>
              </div>
            </div>

            <div style={{ height: 4, background: "#ede9e1", borderRadius: 99, marginBottom: 22 }}>
              <div style={{ height: "100%", borderRadius: 99, background: section.color, width: `${pct}%`, transition: "width 0.4s ease" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {section.items.map((item, i) => {
                const key = `${section.id}-${i}`;
                const checkData = checkedItems[key];
                const isDone = !!checkData;
                const note = savedNotes[key];
                return (
                  <div key={i} style={{ background: isDone ? `${section.color}10` : "#fff", border: `1px solid ${isDone ? section.color + "55" : "#ede9e1"}`, borderRadius: 10, overflow: "hidden", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px" }}>
                      {/* Checkbox */}
                      <div
                        onClick={() => handleCheck(section, i)}
                        style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${isDone ? section.color : "#ccc"}`, background: isDone ? section.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, cursor: "pointer", transition: "all 0.2s" }}
                      >
                        {isDone && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>

                      {/* Label + completed-by */}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, lineHeight: 1.5, color: isDone ? "#9a8a7a" : "#2c2416", textDecoration: isDone ? "line-through" : "none", transition: "all 0.2s" }}>
                          {item}
                        </span>
                        {isDone && checkData && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <Avatar name={checkData.completedBy} size={18} />
                            <span style={{ fontSize: 11, color: "#9a8a7a" }}>
                              {checkData.completedBy} · {checkData.completedAt}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Note button */}
                      <button
                        onClick={() => setModal({ key, item, phase: section.label, color: section.color })}
                        style={{ flexShrink: 0, background: note ? `${section.color}20` : "#f7f4f0", border: `1px solid ${note ? section.color + "66" : "#e0dbd4"}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: note ? section.color : "#aaa", fontFamily: "Georgia, serif", transition: "all 0.2s", whiteSpace: "nowrap" }}
                      >
                        {note ? "📋 Details" : "📝 Add"}
                      </button>
                    </div>

                    {/* Note preview */}
                    {note && (
                      <div style={{ padding: "0 14px 11px 50px", display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "center" }}>
                        {note.vendor && <span style={{ fontSize: 12, color: "#6a5a4a" }}>👤 {note.vendor}</span>}
                        {note.cost && <span style={{ fontSize: 12, color: "#6a5a4a" }}>💰 {note.cost}</span>}
                        {note.dateBooked && <span style={{ fontSize: 12, color: "#6a5a4a" }}>📅 {note.dateBooked}</span>}
                        {note.website && <a href={note.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: section.color }}>🔗 Link</a>}
                        {note.notes && <span style={{ fontSize: 12, color: "#8a7a6a", fontStyle: "italic" }}>"{note.notes.slice(0, 55)}{note.notes.length > 55 ? "…" : ""}"</span>}
                        <span style={{ fontSize: 11, color: "#bbb", marginLeft: "auto" }}>✓ In Sheet</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {done === total && total > 0 && (
              <div style={{ marginTop: 22, padding: "14px 20px", background: `${section.color}18`, border: `1px solid ${section.color}55`, borderRadius: 10, textAlign: "center", color: section.color, fontSize: 14, fontStyle: "italic" }}>
                ✓ All done in this section — amazing!
              </div>
            )}
          </div>
        );
      })}

      {/* ── Footer ── */}
      <div style={{ background: "#2c2416", color: "#9a8a6a", textAlign: "center", padding: "22px", fontSize: 11, letterSpacing: "0.12em" }}>
        YOUR BIG DAY IS COMING ✦ ENJOY EVERY MOMENT OF THE JOURNEY
      </div>

      {/* ── Modal ── */}
      {modal && (
        <NoteModal
          item={modal.item}
          phase={modal.phase}
          color={modal.color}
          existingData={savedNotes[modal.key]}
          completedBy={currentUser.name}
          onClose={() => setModal(null)}
          onSaved={(data) => handleSaved(modal.key, data)}
        />
      )}
    </div>
  );
}
