"use client";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState({
    name: "",
    avatar: "",
    isAdmin: false,
  });
  const [stats, setStats] = useState({
    ratio: "-",
    uploaded: "-",
    downloaded: "-",
    hitAndRun: "-",
    bonus: "-",
  });
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser({
          name: data.username || data.email || "User",
          avatar: getAvatarUrl(data.avatarUrl, data.username, data.email),
          isAdmin: data.role === "ADMIN" || data.role === "OWNER",
        });
        setStats({
          ratio:
            data.download && Number(data.download) !== 0 && !isNaN(Number(data.ratio))
              ? Number(data.ratio).toFixed(2)
              : "0.00",
          uploaded:
            data.upload && Number(data.upload) !== 0 && !isNaN(Number(data.upload))
              ? formatBytes(Number(data.upload))
              : "0",
          downloaded:
            data.download && Number(data.download) !== 0 && !isNaN(Number(data.download))
              ? formatBytes(Number(data.download))
              : "0",
          hitAndRun: data.hitAndRunCount?.toString() ?? "0",
          bonus: data.bonusPoints?.toString() ?? "0",
        });
        setEmailVerified(data.emailVerified !== false);
        // Redirect if not verified and not already on /unverified
        if (data.emailVerified === false && typeof window !== "undefined" && !window.location.pathname.startsWith("/unverified")) {
          router.replace("/unverified");
        }
      } catch {
        // fallback to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router, pathname]);

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function getAvatarUrl(avatarUrl: string | null | undefined, username?: string, email?: string) {
    if (!avatarUrl) return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || email || 'User')}&background=2563eb&color=fff`;
    if (avatarUrl.startsWith("/uploads/")) {
      return `${API_BASE_URL}${avatarUrl}`;
    }
    return avatarUrl;
  }

  return (
    <div className="h-screen min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-surface">
      <DashboardHeader user={user} stats={stats} />
      <div className="flex flex-1 h-0">
        <Sidebar />
        <main className="flex-1 p-10 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
} 