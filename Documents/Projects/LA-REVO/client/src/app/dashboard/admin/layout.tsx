"use client";

import { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

const SIDEBAR_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "torrents-approval", label: "Torrent Approval" },
  {key: "torrents", label: "Torrent Management"},
  { key: "categories", label: "Categories" },
  { key: "announcements", label: "Announcements" },
  { key: "requests", label: "Requests" },
  { key: "wiki", label: "Wiki" },
  { key: "peerbans", label: "Peer Bans" },
  { key: "invites", label: "Invites" },
  { key: "notifications", label: "Notifications" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fetch user role from profile API (or context if available)
    const fetchRole = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setRole(data.role);
      } catch {
        setRole(null);
      }
    };
    fetchRole();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-bg to-bg/80">
      <aside className="w-64 bg-surface/80 backdrop-blur-lg rounded-2xl m-6 border border-border/50 shadow-xl flex flex-col py-8 px-4 justify-between h-[calc(100vh-3rem)] sticky top-0">
        <nav className="flex flex-col gap-2">
          {SIDEBAR_ITEMS.map(item => {
            const href = `/dashboard/admin/${item.key === "overview" ? "" : item.key}`;
            const isActive = pathname === href || (item.key === "overview" && pathname === "/dashboard/admin");
            return (
              <Link
                key={item.key}
                href={href}
                className={`py-2 px-4 rounded-xl font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-text hover:bg-primary/5"}`}
              >
                {item.label}
              </Link>
            );
          })}
          {role === "OWNER" && (
            <Link
              href="/dashboard/admin/config"
              className={`py-2 px-4 rounded-xl font-medium transition-colors ${pathname === "/dashboard/admin/config" ? "bg-primary/10 text-primary" : "text-text hover:bg-primary/5"}`}
            >
              Tracker Config
            </Link>
          )}
        </nav>
        <div className="flex flex-col gap-2 mt-8">
          <Link
            href="/dashboard/admin/logs"
            className={`py-2 px-4 rounded-xl font-medium transition-colors ${pathname === "/dashboard/admin/logs" ? "bg-primary/10 text-primary" : "text-text hover:bg-primary/5"}`}
          >
            Logs
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
        <div className="w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
} 