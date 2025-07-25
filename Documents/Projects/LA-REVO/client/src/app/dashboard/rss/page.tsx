"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/api";

export default function RssPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      setError("");
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!t) {
        setError("You must be logged in to view your RSS feed.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/user/rss-token`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error("Failed to fetch RSS token");
        const data = await res.json();
        setToken(data.token || data.rssToken || "");
      } catch {
        setError("Failed to fetch RSS token.");
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenerate = async () => {
    setRegenLoading(true);
    setError("");
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/rss-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setToken(data.token || data.rssToken || "");
    } catch {
      setError("Failed to regenerate RSS token.");
    } finally {
      setRegenLoading(false);
    }
  };

  const rssUrl = token
    ? `${API_BASE_URL}/rss?token=${token}`
    : "";

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            RSS Feed
          </h2>
          <p className="text-text-secondary">Integrate new torrents into your client or RSS reader</p>
        </div>

        {/* Main Card */}
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-10 flex flex-col gap-8">
          {loading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-6 bg-border/30 rounded w-2/3 mb-2" />
              <div className="h-6 bg-border/30 rounded w-1/2 mb-2" />
              <div className="h-6 bg-border/30 rounded w-1/3" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-error mb-2">{error}</div>
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm text-text-secondary mb-2 font-semibold">Your personalized RSS feed URL:</div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={rssUrl}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/70 text-text text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8m-4-4v8m8-8a8 8 0 11-16 0 8 8 0 0116 0z" />
                    </svg>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenLoading}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-background/70 border border-border/50 text-primary font-semibold text-xs shadow hover:bg-primary/10 hover:text-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {regenLoading ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
              </div>
              <div className="text-xs text-text-secondary font-semibold mt-2">
                Use this URL in your torrent client or RSS reader to automatically fetch new torrents. <br />
                <b>Keep this URL private!</b> Anyone with this link can access your feed.
              </div>
              <div className="mt-4 p-6 bg-background/70 border border-border/50 rounded-2xl">
                <div className="font-semibold mb-2 text-base text-primary">Filtering your RSS feed:</div>
                <ul className="list-disc pl-6 text-sm text-text-secondary space-y-3">
                  <li>
                    <b>By category:</b> <br />
                    Add <code>&category=Movies</code> (replace <code>Movies</code> with the category name or ID).<br />
                    <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded">{rssUrl}&category=Movies</span>
                  </li>
                  <li>
                    <b>By search query:</b> <br />
                    Add <code>&q=your+search+term</code>.<br />
                    <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded">{rssUrl}&q=matrix</span>
                  </li>
                  <li>
                    <b>Only your bookmarks:</b> <br />
                    Add <code>&bookmarks=true</code>.<br />
                    <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded">{rssUrl}&bookmarks=true</span>
                  </li>
                  <li>
                    <b>Combine filters:</b> <br />
                    You can combine filters, e.g.:<br />
                    <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded">{rssUrl}&category=Movies&q=4K&bookmarks=true</span>
                  </li>
                </ul>
                <div className="mt-3 text-text-secondary text-xs">These filters work in most torrent clients and RSS readers.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 