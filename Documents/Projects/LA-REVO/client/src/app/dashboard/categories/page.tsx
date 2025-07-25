"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  }, []);

  const router = useRouter();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Categories
          </h2>
          <p className="text-text-secondary">Browse all available categories</p>
        </div>

        {/* Categories Grid */}
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-background/50 border border-border/30 rounded-2xl p-8 flex flex-col items-center animate-pulse">
                  <div className="h-6 w-24 bg-border/30 rounded mb-3" />
                  <div className="h-4 w-32 bg-border/30 rounded" />
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
        ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">No Categories Found</div>
              <div className="text-text-secondary">No categories are available at this time.</div>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                  className="bg-background/50 border border-border/50 rounded-2xl p-8 flex flex-col items-center shadow-lg hover:shadow-2xl hover:bg-primary/5 hover:border-primary/40 transition cursor-pointer w-full group"
                onClick={() => router.push(`/dashboard/categories/${encodeURIComponent(cat.name)}`)}
              >
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">{cat.name}</div>
                {cat.description && (
                  <div className="text-text-secondary text-center text-sm">{cat.description}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
} 