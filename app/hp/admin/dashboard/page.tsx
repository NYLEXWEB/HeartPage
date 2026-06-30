"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/admin-dashboard";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Hourglass,
  AlertTriangle,
  HardDrive,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Settings as SettingsIcon,
  Megaphone
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalWebsites: number;
  activeWebsites: number;
  expiredWebsites: number;
  createdToday: number;
  createdThisWeek: number;
  categories: { couples: number; friends: number; breakup: number };
  themes: { light: number; dark: number };
  mostSelectedTemplate: string;
  storageUsageMB: number;
  recentWebsites: Array<{
    _id: string;
    slug: string;
    category: string;
    theme: string;
    yourName: string;
    partnerName: string;
    createdAt: string;
    expiresAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStats();
        if (res.success && res.stats) {
          setData(res.stats as DashboardData);
        } else {
          setError(res.error || "Failed to load dashboard metrics.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to query admin statistics.");
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="h-4 w-32 bg-zinc-900 rounded animate-pulse" />
          <div className="h-8 w-64 bg-zinc-900 rounded animate-pulse mt-2" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-32 bg-zinc-900 rounded-3xl border border-zinc-800/50 animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-96 bg-zinc-900 rounded-3xl border border-zinc-800/50 animate-pulse" />
          <div className="h-96 bg-zinc-900 rounded-3xl border border-zinc-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white font-mono uppercase">Dashboard Loading Error</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{error || "Could not retrieve statistics."}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Calculate percentage ratios
  const total = data.totalWebsites || 1;
  const activePercent = Math.round((data.activeWebsites / total) * 100);
  
  // Categories percent
  const catTotal = (data.categories.couples + data.categories.friends + data.categories.breakup) || 1;
  const couplesPct = Math.round((data.categories.couples / catTotal) * 100);
  const friendsPct = Math.round((data.categories.friends / catTotal) * 100);
  const breakupPct = Math.round((data.categories.breakup / catTotal) * 100);

  // Themes percent
  const themeTotal = (data.themes.light + data.themes.dark) || 1;
  const darkPct = Math.round((data.themes.dark / themeTotal) * 100);

  return (
    <div className="space-y-8">
      
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Analytics Dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Overview &amp; Activity</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-900/60 border border-zinc-900 px-4 py-2 rounded-xl text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-rose-500" />
          <span>Period: Lifetime</span>
        </div>
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Websites */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Total Created</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">{data.totalWebsites}</span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-widest">ACTIVE TTL</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Personal mini sites created so far</p>
        </motion.div>

        {/* Active Websites */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Active Sites</span>
            <Hourglass className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">{data.activeWebsites}</span>
            <span className="text-xs text-emerald-400 font-bold">({activePercent}%)</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Awaiting automatic TTL deletion</p>
        </motion.div>

        {/* Created Today */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Today's Volume</span>
            <Flame className="w-4 h-4 text-purple-500 animate-pulse" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">{data.createdToday}</span>
            <span className="text-xs text-zinc-500">in last 24h</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">New pages generated today</p>
        </motion.div>

        {/* Database Storage estimation */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Database Load</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{data.storageUsageMB}</span>
            <span className="text-xs text-zinc-500">MB / 512MB</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Estimated text footprint size</p>
        </motion.div>

      </div>

      {/* DETAILED STATS & DISTRIBUTION GAUGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category distribution bar chart visualization */}
        <div className="lg:col-span-2 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase">Category Distribution</h3>
            <p className="text-xs text-zinc-500">Breakdown of mini website templates chosen by users</p>
          </div>

          <div className="mt-8 space-y-6">
            
            {/* Couples */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">❤️ Couples</span>
                <span className="text-zinc-400">{data.categories.couples} pages ({couplesPct}%)</span>
              </div>
              <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${couplesPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>

            {/* Best Friends */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">🤝 Best Friends</span>
                <span className="text-zinc-400">{data.categories.friends} pages ({friendsPct}%)</span>
              </div>
              <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${friendsPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-yellow-400 rounded-full"
                />
              </div>
            </div>

            {/* Breakups */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">💔 Breakup Memories</span>
                <span className="text-zinc-400">{data.categories.breakup} pages ({breakupPct}%)</span>
              </div>
              <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakupPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-slate-500 rounded-full"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs font-mono text-zinc-500">
            <span>Primary Template: <strong>{data.mostSelectedTemplate}</strong></span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-rose-500" /> Active Traffic</span>
          </div>
        </div>

        {/* Theme Popularity donut-style layout */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase">Theme Preference</h3>
            <p className="text-xs text-zinc-500">Light mode vs dark mode selections</p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center relative">
            
            {/* Visual Circular Track */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background (Light Mode) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-zinc-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Dark Mode segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-rose-500"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${2.512 * darkPct} 251.2`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white font-mono">{darkPct}%</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Dark Theme</span>
              </div>
            </div>

            <div className="flex gap-6 mt-6 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span className="text-zinc-300">Dark ({data.themes.dark})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full" />
                <span className="text-zinc-500">Light ({data.themes.light})</span>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-zinc-900 text-center text-xs font-mono text-zinc-500">
            User base heavily favors high contrast dark styling.
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: RECENT SITES TABLE & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Web Pages Table */}
        <div className="lg:col-span-2 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase">Recent Creations</h3>
              <p className="text-xs text-zinc-500">Real-time log of the latest websites deployed</p>
            </div>
            <Link
              href="/hp/admin/websites"
              className="text-xs font-mono text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
            >
              Manage All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400 font-mono">
              <thead className="bg-zinc-900/40 text-zinc-500 border-b border-zinc-900">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Slug / Path</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Names</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40">
                {data.recentWebsites.length > 0 ? (
                  data.recentWebsites.map((web) => (
                    <tr key={web._id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white max-w-[140px] truncate">
                        <Link href={`/s/${web.slug}`} target="_blank" className="hover:underline">
                          /{web.slug}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          web.category === "couples"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-900/30"
                            : web.category === "friends"
                            ? "bg-yellow-950/40 text-yellow-400 border border-yellow-900/30"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                        }`}>
                          {web.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-[150px]">
                        {web.yourName} &amp; {web.partnerName}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-500">
                        {new Date(web.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-600">
                      No websites created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions box */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase">Quick Administration</h3>
            <p className="text-xs text-zinc-500">Direct shortcuts to system settings</p>
          </div>

          <div className="mt-6 space-y-3.5 flex-1 flex flex-col justify-center">
            
            <Link
              href="/hp/admin/settings"
              className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-center text-purple-400">
                  <SettingsIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">Edit Global Config</span>
                  <span className="text-[10px] text-zinc-500">Expiry days, maintenance, footer info</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/hp/admin/announcements"
              className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">Broadcast Alert</span>
                  <span className="text-[10px] text-zinc-500">Banners, system warnings, promos</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </Link>

          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Atlas MongoDB TTL cluster synchronizes automatically.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
