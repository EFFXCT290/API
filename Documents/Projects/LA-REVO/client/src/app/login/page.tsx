"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "../../components/ui/FigmaFloatingLabelInput";
import { API_BASE_URL } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.login.includes("@") ? formData.login : undefined,
          username: !formData.login.includes("@") ? formData.login : undefined,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          router.push("/unverified");
          return;
        }
        setError(data.error || "Login failed");
      } else if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Auth Card */}
          <div className="rounded-2xl p-8 border border-border/50 shadow-2xl" style={{ background: "var(--surface)" }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Sign In</h1>
              <p className="text-text-secondary text-sm">Welcome back! Please enter your credentials to sign in.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Username or Email"
                value={formData.login}
                onChange={value => setFormData(prev => ({ ...prev, login: value }))}
                placeholder="Enter your username or email"
                type="text"
              />
              <FormField
                label="Password"
                value={formData.password}
                onChange={value => setFormData(prev => ({ ...prev, password: value }))}
                placeholder="Enter your password"
                type="password"
              />
              {error && <div className="text-error text-sm">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-text-tertiary py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  href="/reset-password"
                  className="text-primary hover:text-primary-dark transition-colors text-sm"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="text-center pt-4 border-t border-border/50">
                <span className="text-text-secondary text-sm">
                  Don&apos;t have an account?{' '}
                </span>
                <Link
                  href="/register"
                  className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            </div>
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