"use client";
import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL } from "@/app/lib/api";

export default function UnverifiedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${API_BASE_URL}/auth/request-email-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification email");
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-10 text-center">
          <h1 className="text-2xl font-bold mb-6 text-error">Email Not Verified</h1>
          <p className="mb-4 text-text">
            Your account email has not been verified yet. Please check your inbox for a verification email and follow the instructions to activate your account.
          </p>
          <p className="mb-6 text-text-secondary">
            If you did not receive the email, check your spam folder or click below to resend the verification email.
          </p>
          <button
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 mb-4 shadow"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>
          {message && <div className="text-success text-sm mb-2">{message}</div>}
          {error && <div className="text-error text-sm mb-2">{error}</div>}
          <Link href="/login" className="text-primary hover:underline font-medium block">Back to Login</Link>
        </div>
      </div>
      <div className="mb-8 text-center w-full">
        <Link href="/" className="text-text-secondary text-sm hover:underline">&larr; Back to home</Link>
      </div>
    </div>
  );
} 