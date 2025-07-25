"use client";
import React, { useEffect, useState } from "react";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { API_BASE_URL } from "@/app/lib/api";

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", pinned: false, visible: true });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; announcement: Announcement | null }>({ open: false, announcement: null });
  const [editForm, setEditForm] = useState({ title: "", body: "", pinned: false, visible: true });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/admin/announcement`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/announcement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create announcement");
      }
      setShowModal(false);
      setForm({ title: "", body: "", pinned: false, visible: true });
      fetchAnnouncements();
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (a: Announcement) => {
    setEditForm({
      title: a.title,
      body: a.body,
      pinned: a.pinned,
      visible: a.visible,
    });
    setEditModal({ open: true, announcement: a });
    setEditError(null);
  };

  const handleEditInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.announcement) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/announcement/${editModal.announcement.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update announcement");
      }
      setEditModal({ open: false, announcement: null });
      fetchAnnouncements();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editModal.announcement) return;
    if (!confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/announcement/${editModal.announcement.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete announcement");
      }
      setEditModal({ open: false, announcement: null });
      fetchAnnouncements();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePinToggle = async (a: Announcement, value: boolean) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      await fetch(`${API_BASE_URL}/admin/announcement/${a.id}/${value ? "pin" : "unpin"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch {}
  };

  const handleVisibleToggle = async (a: Announcement, value: boolean) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      await fetch(`${API_BASE_URL}/admin/announcement/${a.id}/${value ? "show" : "hide"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch {}
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Announcement Management</h1>
          <p className="text-text-secondary">Create, edit, and manage site announcements</p>
        </div>
        <button
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow"
          onClick={() => setShowModal(true)}
        >
          + New Announcement
        </button>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading announcements...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <>
          {/* Visible Announcements */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-primary">Visible Announcements</h2>
            <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-bg-hover">
                  <tr>
                    <th className="py-3 px-4 text-left text-text font-medium">Title</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Pinned</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Visible</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Created</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Updated</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.filter(a => a.visible).map((a) => (
                    <tr key={a.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 text-text font-medium">{a.title}</td>
                      <td className="py-3 px-4 text-primary font-semibold">{a.pinned ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-text">{a.visible ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-text-secondary">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 text-text-secondary">{new Date(a.updatedAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <button
                          className="text-primary hover:underline text-sm font-semibold"
                          onClick={() => openEditModal(a)}
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
          {/* Not Visible Announcements */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-text">Not Visible Announcements</h2>
            <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-bg-hover">
                  <tr>
                    <th className="py-3 px-4 text-left text-text font-medium">Title</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Pinned</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Visible</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Created</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Updated</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.filter(a => !a.visible).map((a) => (
                    <tr key={a.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 text-text font-medium">{a.title}</td>
                      <td className="py-3 px-4 text-primary font-semibold">{a.pinned ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-text">{a.visible ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-text-secondary">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 text-text-secondary">{new Date(a.updatedAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <button
                          className="text-primary hover:underline text-sm font-semibold"
                          onClick={() => openEditModal(a)}
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
            <h2 className="text-2xl font-bold mb-4 text-primary">Create Announcement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField
                label="Title"
                value={form.title}
                onChange={val => setForm(f => ({ ...f, title: val }))}
              />
              <div>
                <label className="block text-text mb-1">Body</label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleInput}
                  className="w-full rounded-xl border border-border bg-bg-secondary text-text p-2 min-h-[100px]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={form.pinned}
                    onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  />
                  <span className="text-text">Pinned</span>
                </label>
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={form.visible}
                    onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                  />
                  <span className="text-text">Visible</span>
                </label>
              </div>
              {createError && <div className="text-error text-sm">{createError}</div>}
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Announcement"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModal.open && editModal.announcement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setEditModal({ open: false, announcement: null })}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Edit Announcement</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <FormField
                label="Title"
                value={editForm.title}
                onChange={val => setEditForm(f => ({ ...f, title: val }))}
              />
              <div>
                <label className="block text-text mb-1">Body</label>
                <textarea
                  name="body"
                  value={editForm.body}
                  onChange={handleEditInput}
                  className="w-full rounded-xl border border-border bg-bg-secondary text-text p-2 min-h-[100px]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={editForm.pinned}
                    onChange={e => setEditForm(f => ({ ...f, pinned: e.target.checked }))}
                  />
                  <span className="text-text">Pinned</span>
                </label>
                <label className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={editForm.visible}
                    onChange={e => setEditForm(f => ({ ...f, visible: e.target.checked }))}
                  />
                  <span className="text-text">Visible</span>
                </label>
              </div>
              {editError && <div className="text-error text-sm">{editError}</div>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="bg-error text-white px-4 py-2 rounded-xl font-semibold hover:bg-error/80 transition-colors w-full shadow"
                  onClick={handleDelete}
                  disabled={editLoading}
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 