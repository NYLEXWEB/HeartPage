"use client";

import { useEffect, useState } from "react";
import { getWebsites, deleteWebsite, extendExpiry } from "@/actions/admin-dashboard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  ExternalLink,
  Copy,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Check,
  Clock
} from "lucide-react";
import Link from "next/link";

interface WebsiteItem {
  _id: string;
  slug: string;
  category: "couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding";
  theme: "light" | "dark";
  yourName: string;
  partnerName: string;
  createdAt: string;
  expiresAt: string;
}

export default function AdminWebsitesPage() {
  // Query state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Data state
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog triggers
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [extendExpiryId, setExtendExpiryId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(5);
  const [isExtending, setIsExtending] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadWebsites() {
    setIsLoading(true);
    try {
      const res = await getWebsites({ page, limit, search, category, status });
      if (res.success && res.data) {
        setWebsites(res.data);
        if (res.pagination) {
          setTotalCount(res.pagination.totalCount);
          setTotalPages(res.pagination.totalPages);
        }
      } else {
        setError(res.error || "Failed to load website records.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to query database records.");
    } finally {
      setIsLoading(false);
    }
  }

  // Reload when query constraints change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadWebsites();
    }, 0);
    return () => clearTimeout(timer);
  }, [page, category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadWebsites();
  };

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullLink = `${origin}/s/${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await deleteWebsite(deleteConfirmId);
      if (res.success) {
        setDeleteConfirmId(null);
        // Refresh page or go back a page if count is zero
        if (websites.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadWebsites();
        }
      } else {
        alert(res.error || "Failed to delete website.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExtend = async () => {
    if (!extendExpiryId) return;
    setIsExtending(true);
    try {
      const res = await extendExpiry(extendExpiryId, extendDays);
      if (res.success) {
        setExtendExpiryId(null);
        loadWebsites();
      } else {
        alert(res.error || "Failed to extend website expiration.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">SaaS Data Log</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Website Records</h1>
      </div>

      {/* FILTER PANEL */}
      <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Search box */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3.5 text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by slug, creator name, or partner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none transition-colors text-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide cursor-pointer transition-colors"
          >
            Query List
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-900">
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-lg p-0.5 flex flex-wrap gap-0.5">
                {["all", "couples", "friends", "breakup", "crush", "birthday", "wedding"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      category === cat
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Status:</span>
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-lg p-0.5 flex">
                {["all", "active", "expired"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatus(st);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      status === st
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            Found <strong>{totalCount}</strong> results
          </div>

        </div>

      </div>

      {/* WEBSITES TABLE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl relative">
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400 font-mono">
            <thead className="bg-zinc-900/40 text-zinc-500 border-b border-zinc-900">
              <tr>
                <th className="py-4 px-5">Slug</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Theme</th>
                <th className="py-4 px-5">Creator</th>
                <th className="py-4 px-5">Partner</th>
                <th className="py-4 px-5">Expiry (Days)</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {websites.length > 0 ? (
                websites.map((web) => {
                  const now = new Date();
                  const expDate = new Date(web.expiresAt);
                  const isActive = expDate > now;
                  
                  // Calculate remaining days
                  const diffTime = expDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const expiryDisplay = isActive 
                    ? `${diffDays}d left` 
                    : "Expired";

                  return (
                    <tr key={web._id} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="py-4 px-5 font-bold text-white max-w-[120px] truncate">
                        <Link href={`/s/${web.slug}`} target="_blank" className="hover:underline flex items-center gap-1">
                          /{web.slug} <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          web.category === "couples"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-900/30"
                            : web.category === "friends"
                            ? "bg-yellow-950/40 text-yellow-400 border border-yellow-900/30"
                            : web.category === "crush"
                            ? "bg-pink-950/40 text-pink-400 border border-pink-900/30"
                            : web.category === "birthday"
                            ? "bg-sky-950/40 text-sky-400 border border-sky-900/30"
                            : web.category === "wedding"
                            ? "bg-purple-950/40 text-purple-400 border border-purple-900/30"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                        }`}>
                          {web.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 capitalize">
                        {web.theme}
                      </td>
                      <td className="py-4 px-5 max-w-[100px] truncate">
                        {web.yourName}
                      </td>
                      <td className="py-4 px-5 max-w-[100px] truncate">
                        {web.partnerName}
                      </td>
                      <td className="py-4 px-5 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isActive ? "text-zinc-500" : "text-rose-500"}`} />
                          <span>{expiryDisplay}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive 
                            ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/20" 
                            : "bg-red-950/30 text-red-400 border border-red-900/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                          <span>{isActive ? "ACTIVE" : "EXPIRED"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          
                          {/* Copy Link Button */}
                          <button
                            onClick={() => handleCopyLink(web.slug, web._id)}
                            className="p-2 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors cursor-pointer border border-zinc-900 hover:border-zinc-800"
                            title="Copy Website Link"
                          >
                            {copiedId === web._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Extend Expiry Button */}
                          <button
                            onClick={() => {
                              setExtendExpiryId(web._id);
                              setExtendDays(5);
                            }}
                            className="p-2 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors cursor-pointer border border-zinc-900 hover:border-zinc-800 text-zinc-400"
                            title="Extend Expiry Date"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirmId(web._id)}
                            className="p-2 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 rounded-lg transition-colors cursor-pointer border border-zinc-900 text-zinc-500"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    {isLoading ? "Fetching data records..." : "No website results found matching filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between font-mono text-xs text-zinc-500">
            <div>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({websites.length} items on page)
            </div>
            
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CONFIRM DELETE DIALOG DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-red-950/20 border border-red-900/30 text-red-500 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-mono uppercase">Delete Web Page?</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-mono">
                  This operation is permanent. It will immediately and completely remove the website from the MongoDB database, resulting in a 404 error if anyone tries to visit its URL.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:bg-red-800"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete Page"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXTEND EXPIRY DIALOG DIALOG */}
      <AnimatePresence>
        {extendExpiryId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-rose-950/20 border border-rose-900/30 text-rose-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-mono uppercase">Extend Lifetime</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-mono">
                  Select the duration to extend the TTL (Time-to-Live) of this page. Extension starts from the current expiry date if active, or from today if already expired.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-bold font-mono">Extension Period</label>
                <select
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                >
                  <option value={1}>1 Day Extension</option>
                  <option value={5}>5 Days Extension (Default)</option>
                  <option value={14}>14 Days Extension</option>
                  <option value={30}>30 Days Extension</option>
                  <option value={90}>90 Days Extension</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setExtendExpiryId(null)}
                  disabled={isExtending}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtend}
                  disabled={isExtending}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:bg-rose-700"
                >
                  {isExtending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extending...
                    </>
                  ) : (
                    "Apply Extension"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
