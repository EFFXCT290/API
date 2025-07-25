"use client";
import React, { useEffect, useState } from "react";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { API_BASE_URL } from "@/app/lib/api";

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  visible: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminWikiPage() {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", visible: true, locked: false });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; page: WikiPage | null }>({ open: false, page: null });
  const [editForm, setEditForm] = useState({ title: "", slug: "", content: "", visible: true, locked: false });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/admin/wiki`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch wiki pages");
      const data = await res.json();
      setPages(Array.isArray(data) ? data : data.pages || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleInput = (name: string, value: string | boolean) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/wiki`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create wiki page");
      }
      setShowModal(false);
      setForm({ title: "", slug: "", content: "", visible: true, locked: false });
      fetchPages();
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (page: WikiPage) => {
    setEditForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      visible: page.visible,
      locked: page.locked,
    });
    setEditModal({ open: true, page });
    setEditError(null);
  };

  const handleEditInput = (name: string, value: string | boolean) => {
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.page) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/wiki/${editModal.page.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update wiki page");
      }
      setEditModal({ open: false, page: null });
      fetchPages();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editModal.page) return;
    if (!confirm("Are you sure you want to delete this wiki page? This action cannot be undone.")) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/wiki/${editModal.page.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete wiki page");
      }
      setEditModal({ open: false, page: null });
      fetchPages();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleLockToggle = async (lock: boolean) => {
    if (!editModal.page) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/wiki/${editModal.page.id}/${lock ? "lock" : "unlock"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${lock ? "lock" : "unlock"} wiki page`);
      }
      setEditModal({ open: false, page: null });
      fetchPages();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleVisibleToggle = async (visible: boolean) => {
    if (!editModal.page) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/wiki/${editModal.page.id}/${visible ? "show" : "hide"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${visible ? "show" : "hide"} wiki page`);
      }
      setEditModal({ open: false, page: null });
      fetchPages();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Wiki Management</h1>
          <p className="text-text-secondary">Create, edit, and manage wiki pages</p>
        </div>
        <button
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow"
          onClick={() => setShowModal(true)}
        >
          + New Wiki Page
        </button>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading wiki pages...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <>
          {/* Visible Wiki Pages */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-primary">Visible Wiki Pages</h2>
            <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-bg-hover">
                    <th className="px-4 py-3 text-left text-text font-medium">Title</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Slug</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Visible</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Locked</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Created</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Updated</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.filter(page => page.visible).map(page => (
                    <tr key={page.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-primary">{page.title}</td>
                      <td className="px-4 py-3 text-text">{page.slug}</td>
                      <td className="px-4 py-3 text-text">{page.visible ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-text">{page.locked ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(page.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(page.updatedAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          className="text-primary hover:underline text-sm font-semibold"
                          onClick={() => openEditModal(page)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Not Visible Wiki Pages */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-text">Not Visible Wiki Pages</h2>
            <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
                  <tr className="bg-bg-hover">
                    <th className="px-4 py-3 text-left text-text font-medium">Title</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Slug</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Visible</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Locked</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Created</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Updated</th>
                    <th className="px-4 py-3 text-left text-text font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {pages.filter(page => !page.visible).map(page => (
                    <tr key={page.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-primary">{page.title}</td>
                      <td className="px-4 py-3 text-text">{page.slug}</td>
                      <td className="px-4 py-3 text-text">{page.visible ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-text">{page.locked ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(page.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(page.updatedAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                    <button
                          className="text-primary hover:underline text-sm font-semibold"
                      onClick={() => openEditModal(page)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </div>
        </>
      )}
      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Create Wiki Page</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField
                label="Title"
                value={form.title}
                onChange={val => handleInput("title", val)}
              />
              <FormField
                label="Slug"
                value={form.slug}
                onChange={val => handleInput("slug", val)}
              />
              <div>
                <label className="block text-text mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={e => handleInput("content", e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-secondary text-text p-2 min-h-[120px]"
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={form.visible}
                    onChange={e => handleInput("visible", e.target.checked)}
                  />
                  <span className="text-text">Visible</span>
                </label>
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={form.locked}
                    onChange={e => handleInput("locked", e.target.checked)}
                  />
                  <span className="text-text">Locked</span>
                </label>
              </div>
              {createError && <div className="text-error text-sm">{createError}</div>}
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Wiki Page"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModal.open && editModal.page && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setEditModal({ open: false, page: null })}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Edit Wiki Page</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <FormField
                label="Title"
                value={editForm.title}
                onChange={val => handleEditInput("title", val)}
              />
              <FormField
                label="Slug"
                value={editForm.slug}
                onChange={val => handleEditInput("slug", val)}
              />
              <div>
                <label className="block text-text mb-1">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={e => handleEditInput("content", e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-secondary text-text p-2 min-h-[120px]"
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={editForm.visible}
                    onChange={e => handleEditInput("visible", e.target.checked)}
                  />
                  <span className="text-text">Visible</span>
                </label>
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={editForm.locked}
                    onChange={e => handleEditInput("locked", e.target.checked)}
                  />
                  <span className="text-text">Locked</span>
                </label>
              </div>
              {editError && <div className="text-error text-sm">{editError}</div>}
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
            <div className="flex flex-col gap-2 mt-6">
              <button
                className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors w-full shadow"
                onClick={() => handleLockToggle(!editModal.page!.locked)}
                disabled={editLoading}
              >
                {editModal.page!.locked ? "Unlock Page" : "Lock Page"}
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors w-full shadow"
                onClick={() => handleVisibleToggle(!editModal.page!.visible)}
                disabled={editLoading}
              >
                {editModal.page!.visible ? "Hide Page" : "Show Page"}
              </button>
              <button
                className="bg-error text-white px-4 py-2 rounded-xl font-semibold hover:bg-error/80 transition-colors w-full shadow"
                onClick={handleDelete}
                disabled={editLoading}
              >
                Delete Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 