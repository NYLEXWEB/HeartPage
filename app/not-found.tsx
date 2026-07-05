"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeartCrack, ArrowLeft, Clock } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Animated Heart Crack Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 10,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 2
          }}
          className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 text-rose-500 flex items-center justify-center mx-auto shadow-xl"
        >
          <HeartCrack className="w-10 h-10" />
        </motion.div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase font-mono">
            404 Not Found
          </h1>
          <h2 className="text-xl font-semibold text-zinc-300">
            This space has expired or does not exist.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
            To keep HeartPage clean and secure, all personalized pages are automatically deleted after exactly 5 days. It is possible this link has reached its expiration limit.
          </p>
        </div>

        {/* Info expiration badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs font-medium font-mono">
          <Clock className="w-3.5 h-3.5" /> 5-DAY TTL INDEX AUTO-DELETE
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
          
          <Link
            href="/create"
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-sm shadow-lg shadow-rose-500/10 hover:scale-[1.01]"
          >
            Create a New HeartPage
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 w-full text-center text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
        HeartPage &middot; Error Logging System
      </footer>
    </div>
  );
}
