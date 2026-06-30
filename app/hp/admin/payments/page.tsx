"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPaymentStats,
  getTransactions,
  getPaymentDetails,
  getPricingConfig,
  updatePrice,
  getExportTransactions
} from "@/actions/admin-payments";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Settings,
  ShieldCheck,
  Globe,
  Database,
  ArrowRight,
  FileSpreadsheet,
  TrendingDown
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  _id: string;
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: "Pending" | "Paid" | "Failed" | "Refunded";
  verificationStatus: "Unverified" | "Verified" | "Failed";
  webhookStatus: "NotReceived" | "Received" | "Processed" | "Failed";
  customerName: string;
  websiteSlug: string;
  category: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPaymentsPage() {
  // Stats and charts state
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Transactions list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [method, setMethod] = useState("all");
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Configuration settings state
  const [config, setConfig] = useState<any>(null);
  const [priceInput, setPriceInput] = useState("");
  const [priceUpdating, setPriceUpdating] = useState(false);
  const [priceSuccessMessage, setPriceSuccessMessage] = useState("");
  const [priceErrorMessage, setPriceErrorMessage] = useState("");

  // Detail view state
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [txDetails, setTxDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Notification feedback state
  const [toastMessage, setToastMessage] = useState("");

  // Initial load
  useEffect(() => {
    loadStatsData();
    loadConfigData();
  }, []);

  // Reload transactions when filters or page change
  useEffect(() => {
    loadTransactionsData();
  }, [currentPage, status, category, method, minAmount, maxAmount, startDate, endDate]);

  const loadStatsData = async () => {
    setStatsLoading(true);
    try {
      const res = await getPaymentStats();
      if (res.success) {
        setStats(res.stats);
        setCharts(res.charts);
      }
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadConfigData = async () => {
    try {
      const res = await getPricingConfig();
      if (res.success && res.config) {
        setConfig(res.config);
        setPriceInput(res.config.currentPrice.toString());
      }
    } catch (err) {
      console.error("Failed to load configs:", err);
    }
  };

  const loadTransactionsData = async () => {
    setTableLoading(true);
    try {
      const res = await getTransactions({
        page: currentPage,
        limit: 10,
        search,
        status,
        category,
        method,
        minAmount,
        maxAmount,
        startDate,
        endDate
      });
      if (res.success) {
        setTransactions(res.data);
        setTotalCount(res.pagination?.totalCount || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTransactionsData();
  };

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPriceUpdating(true);
    setPriceSuccessMessage("");
    setPriceErrorMessage("");

    const newPrice = parseFloat(priceInput);
    if (isNaN(newPrice) || newPrice <= 0) {
      setPriceErrorMessage("Please enter a valid price greater than zero.");
      setPriceUpdating(false);
      return;
    }

    try {
      const res = await updatePrice(newPrice);
      if (res.success) {
        setPriceSuccessMessage(`Publishing price updated successfully to ₹${newPrice}!`);
        loadConfigData();
        loadStatsData();
      } else {
        setPriceErrorMessage(res.error || "Failed to update pricing configuration.");
      }
    } catch (err: any) {
      setPriceErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setPriceUpdating(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const openDetails = async (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailsLoading(true);
    try {
      const res = await getPaymentDetails(tx._id);
      if (res.success) {
        setTxDetails(res.details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedTx(null);
    setTxDetails(null);
  };

  const handleExportCSV = async () => {
    try {
      const res = await getExportTransactions({
        search,
        status,
        category,
        method,
        minAmount,
        maxAmount,
        startDate,
        endDate
      });
      if (res.success && res.data) {
        const headers = [
          "Transaction ID",
          "Razorpay Payment ID",
          "Razorpay Order ID",
          "Website Slug",
          "Customer Name",
          "Category",
          "Theme",
          "Amount (INR)",
          "Payment Status",
          "Payment Method",
          "Created Date",
          "Verification Status",
          "Webhook Status"
        ];
        
        const csvRows = [headers.join(",")];
        for (const item of res.data) {
          const values = [
            item.paymentId || "",
            item.razorpayPaymentId || "",
            item.razorpayOrderId || "",
            item.websiteSlug || "",
            `"${(item.customerName || "").replace(/"/g, '""')}"`,
            item.category || "",
            item.theme || "",
            item.amount || 0,
            item.status || "",
            item.paymentMethod || "",
            item.createdAt || "",
            item.verificationStatus || "",
            item.webhookStatus || ""
          ];
          csvRows.push(values.join(","));
        }

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `heartpage_payments_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("CSV report exported successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to export CSV report.");
    }
  };

  // Helper stats values (safeguards)
  const totalRevenue = stats?.totalRevenue || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const weeklyRevenue = stats?.weeklyRevenue || 0;
  const monthlyRevenue = stats?.monthlyRevenue || 0;
  const yearlyRevenue = stats?.yearlyRevenue || 0;
  const successfulCount = stats?.totalSuccessful || 0;
  const pendingCount = stats?.totalPending || 0;
  const failedCount = stats?.totalFailed || 0;
  const refundedCount = stats?.totalRefunded || 0;
  const avgValue = stats?.averageTransactionValue || 0;
  const convRate = stats?.conversionRate || 0;
  const growthRate = stats?.revenueGrowthPercentage || 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Finance Operations</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Payment &amp; Revenue Settings</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              loadStatsData();
              loadConfigData();
              loadTransactionsData();
              showToast("Refreshing financial logs...");
            }}
            className="p-3 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-950/20 transition-all cursor-pointer font-mono"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Revenue Total */}
        <motion.div whileHover={{ y: -2 }} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">₹{totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{growthRate}%
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Lifetime cumulative collections</p>
        </motion.div>

        {/* Metric 2: Today Revenue */}
        <motion.div whileHover={{ y: -2 }} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Today&apos;s Revenue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">₹{todayRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 font-mono">24h window</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Daily operational revenue flow</p>
        </motion.div>

        {/* Metric 3: Avg Transaction */}
        <motion.div whileHover={{ y: -2 }} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Avg Ticket Size</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">₹{avgValue.toFixed(2)}</span>
            <span className="text-[10px] text-indigo-400 font-mono">AVERAGE</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Revenue generated per paid site</p>
        </motion.div>

        {/* Metric 4: Conversion Rate */}
        <motion.div whileHover={{ y: -2 }} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{convRate.toFixed(1)}%</span>
            <span className="text-[10px] text-teal-400 font-mono">PAID / TOTAL</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Percentage conversion from checkout</p>
        </motion.div>

      </div>

      {/* REVENUE SETTINGS & CONFIG STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pricing Configuration settings */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">HeartPage Publish Price</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Configure the price required for users to launch websites dynamically</p>
          </div>

          <form onSubmit={handlePriceUpdate} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Publishing price (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500 rounded-xl pl-9 pr-4 py-3 text-sm font-mono text-white placeholder-zinc-700 outline-none transition-colors"
                  placeholder="e.g. 49.00"
                  required
                />
              </div>
            </div>

            {priceSuccessMessage && (
              <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {priceSuccessMessage}
              </p>
            )}
            {priceErrorMessage && (
              <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> {priceErrorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={priceUpdating}
              className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold font-mono transition-colors disabled:opacity-50 cursor-pointer"
            >
              {priceUpdating ? "UPDATING PRICE..." : "SAVE PRICING"}
            </button>
          </form>

          <p className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-900/60 pt-3">
            * Backend calculates checkout values. Price updates take effect immediately on new orders only.
          </p>
        </div>

        {/* Integration Status indicators */}
        <div className="lg:col-span-2 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">Razorpay Integration</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Audit status of variables and security layers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            
            {/* Connected status */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-900/50 rounded-2xl flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config?.razorpayConnected ? "bg-emerald-950/20 text-emerald-400" : "bg-rose-950/20 text-rose-400"}`}>
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300">Razorpay Connection</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{config?.razorpayConnected ? "✅ ACTIVE CONNECTED" : "❌ DISCONNECTED"}</p>
              </div>
            </div>

            {/* Key ID config */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-900/50 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300">Key ID Status</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{config?.keyIdStatus === "Configured" ? "✅ Configured" : "❌ Missing"}</p>
              </div>
            </div>

            {/* Secret key config */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-900/50 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300">Secret Key Status</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{config?.secretKeyStatus === "Configured (Hidden)" ? "✅ Configured (Hidden)" : "❌ Missing"}</p>
              </div>
            </div>

            {/* Webhook verification status */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-900/50 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300">Webhook Signatures</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{config?.webhookVerificationStatus === "Configured" ? "✅ Secure Webhooks active" : "❌ Missing keys"}</p>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Database Status: <strong className="text-emerald-400">{config?.databaseConnectionStatus || "Checking..."}</strong></span>
            <span>Keys are secured inside server environment variables.</span>
          </div>
        </div>

      </div>

      {/* SVG CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Daily Revenue last 14 days) */}
        <div className="lg:col-span-2 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">Daily Revenue Flow</h3>
            <p className="text-xs text-zinc-500">Visual trend representation of income in the last 14 days</p>
          </div>

          <div className="h-44 w-full mt-6 relative flex items-end">
            {/* Visual SVG line representing daily revenue */}
            {charts?.dailyRevenue && charts.dailyRevenue.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* SVG path generator */}
                {(() => {
                  const dataLen = charts.dailyRevenue.length;
                  const maxRev = Math.max(...charts.dailyRevenue.map((d: any) => d.revenue), 100);
                  const points = charts.dailyRevenue.map((d: any, idx: number) => {
                    const x = (idx / (dataLen - 1)) * 100;
                    const y = 35 - (d.revenue / maxRev) * 30; // Scale and translate
                    return `${x},${y}`;
                  });

                  const linePath = `M ${points.join(" L ")}`;
                  const areaPath = `${linePath} L 100,40 L 0,40 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#gradient-area)" />
                      <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div className="w-full text-center py-12 text-xs text-zinc-600 font-mono">
                Insufficient data to plot line chart. Deferring metrics.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-4 border-t border-zinc-900/60 pt-3">
            <span>Highest Day: <strong>₹{(stats?.highestRevenueDay || 0).toFixed(2)}</strong></span>
            <span>Average Daily: <strong>₹{(stats?.averageDailyRevenue || 0).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Status & Method Breakdown pie graph representation */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">Status &amp; Categories</h3>
            <p className="text-xs text-zinc-500">Distribution of successful vs failed payments</p>
          </div>

          <div className="my-6 space-y-4 font-mono text-xs">
            
            {/* Successful volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">✅ Paid Orders</span>
                <span className="text-white font-bold">{successfulCount} ({convRate.toFixed(1)}%)</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${convRate}%` }} />
              </div>
            </div>

            {/* Pending volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">⏳ Pending Checkouts</span>
                <span className="text-white font-bold">{pendingCount}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(pendingCount / (successfulCount + pendingCount + failedCount || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Failed volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">❌ Failed Checkouts</span>
                <span className="text-white font-bold">{failedCount}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(failedCount / (successfulCount + pendingCount + failedCount || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Refunded volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">🔄 Refunded Transactions</span>
                <span className="text-white font-bold">{refundedCount}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-700 rounded-full"
                  style={{ width: `${(refundedCount / (successfulCount + pendingCount + failedCount || 1)) * 100}%` }}
                />
              </div>
            </div>

          </div>

          <div className="text-[10px] text-zinc-500 font-mono pt-3 border-t border-zinc-900/60 text-center">
            Gross conversion rate tracks completed transactions.
          </div>
        </div>

      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">Filter Transactions</h3>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-rose-500 transition-colors"
              placeholder="Search ID, Slug, Customer..."
            />
          </div>

          {/* Status selector */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-rose-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Category selector */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-rose-500 transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="couples">Couples</option>
            <option value="friends">Friends</option>
            <option value="breakup">Breakup</option>
          </select>

          {/* Method selector */}
          <select
            value={method}
            onChange={(e) => { setMethod(e.target.value); setCurrentPage(1); }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-rose-500 transition-colors"
          >
            <option value="all">All Payment Methods</option>
            <option value="card">Cards</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallets</option>
          </select>

          {/* Date range start */}
          <div>
            <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
            />
          </div>

          {/* Date range end */}
          <div>
            <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Min Amount (₹)</label>
            <input
              type="number"
              value={minAmount || ""}
              onChange={(e) => { setMinAmount(e.target.value ? Number(e.target.value) : undefined); setCurrentPage(1); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
              placeholder="Min ₹"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Max Amount (₹)</label>
            <input
              type="number"
              value={maxAmount || ""}
              onChange={(e) => { setMaxAmount(e.target.value ? Number(e.target.value) : undefined); setCurrentPage(1); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
              placeholder="Max ₹"
            />
          </div>
        </form>

        <div className="flex justify-end gap-2 text-xs font-mono">
          <button
            onClick={() => {
              setSearch("");
              setStatus("all");
              setCategory("all");
              setMethod("all");
              setMinAmount(undefined);
              setMaxAmount(undefined);
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
          >
            Clear Filters
          </button>
          <button
            onClick={() => { setCurrentPage(1); loadTransactionsData(); }}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-900/30 text-rose-400 rounded-lg cursor-pointer"
          >
            Apply Query
          </button>
        </div>
      </div>

      {/* TRANSACTIONS TABLE LIST */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase">Transaction Ledger</h3>
            <p className="text-xs text-zinc-500">Database log audit for all checkout requests</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            Total records: <strong>{totalCount}</strong>
          </span>
        </div>

        {tableLoading ? (
          <div className="space-y-4 py-12">
            <div className="h-10 bg-zinc-900 rounded animate-pulse" />
            <div className="h-28 bg-zinc-900 rounded animate-pulse" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400 font-mono">
              <thead className="bg-zinc-900/40 text-zinc-500 border-b border-zinc-900">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Ref ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/30">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white max-w-[120px] truncate">
                        <span onClick={() => copyToClipboard(tx.paymentId, "Payment Reference")} className="hover:underline cursor-pointer flex items-center gap-1">
                          {tx.paymentId}
                          <Copy className="w-3 h-3 text-zinc-600 inline shrink-0" />
                        </span>
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-[120px]" title={tx.customerName}>
                        {tx.customerName}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link href={`/s/${tx.websiteSlug}`} target="_blank" className="hover:underline text-rose-400 flex items-center gap-1">
                          /{tx.websiteSlug}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-200">
                        ₹{tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === "Paid"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20"
                            : tx.status === "Pending"
                            ? "bg-amber-950/40 text-amber-400 border border-amber-900/20"
                            : "bg-rose-950/40 text-rose-400 border border-rose-900/20"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-zinc-300 font-bold">
                        {tx.paymentMethod || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] flex items-center gap-1 ${
                          tx.verificationStatus === "Verified" ? "text-emerald-400" : tx.verificationStatus === "Failed" ? "text-rose-400" : "text-zinc-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.verificationStatus === "Verified" ? "bg-emerald-500" : tx.verificationStatus === "Failed" ? "bg-rose-500" : "bg-zinc-600"
                          }`} />
                          {tx.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => openDetails(tx)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View Transaction Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-zinc-600">
                      No payment records found matching the query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-900 text-xs font-mono">
            <span className="text-zinc-500">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER / MODAL: VIEW DETAILS */}
      <AnimatePresence>
        {selectedTx && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={closeDetails}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-lg bg-zinc-950 border-l border-zinc-900 z-50 p-6 sm:p-8 overflow-y-auto space-y-8 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Transaction Info</span>
                    <h3 className="text-lg font-bold text-white font-mono mt-1">{selectedTx.paymentId}</h3>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer font-mono"
                  >
                    CLOSE
                  </button>
                </div>

                {/* Customer block */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">1. Customer Information</h4>
                  <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Name:</span>
                      <span className="text-white font-bold">{selectedTx.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Website Slug:</span>
                      <Link href={`/s/${selectedTx.websiteSlug}`} target="_blank" className="text-rose-400 hover:underline flex items-center gap-1">
                        /{selectedTx.websiteSlug}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Category:</span>
                      <span className="text-zinc-300 font-bold uppercase">{selectedTx.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Theme:</span>
                      <span className="text-zinc-300 font-bold uppercase">{selectedTx.theme}</span>
                    </div>
                  </div>
                </div>

                {/* Payment block */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">2. Razorpay Parameters</h4>
                  <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment ID:</span>
                      <span
                        onClick={() => selectedTx.razorpayPaymentId && copyToClipboard(selectedTx.razorpayPaymentId, "Razorpay Payment ID")}
                        className="text-white font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {selectedTx.razorpayPaymentId || "Not capture yet"}
                        {selectedTx.razorpayPaymentId && <Copy className="w-3 h-3 text-zinc-600" />}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Order ID:</span>
                      <span
                        onClick={() => copyToClipboard(selectedTx.razorpayOrderId, "Razorpay Order ID")}
                        className="text-white font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {selectedTx.razorpayOrderId}
                        <Copy className="w-3 h-3 text-zinc-600" />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Amount Charged:</span>
                      <span className="text-emerald-400 font-bold">₹{selectedTx.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment Method:</span>
                      <span className="text-zinc-300 font-bold uppercase">{selectedTx.paymentMethod || "Pending / Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Checkout Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedTx.status === "Paid" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {selectedTx.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit logs technical */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">3. Technical Security Logs</h4>
                  <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Signature Verify:</span>
                      <span className={selectedTx.verificationStatus === "Verified" ? "text-emerald-400" : "text-rose-400"}>
                        {selectedTx.verificationStatus === "Verified" ? "✅ Success Signature Checked" : `❌ ${selectedTx.verificationStatus}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Webhook Processing:</span>
                      <span className="text-zinc-300 font-bold">{selectedTx.webhookStatus}</span>
                    </div>
                    {txDetails?.webhookReceivedTime && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Webhook Executed:</span>
                        <span className="text-zinc-400 text-[11px]">
                          {new Date(txDetails.webhookReceivedTime).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IP Address:</span>
                      <span className="text-zinc-400 select-all">{selectedTx.ipAddress || "Unknown / Local"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-zinc-900/80 pt-2 mt-2">
                      <span className="text-zinc-500">User Agent:</span>
                      <span className="text-[10px] text-zinc-500 bg-zinc-950 p-2 rounded-lg leading-relaxed select-all">
                        {selectedTx.userAgent || "Unknown / Script"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer footer link */}
              <div className="border-t border-zinc-900 pt-4 flex gap-2">
                <button
                  onClick={closeDetails}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold font-mono rounded-xl transition-colors cursor-pointer"
                >
                  Return to Ledger
                </button>
                {txDetails?.websiteId && (
                  <Link
                    href={`/s/${selectedTx.websiteSlug}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg transition-all"
                  >
                    <span>OPEN WEBSITE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
