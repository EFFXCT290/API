"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

export default function BrowseTorrentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [torrents, setTorrents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/torrent/list`)
      .then(res => res.json())
      .then(data => setTorrents(data.torrents || []))
      .catch(() => setError("Failed to load torrents."))
      .finally(() => setLoading(false));
  }, []);

  // Filter torrents by search
  const filteredTorrents = search
    ? torrents.filter(
        t =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : torrents;

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/browse?search=${encodeURIComponent(searchInput)}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent">
            Browse Torrents
          </h2>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search torrents..."
              className="px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring focus:ring-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
            >
              Search
            </button>
          </form>
        </div>
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-secondary">Loading torrents...</div>
          ) : error ? (
            <div className="p-8 text-center text-error">{error}</div>
          ) : filteredTorrents.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">No torrents found.</div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredTorrents.map((torrent, index) => (
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