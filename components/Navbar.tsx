"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
// …rest of your code


const tabs = [
  { name: "Home", href: "/" },
  { name: "Journal", href: "/journal" },
  { name: "Mood Tracker", href: "/mood-tracker" },
  { name: "CBT Coach", href: "/cbt-coach" },
  { name: "Self-Care", href: "/self-care" },
  { name: "Schedule", href: "/schedule" },
  { name: "Resources", href: "/resources" },
  { name: "Settings", href: "/settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-white dark:bg-gray-950 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16 relative">
        {/* Logo/Title */}
        <div className="flex items-center gap-4 min-w-[120px]">
          <span className="font-bold text-lg tracking-tight">MentalHealth</span>
        </div>
        {/* Centered Tabs */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-2">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <Button
                variant={pathname === tab.href ? "default" : "ghost"}
                className={
                  pathname === tab.href
                    ? "bg-primary text-white"
                    : "bg-transparent text-foreground hover:bg-primary/10"
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