"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

export default function AnnouncementDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/announcements/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject("Not found"))
      .then(data => setAnnouncement(data))
      .catch(() => setError("Announcement not found."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-background/70 border border-border/50 rounded-xl text-primary font-semibold shadow hover:bg-primary/10 hover:text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Back to Announcements"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Announcements
        </button>
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Announcement Details
          </h2>
          <p className="text-text-secondary">Read the full announcement below</p>
        </div>
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-border/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.664 3.478 8 8v7l.748.267-1.127 2.254a1.999 1.999 0 0 0 1.156 2.792l4.084 1.361a2.015 2.015 0 0 0 2.421-1.003l1.303-2.606 4.079 1.457A1 1 0 0 0 22 18.581V4.419a1 1 0 0 0-1.336-.941zm-7.171 16.299L9.41 18.416l1.235-2.471 4.042 1.444-1.194 2.388zM4 15h2V8H4c-1.103 0-2 .897-2 2v3c0 1.103.897 2 2 2z" />
                </svg>
              </div>
              <div className="text-text-secondary text-center">Loading announcement...</div>
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
          ) : !announcement ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">Announcement Not Found</div>
              <div className="text-text-secondary">The requested announcement could not be found.</div>
            </div>
          ) : (
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.664 3.478 8 8v7l.748.267-1.127 2.254a1.999 1.999 0 0 0 1.156 2.792l4.084 1.361a2.015 2.015 0 0 0 2.421-1.003l1.303-2.606 4.079 1.457A1 1 0 0 0 22 18.581V4.419a1 1 0 0 0-1.336-.941zm-7.171 16.299L9.41 18.416l1.235-2.471 4.042 1.444-1.194 2.388zM4 15h2V8H4c-1.103 0-2 .897-2 2v3c0 1.103.897 2 2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                    Announcement
                  </span>
                  <div className="text-xs text-text-secondary">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">
                  {announcement.title}
                </h3>
                <div className="text-text whitespace-pre-line mb-4 text-lg">
                  {announcement.content || announcement.body}
                </div>
                {announcement.createdBy && (
                  <div className="text-xs text-text-secondary">By {announcement.createdBy.username}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 