"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { API_BASE_URL } from "@/app/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
}

const fetchUsers = async (token: string): Promise<User[]> => {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users; // Only return the array
};

const ACTION_TABS = [
  { key: "email", label: "Change Email" },
  { key: "ban", label: "Ban User" },
  { key: "unban", label: "Unban User" },
  { key: "promote", label: "Promote User", ownerOnly: true },
  { key: "demote", label: "Demote User", ownerOnly: true },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [roleInput, setRoleInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [rssEnabled, setRssEnabled] = useState<boolean | null>(null);
  const [rssToken, setRssToken] = useState<string | null>(null);
  const [rssLoading, setRssLoading] = useState(false);
  const [rssMsg, setRssMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetchUsers(token)
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    // Fetch current admin role for tab visibility
    fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setRole(data.role))
      .catch(() => setRole(null));
  }, []);

  // When opening modal, set initial values
  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setUsernameInput(user.username);
    setEmailInput(user.email);
    setEmailVerified(user.emailVerified);
    setRoleInput(user.role);
    setStatusInput(user.status);
    setShowModal(true);
    setActionMsg("");
    setRssEnabled(null);
    setRssToken(null);
    setRssMsg(null);
    // Fetch RSS info
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(`${API_BASE_URL}/user/rss-token`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setRssEnabled(data.rssEnabled ?? null);
        setRssToken(data.rssToken ?? null);
      })
      .catch(() => {
        setRssEnabled(null);
        setRssToken(null);
      });
  };

  // Save changes handler
  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionMsg("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const changes: any = {};
    
    // Username changes - only owners can change usernames
    if (role === "OWNER" && usernameInput !== selectedUser.username) {
      changes.username = usernameInput;
    }
    
    // Email changes
    if (emailInput !== selectedUser.email) {
      changes.email = emailInput;
    }
    
    // Email verification changes
    if (emailVerified !== selectedUser.emailVerified) {
      changes.emailVerified = emailVerified;
    }
    
    // Role changes with validation
    if (roleInput !== selectedUser.role) {
      // Validate role changes based on current admin role
      if (role !== "OWNER") {
        if (roleInput === "ADMIN" || roleInput === "OWNER") {
          setActionMsg("Only owners can promote users to ADMIN or assign OWNER role.");
          setActionLoading(false);
          return;
        }
        if (selectedUser.role === "ADMIN") {
          setActionMsg("Only owners can demote ADMIN users.");
          setActionLoading(false);
          return;
        }
      }
      changes.role = roleInput;
    }
    
    // Status changes
    if (statusInput !== selectedUser.status) {
      changes.status = statusInput;
    }
    
    if (Object.keys(changes).length === 0) {
      setActionMsg("No changes to save.");
      setActionLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save changes");
      }
      setActionMsg("Changes saved successfully!");
      setTimeout(() => {
        setShowModal(false);
        setActionMsg("");
        fetchUsers(token!).then(setUsers);
      }, 1200);
    } catch (error) {
      setActionMsg(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRssEnabled = async (enabled: boolean) => {
    if (!selectedUser) return;
    setRssLoading(true);
    setRssMsg(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${selectedUser.id}/rss-enabled`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update RSS enabled");
      }
      setRssEnabled(enabled);
      setRssMsg(`RSS ${enabled ? "enabled" : "disabled"} successfully.`);
    } catch (e: any) {
      setRssMsg(e.message);
    } finally {
      setRssLoading(false);
    }
  };

  const handleResetRssToken = async () => {
    if (!selectedUser) return;
    setRssLoading(true);
    setRssMsg(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${selectedUser.id}/rss-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset RSS token");
      }
      const data = await res.json();
      setRssToken(data.user?.rssToken || null);
      setRssMsg("RSS token reset successfully.");
    } catch (e: any) {
      setRssMsg(e.message);
    } finally {
      setRssLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Users</h1>
        <p className="text-text-secondary">Manage all registered users and their permissions</p>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading users...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-6 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-text">Username</th>
                <th className="py-3 px-4 text-text">Email</th>
                <th className="py-3 px-4 text-text">Role</th>
                <th className="py-3 px-4 text-text">Status</th>
                <th className="py-3 px-4 text-text">Verified</th>
                <th className="py-3 px-4 text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-border hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 text-text font-medium">{user.username}</td>
                  <td className="py-3 px-4 text-text">{user.email}</td>
                  <td className="py-3 px-4 text-primary font-semibold">{user.role}</td>
                  <td className="py-3 px-4 text-text">{user.status}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${user.emailVerified ? "bg-green-500" : "bg-error"}`}></span>
                    <span className="text-text">{user.emailVerified ? "Yes" : "No"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow"
                      onClick={() => handleOpenModal(user)}
                    >
                      Edit User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal placeholder */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-lg flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Edit User</h2>
            {role !== "OWNER" && (
              <div className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                <strong>Note:</strong> Only owners can change usernames, promote to ADMIN, or assign OWNER role.
              </div>
            )}
            <div className="flex gap-4">
              <FormField
                label="Username"
                value={usernameInput}
                onChange={setUsernameInput}
                disabled={role !== "OWNER"}
                className="flex-1"
              />
              <FormField
                label="Email"
                value={emailInput}
                onChange={setEmailInput}
                type="email"
                className="flex-1"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-text">Role</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-text"
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value)}
                  disabled={role !== "OWNER"}
                >
                  <option value="USER">User</option>
                  <option value="MOD">Moderator</option>
                  {role === "OWNER" && (
                    <>
                      <option value="ADMIN">Administrator</option>
                      <option value="OWNER">Owner</option>
                    </>
                  )}
                  {role !== "OWNER" && (
                    <>
                      <option value="ADMIN" disabled>Administrator (Owner Only)</option>
                      <option value="OWNER" disabled>Owner (Owner Only)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-text">Status</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-text"
                  value={statusInput}
                  onChange={e => setStatusInput(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-text">Email Verification</span>
              <ToggleSwitch
                checked={emailVerified}
                onChange={e => setEmailVerified(e.target.checked)}
              />
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4 mt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-text">RSS Enabled</span>
                <ToggleSwitch
                  checked={!!rssEnabled}
                  onChange={e => handleRssEnabled(e.target.checked)}
                  disabled={rssLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">RSS Token:</span>
                <span className="text-xs font-mono text-text-secondary px-2 py-1 rounded-xl">{rssToken || "-"}</span>
                <button
                  className="bg-primary text-white px-3 py-1 rounded-xl text-xs ml-2 hover:bg-primary-dark shadow"
                  onClick={handleResetRssToken}
                  disabled={rssLoading}
                >
                  Reset RSS Token
                </button>
              </div>
              {rssMsg && <div className="text-xs text-text-secondary mt-1">{rssMsg}</div>}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition flex-1 shadow"
                onClick={handleSaveChanges}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="bg-border text-text px-4 py-2 rounded-xl font-semibold hover:bg-background transition flex-1"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
            {actionMsg && <div className="text-center text-sm mt-2 text-text">{actionMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 