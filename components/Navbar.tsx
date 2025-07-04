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
  { name: "Schedule", href: "/schedule" },
  { name: "Resources", href: "/resources" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-white dark:bg-gray-950 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo/Title */}
        <div className="flex items-center">
          <span className="font-bold text-lg tracking-tight">Mindful</span>
        </div>
        {/* Centered Tabs */}
        <div className="hidden md:flex items-center gap-1">
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
        {/* Spacer for mobile menu */}
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