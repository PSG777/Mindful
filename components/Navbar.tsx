"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
// …rest of your code

// Mindful Logo Component
const MindfulLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-blue-500 dark:text-blue-400"
  >
    {/* Lotus flower petals - outer layer */}
    <path
      d="M12 4C10.5 4 9.5 5.5 9.5 7C9.5 8.5 10.5 10 12 10C13.5 10 14.5 8.5 14.5 7C14.5 5.5 13.5 4 12 4Z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M12 14C10.5 14 9.5 15.5 9.5 17C9.5 18.5 10.5 20 12 20C13.5 20 14.5 18.5 14.5 17C14.5 15.5 13.5 14 12 14Z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M4 12C4 10.5 5.5 9.5 7 9.5C8.5 9.5 10 10.5 10 12C10 13.5 8.5 14.5 7 14.5C5.5 14.5 4 13.5 4 12Z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M14 12C14 10.5 15.5 9.5 17 9.5C18.5 9.5 20 10.5 20 12C20 13.5 18.5 14.5 17 14.5C15.5 14.5 14 13.5 14 12Z"
      fill="currentColor"
      opacity="0.8"
    />
    
    {/* Lotus flower petals - inner layer */}
    <path
      d="M12 6C11.2 6 10.5 6.8 10.5 7.5C10.5 8.2 11.2 9 12 9C12.8 9 13.5 8.2 13.5 7.5C13.5 6.8 12.8 6 12 6Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M12 15C11.2 15 10.5 15.8 10.5 16.5C10.5 17.2 11.2 18 12 18C12.8 18 13.5 17.2 13.5 16.5C13.5 15.8 12.8 15 12 15Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M6 12C6 11.2 6.8 10.5 7.5 10.5C8.2 10.5 9 11.2 9 12C9 12.8 8.2 13.5 7.5 13.5C6.8 13.5 6 12.8 6 12Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M15 12C15 11.2 15.8 10.5 16.5 10.5C17.2 10.5 18 11.2 18 12C18 12.8 17.2 13.5 16.5 13.5C15.8 13.5 15 12.8 15 12Z"
      fill="currentColor"
      opacity="0.9"
    />
    
    {/* Center dot - representing mindfulness focus */}
    <circle
      cx="12"
      cy="12"
      r="1.5"
      fill="currentColor"
      opacity="1"
    />
  </svg>
);

const tabs = [
  { name: "Home", href: "/" },
  { name: "Journal", href: "/journal" },
  { name: "Mood Tracker", href: "/mood-tracker" },
  { name: "Schedule", href: "/schedule" },
  { name: "Resources", href: "/resources" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-white dark:bg-gray-950 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16 relative">
        {/* Logo/Title */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <MindfulLogo />
          <span className="font-bold text-lg tracking-tight">Mindful</span>
        </div>
        {/* Centered Tabs */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-1">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <Button
                variant={pathname === tab.href ? "default" : "ghost"}
                className={
                  pathname === tab.href
                    ? "bg-primary text-white px-3 py-1 text-sm"
                    : "bg-transparent text-foreground hover:bg-primary/10 px-3 py-1 text-sm"
                }
              >
                {tab.name}
              </Button>
            </Link>
          ))}
        </div>
        {/* Hamburger Menu */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col gap-2 mt-2">
            {tabs.map((tab) => (
              <Link key={tab.name} href={tab.href}>
                <Button
                  variant={pathname === tab.href ? "default" : "ghost"}
                  className={
                    pathname === tab.href
                      ? "bg-primary text-white w-full"
                      : "bg-transparent text-foreground hover:bg-primary/10 w-full"
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {tab.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 