"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { API_BASE_URL } from "@/app/lib/api";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [nfo, setNfo] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Fetch categories from API
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      if (!file) {
        setError(".torrent file is required");
        setLoading(false);
        return;
      }
      formData.append("torrent", file);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("categoryId", category);
      if (nfo) formData.append("nfo", nfo);
      if (posterFile) formData.append("poster", posterFile);
      if (posterUrl) formData.append("posterUrl", posterUrl);
      const res = await fetch(`${API_BASE_URL}/torrent/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to upload torrent");
      setSuccess("Torrent uploaded successfully!");
      setFile(null);
      setNfo(null);
      setPosterFile(null);
      setPosterUrl("");
      setName("");
      setDescription("");
      setCategory("");
    } catch (err: any) {
      setError(err.message || "Failed to upload torrent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Upload Torrent
          </h2>
          <p className="text-text-secondary">Share your content with the community</p>
        </div>

        {/* Upload Form */}
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center border border-primary/20">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
        <div>
                <h3 className="text-xl font-bold text-text">Torrent Information</h3>
                <p className="text-text-secondary text-sm">Fill in the details for your upload</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text mb-4">Files</h4>
              
              {/* Torrent File */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Torrent File <span className="text-red-500">*</span>
                </label>
                <div className="relative">
          <input
            type="file"
            accept=".torrent"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
                    className="block w-full text-text bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200"
          />
                  {file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {file.name}
                    </div>
                  )}
                </div>
        </div>

              {/* NFO File */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  NFO File <span className="text-xs text-text-tertiary">(optional)</span>
                </label>
                <div className="relative">
          <input
            type="file"
            accept=".nfo,text/plain"
            onChange={e => setNfo(e.target.files?.[0] || null)}
                    className="block w-full text-text bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200"
          />
                  {nfo && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {nfo.name}
                    </div>
                  )}
                </div>
              </div>
        </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text mb-4">Basic Information</h4>
              
              {/* Name */}
              <FormField
                label="Name"
            value={name}
                onChange={setName}
                placeholder="Enter torrent name"
              />

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Description <span className="text-red-500">*</span>
                </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            required
                  placeholder="Describe your torrent..."
                  className="block w-full text-text bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200 resize-none"
          />
        </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Category <span className="text-red-500">*</span>
                </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
                  className="block w-full text-text bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
            </div>

            {/* Poster Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text mb-4">Poster Image</h4>
              <p className="text-sm text-text-secondary mb-4">Add a poster image to make your torrent stand out</p>
              
              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Upload Image <span className="text-xs text-text-tertiary">(optional)</span>
                </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPosterFile(e.target.files?.[0] || null)}
                  className="block w-full text-text bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200"
            disabled={!!posterUrl}
          />
                {posterFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {posterFile.name}
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Or provide URL <span className="text-xs text-text-tertiary">(optional)</span>
                </label>
          <input
            type="text"
            placeholder="https://example.com/poster.jpg"
            value={posterUrl}
            onChange={e => setPosterUrl(e.target.value)}
                  className="block w-full text-text bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200"
            disabled={!!posterFile}
          />
        </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Upload Torrent
                </div>
              )}
        </button>
      </form>
        </div>
      </div>
    </div>
  );
} 