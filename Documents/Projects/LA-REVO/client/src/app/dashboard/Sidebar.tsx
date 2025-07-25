"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/categories", label: "Categories", icon: "folder" },
  { href: "/dashboard/announcements", label: "Announcements", icon: "megaphone" },
  { href: "/dashboard/wiki", label: "Wiki", icon: "book" },
  { href: "/dashboard/rss", label: "RSS", icon: "rss" },
  { href: "/dashboard/requests", label: "Requests", icon: "clipboard" },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: "bookmark" },
];

const icons = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  megaphone: (
    <svg  xmlns="http://www.w3.org/2000/svg" width={24} height={24} 
    fill={"currentColor"} viewBox="0 0 24 24">
    <path d="m18,7V3c0-.35-.19-.68-.49-.86-.31-.18-.68-.18-.99-.01L7.74,7h-3.74c-1.1,0-2,.9-2,2v5c0,1.1.9,2,2,2h3v6h2v-5.46l7.59,3.37c.13.06.27.09.41.09.19,0,.38-.05.54-.16.28-.18.46-.5.46-.84v-4c2.21,0,4-1.79,4-4s-1.79-4-4-4Zm-14,7v-5h3v5h-3Zm12,3.46l-7-3.11v-5.76l7-3.89v12.76Zm2-4.46v-4c1.1,0,2,.9,2,2s-.9,2-2,2Z"></path>
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  rss: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  bookmark: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-surface to-surface/95 backdrop-blur-lg border-r border-border/50 flex flex-col h-full transition-all duration-300 shadow-lg z-10`}>
      {/* Collapse button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-primary/10 text-text-secondary hover:text-primary transition-all duration-200"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 mt-2 px-4 pb-6">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = icons[item.icon as keyof typeof icons];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                  : 'text-text hover:bg-primary/10 hover:text-primary'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
              )}
              
              {/* Icon */}
              <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-primary'} transition-colors duration-200`}>
                {Icon}
              </div>
              
              {/* Label */}
              {!isCollapsed && (
                <span className={`font-semibold ${isActive ? 'text-white' : 'text-text group-hover:text-primary'} transition-colors duration-200`}>
                  {item.label}
                </span>
              )}
              
              {/* Hover effect for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-surface border border-border/50 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-lg">
                  <span className="text-sm font-medium text-text whitespace-nowrap">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!isCollapsed && (
        <div className="mt-auto p-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-text">Need Help?</div>
                <div className="text-xs text-text-secondary">Check our wiki</div>
              </div>
            </div>
            <Link
              href="/dashboard/wiki"
              className="block w-full text-center py-2 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Browse Wiki
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
} 