"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FormField } from "../../components/ui/FigmaFloatingLabelInput";
import { API_BASE_URL } from "@/app/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requestValue, setRequestValue] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  // Handle password reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! You can now log in.");
      } else {
        setError(data.error || "Reset failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset request
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setRequestLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: requestValue, username: requestValue }),
      });
      await res.json(); // Always success
      setRequestSent(true);
      setMessage("If an account exists, a reset email has been sent.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-surface">
      {/* Header */}
      <header className="flex justify-start items-center p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">L</span>
          </div>
          <span className="text-text font-semibold">LA-REVO</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto">
          {/* Auth Card */}
          <div className="rounded-2xl p-8 border border-border/50 shadow-2xl" style={{ background: "var(--surface)" }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Reset Password</h1>
              <p className="text-text-secondary text-sm">
                {token
                  ? "Enter your new password below."
                  : "Enter your email or username to receive a password reset link."}
              </p>
            </div>

            {/* Form */}
          {token ? (
              <form onSubmit={handleReset} className="space-y-6">
                <FormField
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter new password"
                type="password"
                />
                <FormField
                  label="Confirm New Password"
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Confirm new password"
                type="password"
              />
              {error && <div className="text-error text-sm">{error}</div>}
                {message && <div className="text-text">{message}</div>}
              <button
                type="submit"
                  className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
                <Link href="/login" className="text-primary hover:text-primary-dark transition-colors text-sm font-medium block mt-2 text-center">Back to Login</Link>
            </form>
          ) : (
              <form onSubmit={handleRequest} className="space-y-6">
                <FormField
                  label="Email or Username"
                  value={requestValue}
                  onChange={setRequestValue}
                  placeholder="Enter your email or username"
                type="text"
              />
              {error && <div className="text-error text-sm">{error}</div>}
                {message && <div className="text-text">{message}</div>}
              <button
                type="submit"
                  className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={requestLoading || requestSent}
              >
                {requestLoading ? "Sending..." : requestSent ? "Email Sent" : "Request Password Reset"}
              </button>
                <Link href="/login" className="text-primary hover:text-primary-dark transition-colors text-sm font-medium block mt-2 text-center">Back to Login</Link>
            </form>
          )}
        </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
      </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 border-t border-border/50">
        <p className="text-text-secondary text-xs">
          &copy; {new Date().getFullYear()} LA-REVO. All rights reserved.
        </p>
      </footer>
    </div>
  );
} 