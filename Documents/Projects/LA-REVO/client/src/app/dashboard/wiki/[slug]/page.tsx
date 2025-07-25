"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

export default function WikiDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/wiki/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject("Not found"))
      .then(data => setPage(data))
      .catch(() => setError("Wiki page not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-background/70 border border-border/50 rounded-xl text-primary font-semibold shadow hover:bg-primary/10 hover:text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Back to Wiki"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Wiki
        </button>
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Wiki Article
          </h2>
          <p className="text-text-secondary">Read the full article below</p>
        </div>
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl px-12 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-border/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-text-secondary text-center">Loading article...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-error mb-2">{error}</div>
            </div>
          ) : !page ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">Article Not Found</div>
              <div className="text-text-secondary">The requested article could not be found.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="text-4xl font-bold text-primary mb-4">
                {page.title}
              </h3>
              <div className="text-xs text-text-secondary mb-4">{new Date(page.createdAt).toLocaleDateString()}</div>
              <div className="text-text-secondary whitespace-pre-line text-xl leading-relaxed">
                {page.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 