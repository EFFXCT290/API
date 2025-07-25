"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

interface DashboardHeaderProps {
  user: {
    name: string;
    avatar: string;
    isAdmin: boolean;
  };
  stats: {
    ratio: string;
    uploaded: string;
    downloaded: string;
    hitAndRun: string;
    bonus: string;
  };
}



// Helper to get the correct avatar URL
function getAvatarUrl(avatarUrl: string | null | undefined, username?: string, email?: string) {
  if (!avatarUrl) return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || email || 'User')}&background=2563eb&color=fff`;
  if (avatarUrl.startsWith("/uploads/")) {
    return `${API_BASE_URL}${avatarUrl}`;
  }
  return avatarUrl;
}

export default function DashboardHeader({ user, stats }: DashboardHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [notifUnread, setNotifUnread] = useState(0);
  const [search, setSearch] = useState("");
  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/browse?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotifLoading(true);
      setNotifError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const notifs = Array.isArray(data) ? data : data.notifications || [];
        setNotifications(notifs);
        setNotifUnread(notifs.filter((n: any) => !n.read).length);
      } catch {
        setNotifError("Failed to load notifications.");
      } finally {
        setNotifLoading(false);
      }
    };
    
    // Always fetch notifications on mount to show badge
    fetchNotifications();
  }, []); // Remove notifOpen dependency to fetch on mount

  // Refresh notifications when dropdown opens (for fresh data)
  useEffect(() => {
    if (notifOpen) {
      const fetchNotifications = async () => {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          if (!token) return;
          const res = await fetch(`${API_BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const notifs = Array.isArray(data) ? data : data.notifications || [];
          setNotifications(notifs);
          setNotifUnread(notifs.filter((n: any) => !n.read).length);
        } catch {
          // Don't show error for refresh, just keep existing data
        }
      };
      fetchNotifications();
    }
  }, [notifOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (dropdownOpen || notifOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen, notifOpen]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setNotifUnread(notifUnread - 1);
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setNotifUnread(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <header className="w-full h-20 bg-gradient-to-r from-surface to-surface/95 backdrop-blur-lg border-b border-border/50 shadow-lg z-20 relative">
      <div className="h-full flex items-center justify-between px-8">
        {/* Left: Logo and name */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-text font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-200">
            L
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-text to-text/80 bg-clip-text text-primary">
            LA-REVO
          </span>
        </Link>

        {/* Center: Search bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleHeaderSearch} className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary z-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
              <path d="M11.412 8.586c.379.38.588.882.588 1.414h2a3.977 3.977 0 0 0-1.174-2.828c-1.514-1.512-4.139-1.512-5.652 0l1.412 1.416c.76-.758 2.07-.756 2.826-.002z"></path>
            </svg>
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search torrents, categories, users..." 
              className="w-full pl-12 pr-6 py-3 rounded-xl bg-background/50 border border-border/50 text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200 z-0"
            />
          </form>
        </div>

        {/* Right: Stats, notifications, user menu */}
        <div className="flex items-center gap-6">
          {/* User stats with modern cards */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-background/30 border border-border/30 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Ratio</div>
                <div className="text-sm font-bold text-primary">{stats.ratio}</div>
              </div>
              <div className="w-px h-8 bg-border/50"></div>
              <div className="text-center">
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Up</div>
                <div className="text-sm font-bold text-green-500">{stats.uploaded}</div>
              </div>
              <div className="w-px h-8 bg-border/50"></div>
              <div className="text-center">
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Down</div>
                <div className="text-sm font-bold text-blue-500">{stats.downloaded}</div>
              </div>
              <div className="w-px h-8 bg-border/50"></div>
              <div className="text-center">
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Bonus</div>
                <div className="text-sm font-bold text-yellow-500">{stats.bonus}</div>
              </div>
            </div>
          </div>

          {/* Upload button */}
          <button
            onClick={() => router.push('/dashboard/upload')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-text font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              className="relative p-3 rounded-xl hover:bg-primary/10 focus:outline-none transition-colors duration-200"
              onClick={() => setNotifOpen(v => !v)}
              aria-label="Notifications"
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-text text-xs font-bold flex items-center justify-center shadow-lg">
                  {notifUnread > 9 ? '9+' : notifUnread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-surface/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl z-50 py-2 max-h-96 overflow-y-auto">
                <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
                  <span className="font-semibold text-text">Notifications</span>
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                    Mark all as read
                  </button>
                </div>
                {notifLoading ? (
                  <div className="p-6 text-center text-text-secondary">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : notifError ? (
                  <div className="p-6 text-center text-error">{notifError}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-secondary">No notifications.</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`px-6 py-4 border-b border-border/20 flex items-start gap-3 hover:bg-primary/5 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-primary uppercase tracking-wide mb-1">{n.type}</div>
                        <div className="text-text mb-1 text-sm">{n.message}</div>
                        <div className="text-xs text-text-secondary">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
                <div className="px-6 py-4 text-center">
                  <Link href="/dashboard/notifications" className="text-primary hover:text-primary-dark transition-colors font-medium">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/30 border border-border/30 text-text hover:bg-primary/10 focus:outline-none transition-all duration-200 backdrop-blur-sm"
              onClick={() => setDropdownOpen((v) => !v)}
            >
              {user.avatar ? (
                <img src={getAvatarUrl(user.avatar, user.name)} alt="avatar" className="w-8 h-8 rounded-full border-2 border-primary/20" />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-text font-bold text-sm">
                  {user.name?.[0] || "U"}
                </div>
              )}
              <span className="font-semibold hidden sm:block">{user.name}</span>
              <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl z-50 py-2">
                <Link href="/dashboard/profile" className="flex items-center gap-3 px-6 py-3 text-text hover:bg-primary/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link href="/dashboard/admin" className="flex items-center gap-3 px-6 py-3 text-text hover:bg-primary/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-text-secondary/30 my-2"></div>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-6 py-3 text-error hover:bg-error/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 