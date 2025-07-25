"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "../../components/ui/FigmaFloatingLabelInput";
import { API_BASE_URL } from "@/app/lib/api";

// Stub components for password requirements and strength bar
function PasswordRequirementsCard({ password, isVisible }: { password: string; isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <div className="text-xs text-text-secondary bg-surface rounded-md p-2 border border-border/50 mb-1">
      Password must be at least 6 characters.
    </div>
  );
}
function PasswordStrengthBar({ password }: { password: string }) {
  // Simple stub: show a colored bar based on length
  const strength = password.length >= 12 ? "bg-green-500" : password.length >= 8 ? "bg-yellow-500" : password.length > 0 ? "bg-red-500" : "bg-border";
  return (
    <div className="h-2 w-full rounded bg-border overflow-hidden">
      <div className={`h-2 transition-all duration-200 ${strength}`} style={{ width: `${Math.min(password.length * 10, 100)}%` }} />
    </div>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed");
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
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto">
          {/* Auth Card */}
          <div className="rounded-2xl p-8 border border-border/50 shadow-2xl" style={{ background: "var(--surface)" }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Register</h1>
              <p className="text-text-secondary text-sm">Create your account to get started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Username"
                value={formData.username}
                onChange={value => setFormData(prev => ({ ...prev, username: value }))}
                placeholder="Enter your username"
                type="text"
              />
              <FormField
                label="Email"
                value={formData.email}
                onChange={value => setFormData(prev => ({ ...prev, email: value }))}
                placeholder="Enter your email"
                type="email"
              />
              <div className="space-y-2">
                <FormField
                  label="Password"
                  value={formData.password}
                  onChange={value => {
                    setFormData(prev => ({ ...prev, password: value }));
                    setShowPasswordRequirements(value.length > 0);
                  }}
                  placeholder="Enter your password"
                type="password"
              />
                <PasswordRequirementsCard password={formData.password} isVisible={showPasswordRequirements} />
                <PasswordStrengthBar password={formData.password} />
            </div>
              <FormField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={value => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                placeholder="Confirm your password"
                type="password"
              />
            {error && <div className="text-error text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
                className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

            {/* Links */}
            <div className="mt-6 text-center pt-4 border-t border-border/50">
              <span className="text-text-secondary text-sm">
                Already have an account?{' '}
              </span>
              <Link
                href="/login"
                className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
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