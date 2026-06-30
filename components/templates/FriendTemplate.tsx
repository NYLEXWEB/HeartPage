"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Gift, MessageCircle, Heart, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface FriendTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

interface EmojiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  spin: number;
  xOffset1: number;
  xOffset2: number;
}

const EMOJIS = ["🥳", "🤝", "😂", "🍕", "🌟", "🎸", "🍦", "🔥", "👽", "🦄"];

export default function FriendTemplate({
  yourName = "Sam",
  partnerName = "Taylor",
  relationshipDate = "2020-09-15",
  message = "You are the cheese to my macaroni, the peanut butter to my jelly, and the partner in crime for all my terrible ideas. Thanks for always being there!",
  images = [],
  theme = "light",
  isPreview = false,
}: FriendTemplateProps) {
  const isDark = theme === "dark";
  const [emojis, setEmojis] = useState<EmojiParticle[]>([]);

  // Trigger confetti on load
  useEffect(() => {
    // A small burst of confetti to welcome the user
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Generate floating emojis
  useEffect(() => {
    const generated = Array.from({ length: 12 }).map((_, i) => {
      const x = Math.random() * 100;
      return {
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        x,
        y: 100 + Math.random() * 20,
        size: Math.random() * 24 + 16,
        delay: Math.random() * 8,
        duration: Math.random() * 8 + 6,
        spin: Math.random() * 360 - 180,
        xOffset1: x + (Math.random() * 8 - 4),
        xOffset2: x - (Math.random() * 8 - 4),
      };
    });
    const timer = setTimeout(() => {
      setEmojis(generated);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const triggerBadgeConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Neo-brutalist theme configuration (cream white and light blue theme)
  const bgClass = isDark ? "bg-mesh-friends-dark text-slate-800" : "bg-mesh-friends-light text-slate-850";
  const textTitleClass = isDark ? "text-sky-600 font-fun" : "text-sky-600 font-fun";
  const cardBorderClass = isDark ? "border-sky-350" : "border-sky-400";
  
  // Custom colors for neo-brutalist cards
  const stickerColors = [
    "bg-white text-slate-850",
    "bg-sky-50 text-slate-800",
    "bg-white text-slate-900",
    "bg-[#FCFAF7] text-slate-850",
  ];

  return (
    <div className={`min-h-screen w-full relative overflow-hidden pb-20 ${bgClass} transition-colors duration-500`}>
      {/* Floating Emojis Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <AnimatePresence>
          {emojis.map((p) => (
            <motion.div
              key={p.id}
              className="absolute select-none opacity-20 md:opacity-30"
              style={{
                left: `${p.x}%`,
                fontSize: `${p.size}px`,
              }}
              initial={{ y: "110vh", opacity: 0, rotate: 0 }}
              animate={{
                y: "-10vh",
                opacity: [0, 0.6, 0.6, 0],
                rotate: p.spin,
                x: [`${p.x}%`, `${p.xOffset1}%`, `${p.xOffset2}%`],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isPreview && (
        <div className="sticky top-0 z-50 w-full bg-sky-500 text-white text-center py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
          Live Preview Mode
        </div>
      )}

      {/* HERO SECTION */}
      <section className="container mx-auto px-4 pt-20 pb-16 flex flex-col items-center justify-center text-center relative z-20 min-h-[75vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="space-y-6 max-w-4xl"
        >
          {/* Animated sticker badge */}
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className={`inline-block px-6 py-2 border-3 ${cardBorderClass} bg-sky-100 text-sky-850 rounded-full font-fun text-sm md:text-base uppercase tracking-wider font-extrabold shadow-[4px_4px_0px_rgba(14,165,233,0.3)]`}
          >
            Best Friends Forever 🤝
          </motion.div>

          <h1 className={`text-6xl md:text-9xl leading-none font-black ${textTitleClass} uppercase tracking-tight`}>
            {yourName} <br className="hidden md:inline" />
            <span className="text-white bg-sky-500 px-4 py-2 border-3 border-sky-650 inline-block transform -rotate-2 my-2 shadow-[6px_6px_0px_#0284C7] text-4xl md:text-7xl">AND</span><br className="hidden md:inline" />
            {partnerName}
          </h1>

          {relationshipDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block mt-4"
            >
              <div className="bg-sky-50 border-2 border-sky-300 px-6 py-2 rounded-xl text-sky-800 font-fun font-bold shadow-[3px_3px_0px_rgba(14,165,233,0.3)]">
                BESTIES SINCE {new Date(relationshipDate).getFullYear()}!
              </div>
            </motion.div>
          )}

          <p className="text-slate-500 font-fun text-lg md:text-2xl max-w-2xl mx-auto mt-6">
            Two souls, one brain cell. Welcome to our secret corner of the web!
          </p>
        </motion.div>
      </section>

      {/* FUNNY QUOTE CARD */}
      <section className="container mx-auto px-4 py-12 relative z-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, rotate: -3 }}
          whileInView={{ opacity: 1, rotate: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80 }}
          whileHover={{ rotate: -1, scale: 1.01 }}
          className={`border-3 ${cardBorderClass} bg-white p-8 md:p-12 rounded-3xl shadow-[8px_8px_0px_#7dd3fc] relative`}
        >
          {/* Top-right emoji sticker */}
          <div className="absolute -top-6 -right-4 bg-sky-500 border-2 border-sky-600 text-white p-3 rounded-full font-bold transform rotate-12 text-2xl shadow-[2px_2px_0px_#0284C7]">
            🍕
          </div>
          
          <h2 className="text-xl md:text-2xl font-fun font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-sky-550" />
            A Message From {yourName}
          </h2>

          <p className="font-fun font-bold text-2xl md:text-4xl leading-relaxed text-sky-600 italic">
            &ldquo;{message}&rdquo;
          </p>
        </motion.div>
      </section>

      {/* STORY CARDS & SHENANIGANS TIMELINE */}
      <section className="container mx-auto px-4 py-16 relative z-20 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-fun font-black uppercase text-slate-900">
            Our Shenanigans
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Partner In Crime 🕵️",
              desc: "From sneaking out to plotting late-night taco runs, we always have each other's back, no questions asked.",
              colorIdx: 0,
            },
            {
              title: "Inside Jokes 😂",
              desc: "We can communicate entire paragraphs with just one look. Nobody else understands our humor, and that's exactly how we like it.",
              colorIdx: 1,
            },
            {
              title: "Late Night Calls 📞",
              desc: "Deep life talks, crying about fictional characters, or just sitting in comfortable silence for hours on FaceTime.",
              colorIdx: 2,
            },
            {
              title: "Through Thick & Thin 💖",
              desc: "No matter how chaotic life gets or how far apart we are, nothing will ever change this legendary friendship.",
              colorIdx: 3,
            },
          ].map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-2xl border-3 border-sky-300 shadow-[6px_6px_0px_#7dd3fc] ${stickerColors[story.colorIdx % stickerColors.length]}`}
            >
              <h3 className="text-xl md:text-2xl font-fun font-black mb-3 uppercase tracking-tight text-slate-900">
                {story.title}
              </h3>
              <p className="font-fun font-medium leading-relaxed text-sm md:text-base text-slate-650">
                {story.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FRIENDSHIP BADGE (INTERACTIVE) */}
      <section className="container mx-auto px-4 py-16 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="relative inline-block">
            {/* Interactive Badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerBadgeConfetti}
              className={`px-10 py-10 rounded-full border-4 border-sky-400 bg-sky-100 text-sky-850 font-fun font-black text-xl md:text-3xl shadow-[8px_8px_0px_#7dd3fc] uppercase tracking-tighter cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-sky-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              <Trophy className="w-12 h-12 mb-2 animate-bounce text-sky-500" />
              <span>Certified</span>
              <span className="text-sky-600 text-2xl md:text-4xl block group-hover:text-sky-800">BESTIES</span>
              <span className="text-xs uppercase tracking-widest mt-2 bg-sky-500 text-white px-3 py-1 rounded-full border border-sky-600">Click for joy! 🎉</span>
            </motion.button>

            {/* Explanatory badge arrow */}
            <div className="hidden md:block absolute -right-32 top-10 transform rotate-12 text-sm text-slate-400 font-fun font-bold">
              ← Press it!
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-500 z-20 font-fun">
        <p className="flex items-center justify-center gap-1 font-bold">
          Made with <Heart className="w-3.5 h-3.5 text-sky-500 fill-sky-500 animate-pulse" /> on <span className="font-extrabold text-white bg-sky-500 px-2 py-0.5 border border-sky-650 rounded shadow-[1px_1px_0px_#0284C7]">HeartPage</span>
        </p>
      </footer>
    </div>
  );
}
