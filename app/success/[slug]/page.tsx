"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Share2, 
  QrCode, 
  Heart, 
  Sparkles,
  Download,
  X,
  Clock,
  Loader2
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFDFE]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

function SuccessPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const paymentId = searchParams.get("paymentId") || "N/A";
  const isFree = paymentId.includes("FREE") || paymentId === "N/A";
  
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  // Set share URL dynamically once component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/s/${slug}`);
    }
  }, [slug]);

  // Burst confetti on mount
  useEffect(() => {
    const end = Date.now() + 1.5 * 1000;
    const colors = ["#0ea5e9", "#38bdf8", "#0284C7", "#7dd3fc"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my HeartPage!",
          text: "I created a personalized website on HeartPage. Take a look before it expires in 5 days!",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy link
      handleCopy();
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="bg-[#FAFDFE] text-slate-800 min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-sky-200/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-cyan-200/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white border border-sky-100 rounded-3xl p-8 text-center space-y-6 relative backdrop-blur-md shadow-xl z-10"
      >
        {/* Celebration Header */}
        <div className="space-y-3">
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 animate-pulse" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-luxury font-extrabold tracking-tight text-slate-900 leading-tight">
            🎉 HeartPage Published Successfully
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your custom HeartPage is now live and fully accessible. Share the magic with your loved ones!
          </p>
        </div>

        {/* Link Box */}
        <div className="bg-[#FCFAF7] border border-sky-100 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-inner">
          <span className="text-sm font-mono text-slate-700 overflow-x-auto whitespace-nowrap scrollbar-none flex-1 pr-2 text-left">
            {shareUrl || "Generating link..."}
          </span>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              copied
                ? "bg-green-50 border border-green-200 text-green-600"
                : "bg-white border border-sky-150 hover:bg-sky-50 text-slate-655"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Payment Audit Logs Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Transaction Status</span>
            {isFree ? (
              <span className="bg-sky-50 border border-sky-100 text-sky-600 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                Free &amp; Active
              </span>
            ) : (
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse" />
                Paid &amp; Verified
              </span>
            )}
          </div>
          <div className="flex justify-between items-center font-mono">
            <span className="text-slate-400 font-medium font-sans font-semibold">Payment Reference</span>
            <span className="text-slate-750 font-bold select-all tracking-wider">{isFree ? "Free (Bypassed)" : paymentId}</span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href={`/s/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-500/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            Open Website <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleShare}
            className="py-3 bg-white hover:bg-sky-50 text-slate-700 border border-sky-150 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <Share2 className="w-4 h-4 text-sky-500" /> Share Link
          </button>

          <button
            onClick={() => setShowQr(true)}
            className="py-3 bg-white hover:bg-sky-50 text-slate-700 border border-sky-150 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <QrCode className="w-4 h-4 text-sky-500" /> QR Code
          </button>
        </div>

        {/* Additional Expiry Ticker */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pt-2 border-t border-sky-100">
          <Clock className="w-4 h-4 text-sky-550 animate-pulse" />
          <span>Expires in 5 days (auto-clears from database)</span>
        </div>
      </motion.div>

      {/* QR CODE MODAL DRAWER */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-sky-100 rounded-3xl p-6 max-w-sm w-full space-y-6 relative shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowQr(false);
                  setQrLoaded(false);
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-850 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-luxury font-extrabold tracking-tight text-slate-900">Scan QR Code</h3>
                <p className="text-slate-500 text-xs">Scan using phone camera to instantly view</p>
              </div>

              {/* QR Container */}
              <div className="aspect-square bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                {!qrLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="HeartPage QR Code"
                  onLoad={() => setQrLoaded(true)}
                  className={`w-full h-full object-contain ${qrLoaded ? "opacity-100" : "opacity-0"}`}
                />
              </div>

              <div className="flex gap-2">
                <a
                  href={qrCodeUrl}
                  download={`heartpage-qr-${slug}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Save Image
                </a>
                <button
                  onClick={() => setShowQr(false)}
                  className="flex-1 py-3 border border-sky-150 hover:bg-sky-50 rounded-xl text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="absolute bottom-6 left-0 w-full text-center text-xs text-slate-550 z-10">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-sky-500 fill-sky-500" /> on <span className="font-luxury font-bold text-sky-500">HeartPage</span>
        </p>
      </footer>

    </div>
  );
}
