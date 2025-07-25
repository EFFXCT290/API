"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-10 text-center">
          <h1 className="text-2xl font-bold mb-6 text-primary">Email Verification</h1>
          {status === "pending" && <div className="text-text-secondary">Verifying...</div>}
          {status === "success" && (
            <>
              <div className="text-success text-lg mb-4">{message}</div>
              <Link href="/login" className="w-full inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition shadow">Go to Login</Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="text-error text-lg mb-4">{message}</div>
              <Link href="/" className="text-primary hover:underline font-medium">Back to Home</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 