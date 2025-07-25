"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

export default function WikiPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/wiki`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load"))
      .then(data => setPages(Array.isArray(data) ? data : data.pages || []))
      .catch(() => setError("Failed to load wiki pages."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Wiki
          </h2>
          <p className="text-text-secondary">Browse helpful articles and documentation</p>
        </div>

        {/* Main Card */}
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8">
          {loading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-background/50 border border-border/30 rounded-2xl p-6">
                  <div className="h-5 bg-border/30 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-border/30 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-border/30 rounded w-2/3" />
                </div>
              ))}
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
          ) : pages.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">No Wiki Pages</div>
              <div className="text-text-secondary">There are no wiki pages at this time.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pages.map(page => (
                <Link
                  key={page.id}
                  href={`/dashboard/wiki/${page.slug || page.id}`}
                  className="block bg-gradient-to-r from-primary/10 to-primary-dark/10 backdrop-blur-lg rounded-2xl border-2 border-primary/30 p-6 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                          Wiki
                        </span>
                        <div className="text-xs text-text-secondary">
                          {new Date(page.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-text-secondary line-clamp-2">
                        {page.excerpt || page.content?.slice(0, 120) + "..."}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 