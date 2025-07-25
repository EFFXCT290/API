"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "torrents", label: "Active Torrents" },
  { key: "security", label: "Security" },
];

// Helper to get the correct avatar URL
function getAvatarUrl(avatarUrl: string | null | undefined, username?: string, email?: string) {
  if (!avatarUrl) return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || email || 'User')}&background=2563eb&color=fff`;
  if (avatarUrl.startsWith("/uploads/")) {
    return `${API_BASE_URL}${avatarUrl}`;
  }
  return avatarUrl;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rotating, setRotating] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [copyScrapeMsg, setCopyScrapeMsg] = useState("");
  const [copyPasskeyMsg, setCopyPasskeyMsg] = useState("");
  const [copyRssTokenMsg, setCopyRssTokenMsg] = useState("");
  const [section, setSection] = useState("overview");
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [showRssModal, setShowRssModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableMsg, setDisableMsg] = useState("");
  const [rssLoading, setRssLoading] = useState(false);
  const [rssMsg, setRssMsg] = useState("");
  const [rssToken, setRssToken] = useState("");
  const [activeTorrents, setActiveTorrents] = useState<{ seeding: any[]; leeching: any[] }>({ seeding: [], leeching: [] });
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const baseUrl = API_BASE_URL;

  // Avatar preview logic
  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = e => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(avatarFile);
    } else if (avatarUrl) {
      setAvatarPreview(avatarUrl);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarFile, avatarUrl]);

  const handleAvatarClick = useCallback(() => {
    setAvatarUrl("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError("");
    setShowAvatarModal(true);
  }, []);

  const handleAvatarSave = async () => {
    setAvatarError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAvatarError("You must be logged in.");
      return;
    }
    try {
      let avatarUrlResp = null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const res = await fetch(`${API_BASE_URL}/user/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload avatar");
        avatarUrlResp = (await res.json()).avatarUrl;
      } else if (avatarUrl) {
        const res = await fetch(`${API_BASE_URL}/user/avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: avatarUrl }),
        });
        if (!res.ok) throw new Error("Failed to set avatar URL");
        avatarUrlResp = (await res.json()).avatarUrl;
      } else {
        setAvatarError("Please provide an image file or URL.");
        return;
      }
      // Refetch profile after avatar change
      await fetchProfile();
      setShowAvatarModal(false);
      setAvatarFile(null);
      setAvatarUrl("");
      setAvatarPreview(null);
    } catch (err: any) {
      setAvatarError(err.message || "Failed to update avatar.");
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarUrl("");
    }
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    setAvatarFile(null);
  };

  // Move fetchProfile to top-level so it can be called from anywhere
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      // Fetch profile
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      // Fetch RSS token
      const rssRes = await fetch(`${API_BASE_URL}/user/rss-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rssRes.ok) {
        const rssData = await rssRes.json();
        setRssToken(rssData.rssToken);
      }
      // Fetch active torrents
      const torrentsRes = await fetch(`${API_BASE_URL}/user/active-torrents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (torrentsRes.ok) {
        const torrentsData = await torrentsRes.json();
        setActiveTorrents({ seeding: torrentsData.seeding || [], leeching: torrentsData.leeching || [] });
      }
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // useEffect to fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleCopy = (text: string, setMsg: (msg: string) => void) => {
    navigator.clipboard.writeText(text);
    setMsg("Copied!");
    setTimeout(() => setMsg(""), 1200);
  };

  const handleRotatePasskey = async () => {
    setRotating(true);
    setError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/rotate-passkey`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to rotate passkey");
      const data = await res.json();
      setProfile((p: any) => ({ ...p, passkey: data.passkey }));
    } catch {
      setError("Failed to rotate passkey.");
    } finally {
      setRotating(false);
    }
  };

  const handleResetRssToken = async () => {
    setRssLoading(true);
    setRssMsg("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/rss-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to reset RSS token");
      const data = await res.json();
      setRssToken(data.rssToken);
      setRssMsg("RSS token reset successfully");
      setTimeout(() => setRssMsg(""), 1200);
    } catch {
      setRssMsg("Failed to reset RSS token");
    } finally {
      setRssLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("All fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("New passwords do not match.");
      return;
    }
    setPwdLoading(true);
    // TODO: Call backend API for password change
    setTimeout(() => {
      setPwdLoading(false);
      setPwdSuccess("Password changed successfully (placeholder)");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => setShowPwdModal(false), 1200);
    }, 1000);
  };

  const handleDisableAccount = async () => {
    setDisableLoading(true);
    setDisableMsg("");
    setError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setDisableMsg("You must be logged in.");
      setDisableLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/user/disable`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to disable account");
      setDisableMsg("Account disabled. You will be logged out.");
      setTimeout(() => {
        localStorage.removeItem("token");
        router.replace("/login");
      }, 1500);
    } catch (err: any) {
      setDisableMsg("");
      setError(err.message || "Failed to disable account.");
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto flex gap-10">
        {/* Sidebar */}
        <aside className="w-72 bg-surface/50 backdrop-blur-lg border border-border/50 rounded-2xl shadow-xl flex flex-col items-center py-10 gap-8">
          {/* Avatar with edit overlay */}
          <div
            className="relative group w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold cursor-pointer overflow-hidden"
            onClick={handleAvatarClick}
          >
            {avatarPreview ? (
              <img src={getAvatarUrl(avatarPreview, profile?.username, profile?.email)} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              profile?.avatarUrl ? (
                <img src={getAvatarUrl(profile.avatarUrl, profile?.username, profile?.email)} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                profile?.username?.[0] || profile?.email?.[0] || "U"
              )
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-4.243 1.415 1.415-4.243a4 4 0 01.94-1.414z" /></svg>
            </div>
          </div>
          {/* User info */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-lg font-bold text-text">{profile?.username}</div>
            <div className="text-xs text-text-secondary">{profile?.email}</div>
            <div className="text-xs text-primary">{profile?.role}</div>
            <div className="text-xs text-text">Status: {profile?.status || '—'}</div>
            <div className="text-xs text-text">Rank: {profile?.rank || '—'}</div>
          </div>
          {/* Section links */}
          <nav className="flex flex-col w-full gap-2 mt-4">
            {SECTIONS.map(s => (
              <button
                key={s.key}
                className={`w-full text-left px-6 py-2 rounded transition font-medium ${section === s.key ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-text"}`}
                onClick={() => setSection(s.key)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1">
          <div className="mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">Profile</h1>
            <p className="text-text-secondary">Manage your account, security, and activity</p>
          </div>
          {loading ? (
            <div className="text-center text-text-secondary py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-error py-8">{error}</div>
          ) : !profile ? (
            <div className="text-center text-text-secondary py-8">Profile not found.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {section === "overview" && (
                <>
                  {/* Announce/Scrape Card */}
                  <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8 flex flex-col gap-2 w-full max-w-2xl">
                    <div className="flex items-center gap-2 py-1">
                      <span className="font-semibold flex-shrink-0 text-text">Announce URL:</span>
                      <span className="font-mono text-xs text-text-secondary truncate whitespace-nowrap w-full">{`${API_BASE_URL}/announce?passkey=••••••••••••••••••••••••••••••••`}</span>
                      <button className="ml-2 text-primary hover:underline text-xs flex-shrink-0" onClick={() => profile && profile.passkey && handleCopy(`${API_BASE_URL}/announce?passkey=${profile.passkey}`, setCopyMsg)} disabled={!profile || !profile.passkey}>{copyMsg || "Copy"}</button>
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <span className="font-semibold flex-shrink-0 text-text">Scrape URL:</span>
                      <span className="font-mono text-xs text-text-secondary truncate whitespace-nowrap w-full">{`${API_BASE_URL}/scrape?passkey=••••••••••••••••••••••••••••••••`}</span>
                      <button className="ml-2 text-primary hover:underline text-xs flex-shrink-0" onClick={() => profile && profile.passkey && handleCopy(`${API_BASE_URL}/scrape?passkey=${profile.passkey}`, setCopyScrapeMsg)} disabled={!profile || !profile.passkey}>{copyScrapeMsg || "Copy"}</button>
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <span className="font-semibold flex-shrink-0 text-text">RSS Feed URL:</span>
                      <span className="font-mono text-xs text-text-secondary truncate whitespace-nowrap w-full">{`${API_BASE_URL}/rss/••••••••••••••••••••••••••••••••`}</span>
                      <button className="ml-2 text-primary hover:underline text-xs flex-shrink-0" onClick={() => rssToken && handleCopy(`${API_BASE_URL}/rss/${rssToken}`, setCopyRssTokenMsg)} disabled={!rssToken}>{copyRssTokenMsg || "Copy"}</button>
                    </div>
                  </div>
                  {/* Stats Card */}
                  <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8 grid grid-cols-2 gap-4">
                    <div><span className="font-semibold text-text">Ratio:</span> <span className="text-primary">{profile.ratio}</span></div>
                    <div><span className="font-semibold text-text">Bonus Points:</span> <span className="text-primary">{profile.bonusPoints}</span></div>
                    <div><span className="font-semibold text-text">Uploaded:</span> <span className="text-primary">{profile.upload}</span></div>
                    <div><span className="font-semibold text-text">Downloaded:</span> <span className="text-primary">{profile.download}</span></div>
                    <div><span className="font-semibold text-text">Hit & Run Count:</span> <span className="text-error">{profile.hitAndRunCount}</span></div>
                    <div><span className="font-semibold text-text">Email Verified:</span> <span className="text-green">{profile.emailVerified ? "Yes" : "No"}</span></div>
                  </div>
                </>
              )}
              {section === "torrents" && (
                <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8">
                  <div className="font-semibold text-primary mb-2">Active Torrents</div>
                  <div className="mb-4">
                    <span className="font-semibold text-text">Seeding:</span>
                    {activeTorrents.seeding.length === 0 ? (
                      <span className="ml-2 text-text-secondary">None</span>
                    ) : (
                      <ul className="ml-4 list-disc">
                        {activeTorrents.seeding.map(t => (
                          <li key={t.id} className="text-sm">{t.name} <span className="text-xs text-text-tertiary">({t.infoHash})</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-text">Leeching:</span>
                    {activeTorrents.leeching.length === 0 ? (
                      <span className="ml-2 text-text-secondary">None</span>
                    ) : (
                      <ul className="ml-4 list-disc">
                        {activeTorrents.leeching.map(t => (
                          <li key={t.id} className="text-sm">{t.name} <span className="text-xs text-text-tertiary">({t.infoHash})</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              {section === "security" && (
                <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8 flex flex-col gap-4">
                  <div className="font-semibold text-primary mb-2">Security</div>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition text-sm w-max" onClick={() => setShowPwdModal(true)}>Change Password</button>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition text-sm w-max" onClick={() => setShowPasskeyModal(true)}>Manage Passkey</button>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition text-sm w-max" onClick={() => setShowRssModal(true)}>Manage RSS Token</button>
                  <button className="bg-error text-white px-4 py-2 rounded hover:bg-error/90 transition text-sm w-max" onClick={() => setShowDisableModal(true)}>Disable Account</button>
                  <div className="text-xs text-text-secondary">You cannot change your email or username for security reasons.</div>
                </div>
              )}
            </div>
          )}
          {/* Change Password Modal */}
          {showPwdModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div ref={modalRef} className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primary">Change Password</h2>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="px-3 py-2 rounded border border-border bg-background text-text"
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    autoFocus
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="px-3 py-2 rounded border border-border bg-background text-text"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="px-3 py-2 rounded border border-border bg-background text-text"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                  />
                  {pwdError && <div className="text-error text-sm">{pwdError}</div>}
                  {pwdSuccess && <div className="text-success text-sm">{pwdSuccess}</div>}
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition" disabled={pwdLoading}>{pwdLoading ? "Changing..." : "Change Password"}</button>
                    <button type="button" className="bg-border text-text px-4 py-2 rounded hover:bg-background transition" onClick={() => setShowPwdModal(false)} disabled={pwdLoading}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Passkey Modal */}
          {showPasskeyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primary">Manage Passkey</h2>
                <div className="mb-4 flex items-center gap-2">
                  <span className="font-mono text-xs text-text truncate whitespace-nowrap w-full">{profile?.passkey}</span>
                  <button className="ml-2 text-primary hover:underline text-xs flex-shrink-0" onClick={() => profile && profile.passkey && handleCopy(profile.passkey, setCopyPasskeyMsg)} disabled={!profile || !profile.passkey}>{copyPasskeyMsg || "Copy"}</button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition" onClick={handleRotatePasskey} disabled={rotating}>{rotating ? "Resetting..." : "Reset Passkey"}</button>
                  <button className="bg-border text-text px-4 py-2 rounded hover:bg-background transition" onClick={() => setShowPasskeyModal(false)} disabled={rotating}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* RSS Token Modal */}
          {showRssModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primary">Manage RSS Token</h2>
                <div className="mb-4 flex items-center gap-2">
                  <span className="font-mono text-xs text-text truncate whitespace-nowrap w-full">{rssToken}</span>
                  <button className="ml-2 text-primary hover:underline text-xs flex-shrink-0" onClick={() => rssToken && handleCopy(rssToken, setCopyRssTokenMsg)} disabled={!rssToken}>{copyRssTokenMsg || "Copy"}</button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition" onClick={handleResetRssToken} disabled={rssLoading}>{rssLoading ? "Resetting..." : "Reset RSS Token"}</button>
                  <button className="bg-border text-text px-4 py-2 rounded hover:bg-background transition" onClick={() => setShowRssModal(false)} disabled={rssLoading}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* Disable Account Modal */}
          {showDisableModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-error">Disable Account</h2>
                <p className="mb-4 text-text">Are you sure you want to disable your account? This action is <span className='text-error font-semibold'>irreversible</span> and you will not be able to log in until re-enabled by an admin.</p>
                {disableMsg && <div className="text-success text-sm mb-2">{disableMsg}</div>}
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-error text-white px-4 py-2 rounded hover:bg-error/90 transition"
                    disabled={disableLoading}
                    onClick={handleDisableAccount}
                  >
                    {disableLoading ? "Disabling..." : "Disable Account"}
                  </button>
                  <button
                    className="bg-border text-text px-4 py-2 rounded hover:bg-background transition"
                    onClick={() => setShowDisableModal(false)}
                    disabled={disableLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Change Avatar Modal */}
          {showAvatarModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primary">Change Avatar</h2>
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-medium">Image URL</label>
                  <input
                    type="text"
                    className="px-3 py-2 rounded border border-border bg-background text-text"
                    placeholder="https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={handleAvatarUrlChange}
                    disabled={!!avatarFile}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Or upload file</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={!!avatarUrl}
                    />
                  </div>
                  {avatarPreview && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-text-tertiary">Preview:</span>
                      <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-border" />
                    </div>
                  )}
                  {avatarError && <div className="text-error text-sm">{avatarError}</div>}
                  <div className="flex gap-2 mt-2">
                    <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition" onClick={handleAvatarSave}>Save</button>
                    <button className="bg-border text-text px-4 py-2 rounded hover:bg-background transition" onClick={() => setShowAvatarModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 