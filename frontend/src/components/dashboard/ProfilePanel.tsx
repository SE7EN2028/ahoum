import { useRef, useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useApp } from "../../auth/AppContext";
import { api, type Me } from "../../lib/api";

export default function ProfilePanel() {
  const { user, token, setUser, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [role, setRole] = useState<Me["role"]>(user?.role ?? "USER");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const opts = { method: "PATCH" as const, token: token ?? undefined };
      if (avatarFile) {
        const fd = new FormData();
        fd.append("display_name", displayName);
        fd.append("bio", bio);
        fd.append("role", role);
        fd.append("avatar", avatarFile);
        return api<Me>("/me/", { ...opts, body: fd });
      }
      return api<Me>("/me/", { ...opts, body: { display_name: displayName, bio, role } });
    },
    onSuccess: (me) => {
      setUser(me);
      setAvatarFile(null);
      toast("Profile saved.");
    },
    onError: (e: Error) => toast(e.message),
  });

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const avatarSrc = preview || user?.avatar || null;
  const initials = (displayName || user?.email || "?").slice(0, 2).toUpperCase();
  const isCreator = role === "CREATOR";

  const field = { width: "100%", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", padding: "12px 14px", font: "400 .95rem 'Hanken Grotesk'", color: "var(--ink)", background: "var(--surface)", outline: "none" } as const;
  const label = { display: "block", font: "600 .8rem 'Hanken Grotesk'", color: "var(--ink-2)", marginBottom: 7 } as const;

  return (
    <div style={{ maxWidth: 560 }}>
      {/* avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        {avatarSrc ? (
          <img src={avatarSrc} alt="" style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover", border: "2px solid var(--line-2)" }} />
        ) : (
          <span style={{ display: "grid", placeItems: "center", width: 72, height: 72, borderRadius: 999, background: "var(--green-deep)", color: "var(--lime)", font: "700 1.4rem 'Hanken Grotesk'" }}>{initials}</span>
        )}
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} className="google-btn" style={{ height: 40, padding: "0 18px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .85rem 'Hanken Grotesk'", cursor: "pointer" }}>Change photo</button>
          <p style={{ color: "var(--muted)", fontSize: ".78rem", margin: "8px 0 0" }}>JPG or PNG, up to a few MB.</p>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={label}>Display name</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" style={field} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={label}>Email</label>
        <input value={user?.email ?? ""} disabled style={{ ...field, color: "var(--muted)", background: "var(--paper)" }} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={label}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="A line about your practice" style={{ ...field, resize: "vertical" }} />
      </div>

      {/* role */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--surface)", marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: ".95rem" }}>Creator mode</div>
          <div style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 2 }}>Host your own sessions and manage bookings.</div>
        </div>
        <button onClick={() => setRole(isCreator ? "USER" : "CREATOR")} aria-pressed={isCreator} style={{ flexShrink: 0, width: 52, height: 30, borderRadius: 999, border: "none", cursor: "pointer", background: isCreator ? "var(--green-deep)" : "var(--line-2)", position: "relative", transition: "background .2s var(--ease)" }}>
          <span style={{ position: "absolute", top: 3, left: isCreator ? 25 : 3, width: 24, height: 24, borderRadius: 999, background: "#fff", transition: "left .2s var(--ease)" }} />
        </button>
      </div>

      <button onClick={() => save.mutate()} disabled={save.isPending} className="u-lift" style={{ height: 48, padding: "0 26px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .92rem 'Hanken Grotesk'", cursor: save.isPending ? "default" : "pointer" }}>
        {save.isPending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
