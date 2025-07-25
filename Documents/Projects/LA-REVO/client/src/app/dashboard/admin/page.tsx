"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/api";

export default function AdminOverviewPage() {
  const [role, setRole] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        }
        // Fetch overview stats
        const statsRes = await fetch(`${API_BASE_URL}/admin/overview-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        } else {
          setError("Failed to load stats");
        }
        // Fetch config if owner
        if (role === "owner") {
          const configRes = await fetch(`${API_BASE_URL}/admin/config`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (configRes.ok) {
            setConfig(await configRes.json());
          }
        }
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto">
      <div className="mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Admin Overview</h1>
        <p className="text-text-secondary">Site statistics and tracker configuration</p>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Users</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.users}</span>
          </div>
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Torrents</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.torrents}</span>
          </div>
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Requests</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.requests}</span>
          </div>
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Downloads</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.downloads}</span>
          </div>
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Peers</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.peers}</span>
          </div>
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Seeding</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.seeding}</span>
          </div>
          <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
            <span className="text-lg font-semibold text-text">Leeching</span>
            <span className="text-4xl font-bold text-primary mt-2">{stats.leeching}</span>
          </div>
        </div>
      ) : null}
      {role === "owner" && config && (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8 mt-8">
          <h2 className="text-xl font-bold text-primary mb-2">Tracker Configuration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span className="text-text-secondary">Storage Type</span>
              <div className="text-text font-semibold">{config.storageType}</div>
            </div>
            <div>
              <span className="text-text-secondary">Require Approval</span>
              <div className="text-text font-semibold">{config.requireTorrentApproval ? "Yes" : "No"}</div>
            </div>
            <div>
              <span className="text-text-secondary">Min Ratio</span>
              <div className="text-text font-semibold">{config.minRatio}</div>
            </div>
            <div>
              <span className="text-text-secondary">Seeding Minutes</span>
              <div className="text-text font-semibold">{config.requiredSeedingMinutes}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 