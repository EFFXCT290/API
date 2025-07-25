"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md bg-surface rounded-lg border border-border shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center text-text">LA-REVO Tracker</h1>
        <p className="text-base mb-8 text-center text-text-secondary">Private Torrent Tracker for the Next Generation</p>
        <div className="flex gap-4 w-full justify-center">
          <Link href="/login" className="w-1/2 text-center px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold transition disabled:opacity-50">Login</Link>
          <Link href="/register" className="w-1/2 text-center px-4 py-2 rounded-md bg-background border border-primary text-primary font-semibold hover:bg-surface transition disabled:opacity-50">Register</Link>
        </div>
      </div>
      <footer className="mt-8 text-text-secondary text-xs opacity-80">&copy; {new Date().getFullYear()} LA-REVO. All rights reserved.</footer>
    </div>
  );
}

