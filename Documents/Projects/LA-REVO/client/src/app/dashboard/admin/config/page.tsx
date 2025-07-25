"use client";
import React, { useEffect, useState } from "react";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { API_BASE_URL } from "@/app/lib/api";

const CONFIG_FIELDS = [
  { key: "registrationMode", label: "Registration Mode", type: "select", options: ["OPEN", "INVITE", "CLOSED"] },
  { key: "storageType", label: "Storage Type", type: "select", options: ["LOCAL", "S3", "DB"] },
  { key: "requireTorrentApproval", label: "Require Torrent Approval", type: "toggle" },
  { key: "requiredSeedingMinutes", label: "Required Seeding Minutes", type: "number" },
  { key: "minRatio", label: "Minimum Ratio", type: "number" },
  { key: "bonusPointsPerHour", label: "Bonus Points Per Hour", type: "number" },
  { key: "hitAndRunThreshold", label: "Hit & Run Threshold", type: "number" },
  { key: "enableGhostLeechingCheck", label: "Enable Ghost Leeching Check", type: "toggle" },
  { key: "enableCheatingClientCheck", label: "Enable Cheating Client Check", type: "toggle" },
  { key: "enableIpAbuseCheck", label: "Enable IP Abuse Check", type: "toggle" },
  { key: "enableAnnounceRateCheck", label: "Enable Announce Rate Check", type: "toggle" },
  { key: "enableInvalidStatsCheck", label: "Enable Invalid Stats Check", type: "toggle" },
  { key: "enablePeerBanCheck", label: "Enable Peer Ban Check", type: "toggle" },
  { key: "defaultAnnounceInterval", label: "Default Announce Interval (s)", type: "number" },
  { key: "minAnnounceInterval", label: "Minimum Announce Interval (s)", type: "number" },
  { key: "maxStatsJumpMultiplier", label: "Max Stats Jump Multiplier", type: "number" },
  { key: "rssDefaultCount", label: "RSS Default Count", type: "number" },
];

const ARRAY_FIELDS = [
  { key: "whitelistedClients", label: "Whitelisted Clients" },
  { key: "blacklistedClients", label: "Blacklisted Clients" },
  { key: "allowedFingerprints", label: "Allowed Fingerprints" },
];

const SMTP_FIELDS = [
  { key: "smtpHost", label: "SMTP Host" },
  { key: "smtpPort", label: "SMTP Port", type: "number" },
  { key: "smtpUser", label: "SMTP User" },
  { key: "smtpPass", label: "SMTP Password" },
  { key: "smtpFrom", label: "SMTP From Address" },
];

const S3_FIELDS = [
  { key: "s3Bucket", label: "S3 Bucket" },
  { key: "s3Region", label: "S3 Region" },
  { key: "s3AccessKeyId", label: "S3 Access Key ID" },
  { key: "s3SecretAccessKey", label: "S3 Secret Access Key", type: "password" },
];

export default function AdminConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/admin/config`, {
      headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}` },
    })
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(e => setError("Failed to load config."))
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (key: string, value: any) => {
    setConfig((c: any) => ({ ...c, [key]: value }));
  };

  const handleArrayInput = (key: string, value: string) => {
    setConfig((c: any) => ({ ...c, [key]: value.split(",").map(v => v.trim()).filter(Boolean) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save config");
      }
      setSaveMsg("Config saved successfully.");
    } catch (e: any) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-text-secondary">Loading tracker config...</div>;
  if (error) return <div className="text-error">{error}</div>;
  if (!config) return null;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Tracker Configuration</h1>
        <p className="text-text-secondary">Edit global tracker, anti-cheat, and SMTP settings</p>
      </div>
      <form onSubmit={handleSave} className="space-y-10">
        <div className="bg-surface backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8">
          <h2 className="text-xl font-bold mb-6 text-primary">General & Anti-Cheat Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CONFIG_FIELDS.map(field => (
              <div key={field.key}>
                {field.type === "toggle" ? (
                  <label className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={!!config[field.key]}
                      onChange={e => handleInput(field.key, e.target.checked)}
                    />
                    <span className="text-text">{field.label}</span>
                  </label>
                ) : field.type === "select" && field.options ? (
                  <div>
                    <label className="block text-text mb-1">{field.label}</label>
                    <select
                      value={config[field.key]}
                      onChange={e => handleInput(field.key, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-text"
                    >
                      {field.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <FormField
                    label={field.label}
                    value={String(config[field.key] ?? "")}
                    onChange={val => handleInput(field.key, field.type === "number" ? Number(val) : val)}
                    type={field.type === "number" ? "number" : "text"}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8">
          <h2 className="text-xl font-bold mb-6 text-primary">Client Whitelist/Blacklist & Fingerprints</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ARRAY_FIELDS.map(field => (
              <FormField
                key={field.key}
                label={field.label}
                value={Array.isArray(config[field.key]) ? config[field.key].join(", ") : ""}
                onChange={val => handleArrayInput(field.key, val)}
              />
            ))}
          </div>
        </div>
        <div className="bg-surface backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8">
          <h2 className="text-xl font-bold mb-6 text-primary">SMTP Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SMTP_FIELDS.map(field => (
              <FormField
                key={field.key}
                label={field.label}
                value={String(config[field.key] ?? "")}
                onChange={val => handleInput(field.key, field.type === "number" ? Number(val) : val)}
                type={field.type === "number" ? "number" : "text"}
              />
            ))}
          </div>
        </div>
        {config.storageType === "S3" && (
          <div className="bg-surface backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-8">
            <h2 className="text-xl font-bold mb-6 text-primary">S3 Storage Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {S3_FIELDS.map(field => (
                <FormField
                  key={field.key}
                  label={field.label}
                  value={String(config[field.key] ?? "")}
                  onChange={val => handleInput(field.key, val)}
                  type={field.type || "text"}
                />
              ))}
            </div>
          </div>
        )}
        {saveMsg && <div className="text-center text-sm mt-2 text-text-secondary">{saveMsg}</div>}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow mt-4"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
} 