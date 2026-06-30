"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Share2, 
  QrCode, 
  Heart, 
  Sparkles,
  ArrowRight,
  Download,
  X,
  Clock,
  Loader2
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
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
    const colors = ["#f43f5e", "#d946ef", "#a855f7", "#ec4899"];

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
          text: "I created a personalized website on HeartPage. Take a look before it expires in 7 days!",
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

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=09090b&bgcolor=ffffff&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center space-y-8 relative backdrop-blur-md shadow-2xl z-10"
      >
        {/* Celebration Header */}
        <div className="space-y-3">
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 animate-pulse" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase">
            Website Generated!
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Your custom HeartPage is now active and ready to share. Remember, this page is temporary and will delete automatically in 7 days.
          </p>
        </div>

        {/* Link Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-inner">
          <span className="text-sm font-mono text-zinc-300 overflow-x-auto whitespace-nowrap scrollbar-none flex-1 text-left pr-2">
            {shareUrl || "Generating link..."}
          </span>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              copied
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300"
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

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href={`/s/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-500/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            Open Website <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleShare}
            className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <Share2 className="w-4 h-4" /> Share Link
          </button>

          <button
            onClick={() => setShowQr(true)}
            className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>

        {/* Additional Expiry Ticker */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium pt-2 border-t border-zinc-900">
          <Clock className="w-4 h-4 text-rose-500/80 animate-pulse" />
          <span>Expires in 7 days (auto-clears from database)</span>
        </div>
      </motion.div>

      {/* QR CODE MODAL DRAWER */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white text-zinc-950 rounded-3xl p-6 max-w-sm w-full space-y-6 relative shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowQr(false);
                  setQrLoaded(false);
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900">Scan QR Code</h3>
                <p className="text-zinc-500 text-xs">Scan using phone camera to instantly view</p>
              </div>

              {/* QR Container */}
              <div className="aspect-square bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                {!qrLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
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
                  className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Save Image
                </a>
                <button
                  onClick={() => setShowQr(false)}
                  className="flex-1 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="absolute bottom-6 left-0 w-full text-center text-xs text-zinc-600 z-10 font-mono">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> on <span className="font-bold text-rose-400">HeartPage</span>
        </p>
      </footer>

    </div>
  );
}
