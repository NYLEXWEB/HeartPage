"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  Megaphone,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Heart,
  UserCheck
} from "lucide-react";
import { logoutAdmin } from "@/actions/admin";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/hp/admin/dashboard", icon: LayoutDashboard },
  { name: "Websites", href: "/hp/admin/websites", icon: Database },
  { name: "Announcements", href: "/hp/admin/announcements", icon: Megaphone },
  { name: "Settings", href: "/hp/admin/settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If we are on the login page, just render the content bare
  const isLoginPage = pathname === "/hp/admin/login";
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await logoutAdmin();
      if (res.success) {
        router.push("/hp/admin/login");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900 text-zinc-400">
      
      {/* Sidebar Header */}
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between shrink-0">
        <Link href="/hp/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 shadow-sm">
            <Heart className="w-4 h-4 fill-rose-500/10" />
          </div>
          <div className="text-left">
            <span className="font-mono text-sm font-extrabold text-white tracking-wider uppercase block">
              HeartPage
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              ADMIN PANEL
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? "text-white bg-zinc-900 border-zinc-800"
                  : "hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-1.5 w-1 h-5 rounded-full bg-rose-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-rose-500" : "text-zinc-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-zinc-900 shrink-0 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900/30 border border-zinc-900/50">
          <div className="w-8 h-8 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-mono font-bold text-zinc-200 truncate">njanadmin</p>
            <p className="text-[9px] text-emerald-400 font-mono tracking-widest">ONLINE</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-colors group cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 focus:outline-none cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest font-bold hidden sm:inline-block">
              {navItems.find((n) => n.href === pathname)?.name || "Admin"}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span>Server: OK</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-50 md:hidden"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-zinc-950 z-50 md:hidden shadow-2xl"
              >
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                {sidebarContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Subpage Content wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
