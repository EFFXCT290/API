"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { SelectField } from "@/components/ui/FigmaFloatingLabelSelect";
import { API_BASE_URL } from "@/app/lib/api";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/requests`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load"))
      .then(data => setRequests(Array.isArray(data) ? data : data.requests || []))
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const handleInput = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setCreateError("You must be logged in to create a request.");
      setCreating(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create request");
      }
      setShowModal(false);
      setForm({ title: "", description: "", categoryId: "" });
      // Refresh requests
      setLoading(true);
      fetch(`${API_BASE_URL}/requests`)
        .then(res => res.ok ? res.json() : Promise.reject("Failed to load"))
        .then(data => setRequests(Array.isArray(data) ? data : data.requests || []))
        .catch(() => setError("Failed to load requests."))
        .finally(() => setLoading(false));
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent">
              Requests
            </h2>
            <p className="text-text-secondary mt-1">Browse and create requests for new content</p>
          </div>
          <button
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => setShowModal(true)}
          >
            + New Request
          </button>
        </div>
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
              <div className="text-lg font-semibold text-error mb-2">{error}</div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">No Requests Found</div>
              <div className="text-text-secondary">No requests have been made yet.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {requests.map(req => (
                <Link
                  key={req.id}
                  href={`/dashboard/requests/${req.id}`}
                  className="block bg-gradient-to-r from-primary/10 to-primary-dark/10 backdrop-blur-lg rounded-2xl border-2 border-primary/30 p-6 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                          Request
                        </span>
                        <div className="text-xs text-text-secondary">
                          {new Date(req.createdAt).toLocaleDateString()} • Status: <span className="font-semibold text-primary">{req.status}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                        {req.title}
                      </h3>
                      <p className="text-text-secondary line-clamp-2">
                        {req.description}
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
        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-surface/95 backdrop-blur-lg rounded-2xl p-10 w-full max-w-md border border-border/50 shadow-2xl relative">
              <button
                className="absolute top-4 right-4 text-text-secondary hover:text-primary text-2xl font-bold focus:outline-none"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-text text-center">Create Request</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <FormField
                  label="Title"
                  value={form.title}
                  onChange={val => handleInput("title", val)}
                />
                <FormField
                  label="Description"
                  value={form.description}
                  onChange={val => handleInput("description", val)}
                  type="textarea"
                />
                <SelectField
                  label="Category"
                  value={form.categoryId}
                  onChange={val => handleInput("categoryId", val)}
                  options={[{ value: "", label: "" }, ...categories.map(cat => ({ value: cat.id, label: cat.name }))]}
                />
                {createError && <div className="text-error text-sm text-center">{createError}</div>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Request"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 