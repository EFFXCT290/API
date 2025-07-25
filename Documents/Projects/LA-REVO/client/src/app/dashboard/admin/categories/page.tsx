"use client";
import React, { useEffect, useState } from "react";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { SelectField } from "@/components/ui/FigmaFloatingLabelSelect";
import { API_BASE_URL } from "@/app/lib/api";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
  children?: Category[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", order: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [editForm, setEditForm] = useState({ name: "", description: "", icon: "", order: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/admin/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          icon: form.icon,
          order: form.order ? Number(form.order) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }
      setShowModal(false);
      setForm({ name: "", description: "", icon: "", order: "" });
      fetchCategories();
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (cat: Category) => {
    setEditForm({
      name: cat.name || "",
      description: cat.description || "",
      icon: cat.icon || "",
      order: cat.order?.toString() || ""
    });
    setEditModal({ open: true, category: cat });
    setEditError(null);
  };

  const handleEditInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.category) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/category/${editModal.category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          icon: editForm.icon,
          order: editForm.order ? Number(editForm.order) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update category");
      }
      setEditModal({ open: false, category: null });
      fetchCategories();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editModal.category) return;
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) return;
    setEditLoading(true);
    setEditError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/category/${editModal.category.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete category");
      }
      setEditModal({ open: false, category: null });
      fetchCategories();
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Category Management</h1>
          <p className="text-text-secondary">Manage all categories for torrents and requests</p>
        </div>
        <button
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow"
          onClick={() => setShowModal(true)}
        >
          + New Category
        </button>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading categories...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-bg-hover">
              <tr>
                <th className="py-3 px-4 text-left text-text font-medium">Name</th>
                <th className="py-3 px-4 text-left text-text font-medium">Description</th>
                <th className="py-3 px-4 text-left text-text font-medium">Icon</th>
                <th className="py-3 px-4 text-left text-text font-medium">Order</th>
                <th className="py-3 px-4 text-left text-text font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 text-text font-medium">{cat.name}</td>
                  <td className="py-3 px-4 text-text-secondary">{cat.description}</td>
                  <td className="py-3 px-4 text-primary text-lg">{cat.icon}</td>
                  <td className="py-3 px-4 text-text">{cat.order}</td>
                  <td className="py-3 px-4">
                    <button
                      className="text-primary hover:underline text-sm font-semibold"
                      onClick={() => openEditModal(cat)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
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
            <h2 className="text-2xl font-bold mb-4 text-primary">Create Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField
                label="Name"
                value={form.name}
                onChange={val => handleInput({ target: { name: "name", value: val } } as any)}
              />
              <FormField
                label="Description"
                value={form.description}
                onChange={val => handleInput({ target: { name: "description", value: val } } as any)}
              />
              <FormField
                label="Icon (emoji or class)"
                value={form.icon}
                onChange={val => handleInput({ target: { name: "icon", value: val } } as any)}
              />
              <FormField
                label="Order"
                value={form.order}
                onChange={val => handleInput({ target: { name: "order", value: val } } as any)}
                type="number"
              />
              {createError && <div className="text-error text-sm">{createError}</div>}
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModal.open && editModal.category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setEditModal({ open: false, category: null })}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Edit Category</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <FormField
                label="Name"
                value={editForm.name}
                onChange={val => setEditForm(f => ({ ...f, name: val }))}
              />
              <FormField
                label="Description"
                value={editForm.description}
                onChange={val => setEditForm(f => ({ ...f, description: val }))}
              />
              <FormField
                label="Icon (emoji or class)"
                value={editForm.icon}
                onChange={val => setEditForm(f => ({ ...f, icon: val }))}
              />
              <FormField
                label="Order"
                value={editForm.order}
                onChange={val => setEditForm(f => ({ ...f, order: val }))}
                type="number"
              />
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