"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [torrents, setTorrents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinned, setPinned] = useState<any>(null);
  const [pinnedLoading, setPinnedLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE_URL}/torrent/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setTorrents(data.torrents || []))
      .catch(() => setError("Failed to load torrents."))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    setPinnedLoading(true);
    fetch(`${API_BASE_URL}/announcements?pinned=true&limit=1`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load"))
      .then(data => {
        const anns = Array.isArray(data) ? data : data.announcements || [];
        setPinned(anns.length > 0 ? anns[0] : null);
      })
      .catch(() => setPinned(null))
      .finally(() => setPinnedLoading(false));
  }, []);

  function formatBytes(bytes: number | string) {
    const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (!num || num === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const getStatusColor = (seeders: number, leechers: number) => {
    if (seeders === 0) return "text-red-500";
    if (seeders < 5) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Pinned Announcement */}
        {pinnedLoading ? (
          <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-lg animate-pulse">
            <div className="h-6 bg-border/30 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-border/30 rounded w-full mb-2"></div>
            <div className="h-4 bg-border/30 rounded w-2/3"></div>
          </div>
        ) : pinned ? (
          <Link 
            href={`/dashboard/announcements/${pinned.id}`} 
            className="block bg-gradient-to-r from-primary/10 to-primary-dark/10 backdrop-blur-lg rounded-2xl border-2 border-primary/30 p-6 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                    Pinned
                  </span>
                  <div className="text-xs text-text-secondary">
                    {new Date(pinned.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {pinned.title}
                </h3>
                <p className="text-text-secondary line-clamp-2">
                  {pinned.content || pinned.body}
                </p>
              </div>
              <svg className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ) : null}

        {/* Main Content */}
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent">
                  Latest Torrents
                </h2>
                <p className="text-text-secondary mt-1">Discover the newest additions to our tracker</p>
              </div>
              <Link
                href="/dashboard/browse"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Browse All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 rounded-xl bg-background/30 animate-pulse">
                    <div className="w-12 h-12 bg-border/30 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-border/30 rounded w-1/3"></div>
                      <div className="h-4 bg-border/30 rounded w-full"></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-border/30 rounded w-16"></div>
                      <div className="h-4 bg-border/30 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-error mb-2">Failed to Load</div>
              <div className="text-text-secondary">{error}</div>
            </div>
          ) : torrents.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">No Torrents Found</div>
              <div className="text-text-secondary">Be the first to upload a torrent!</div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {torrents.slice(0, 2).map((torrent, index) => (
                <div
                  key={torrent.id}
                  className="p-6 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
                  onClick={e => {
                    if ((window.getSelection()?.toString() ?? "") !== "") return;
                    router.push(`/dashboard/${torrent.id}`);
                  }}
                >
                  <div className="flex items-center gap-6">
                    {/* Torrent Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-text group-hover:text-primary transition-colors truncate">
                          {torrent.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {torrent.category || 'General'}
                          </span>
                          {torrent.featured && (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-medium rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-1 mb-2">
                        {torrent.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>Uploaded {new Date(torrent.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>By {torrent.uploader?.username || 'Anonymous'}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-text">{formatBytes(torrent.size)}</div>
                        <div className="text-xs text-text-secondary">Size</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${getStatusColor(torrent.seeders || 0, torrent.leechers || 0)}`}>
                          {torrent.seeders || 0}
                        </div>
                        <div className="text-xs text-text-secondary">Seeders</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-500">{torrent.leechers || 0}</div>
                        <div className="text-xs text-text-secondary">Leechers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-text">{torrent.completed || 0}</div>
                        <div className="text-xs text-text-secondary">Completed</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 