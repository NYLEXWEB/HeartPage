"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, EyeOff, BookOpen, Sunset } from "lucide-react";

interface BreakupTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string; // Relationship Period (e.g. "2018 - 2024" or date)
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

interface RainDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
}

export default function BreakupTemplate({
  yourName = "Riley",
  partnerName = "Casey",
  relationshipDate = "2021 - 2025",
  message = "Sometimes things fall apart so that better things can fall together. Thank you for the lessons, the laughter, and the time we shared. I will always wish you the best, wherever your path leads.",
  images = [],
  theme = "dark",
  isPreview = false,
}: BreakupTemplateProps) {
  const isDark = theme === "dark";
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  // Generate rain drops
  useEffect(() => {
    const drops = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage width
      delay: Math.random() * 5, // random delay
      duration: Math.random() * 1.5 + 1.2, // speed
      opacity: Math.random() * 0.3 + 0.1, // opacity
    }));
    const timer = setTimeout(() => {
      setRainDrops(drops);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Theme settings (cream white and light blue theme)
  const bgClass = isDark ? "bg-mesh-breakup-dark text-slate-700" : "bg-mesh-breakup-light text-slate-700";
  const textTitleClass = isDark ? "text-slate-900 font-minimal" : "text-slate-900 font-minimal";
  const cardBgClass = isDark ? "bg-white border border-sky-100 shadow-sm" : "bg-white border border-sky-100 shadow-sm";
  const quoteTextClass = isDark ? "text-slate-650" : "text-slate-650";
  const dateBadgeClass = isDark ? "bg-sky-50 border border-sky-100 text-sky-700 font-mono" : "bg-sky-50 border border-sky-100 text-sky-700 font-mono";

  return (
    <div className={`min-h-screen w-full relative overflow-hidden pb-20 ${bgClass} transition-colors duration-500`}>
      {/* Rain Particle Effects */}
      <div className="rain-container">
        {rainDrops.map((drop) => (
          <div
            key={drop.id}
            className="rain-drop"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>

      {isPreview && (
        <div className="sticky top-0 z-50 w-full bg-sky-500 text-white text-center py-1 text-xs font-mono uppercase tracking-widest shadow-md">
          Preview Mode
        </div>
      )}

      {/* HERO SECTION */}
      <section className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center text-center relative z-20 min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-sky-50 mb-2 border border-sky-100 text-sky-500">
            <Sunset className="w-6 h-6 animate-pulse" />
          </div>
          
          <h1 className={`text-4xl md:text-7xl leading-tight font-medium ${textTitleClass} uppercase tracking-widest`}>
            {yourName} <span className="text-sky-500 font-light">&amp;</span> {partnerName}
          </h1>

          {relationshipDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.2 }}
              className="inline-block mt-4"
            >
              <span className={`px-5 py-1.5 rounded-none text-xs md:text-sm font-mono tracking-widest ${dateBadgeClass}`}>
                PERIOD: {relationshipDate}
              </span>
            </motion.div>
          )}

          <p className="text-slate-500 font-minimal text-xs md:text-sm max-w-xl mx-auto uppercase tracking-widest leading-relaxed mt-4">
            &ldquo;We do not remember days, we remember moments.&rdquo;
          </p>
        </motion.div>
      </section>

      {/* FINAL LETTER */}
      <section className="container mx-auto px-4 py-12 relative z-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className={`rounded-none p-8 md:p-12 shadow-xl border ${cardBgClass}`}
        >
          <div className="flex items-center gap-2 mb-6 border-b border-sky-100 pb-4 text-xs font-mono uppercase tracking-widest text-sky-600">
            <Mail className="w-4 h-4" />
            <span>A Final Note</span>
          </div>

          <p className="font-mono text-sm md:text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
            {message}
          </p>
        </motion.div>
      </section>

      {/* CHAPTER TIMELINE */}
      <section className="container mx-auto px-4 py-16 relative z-20 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className={`text-2xl md:text-4xl font-minimal uppercase tracking-widest mb-4 ${textTitleClass}`}>
            The Timeline
          </h2>
          <div className="w-8 h-[1px] bg-sky-400 mx-auto"></div>
        </div>

        <div className="space-y-12">
          {[
            {
              chapter: "Chapter I: The Spark",
              title: "Where It All Began",
              desc: "A brief meeting, a shared glance, and the sudden warmth of realizing someone new had entered the story.",
            },
            {
              chapter: "Chapter II: The Glow",
              title: "Under the Sun",
              desc: "Days filled with infinite conversation, building a foundation of shared laughter and hopes.",
            },
            {
              chapter: "Chapter III: The Drift",
              title: "Quiet Spaces",
              desc: "The slow realization that paths diverge, and sometimes holding on tightly does not change the wind.",
            },
            {
              chapter: "Chapter IV: The Acceptance",
              title: "Letting Go",
              desc: "Recognizing that some people enter our lives as beautiful chapters, not the whole book. Wishing peace to both journeys.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className={`p-6 border-l border-sky-200/50 ${cardBgClass} flex flex-col md:flex-row md:items-start gap-4`}
            >
              <div className="text-xs font-mono uppercase tracking-widest text-sky-650 w-32 shrink-0">
                {item.chapter}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-minimal uppercase tracking-widest text-slate-800">
                  {item.title}
                </h3>
                <p className="text-slate-500 font-mono text-xs md:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ENDING STATEMENT */}
      <section className="container mx-auto px-4 py-20 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="max-w-xl mx-auto space-y-6"
        >
          <BookOpen className="w-5 h-5 mx-auto text-sky-500" />
          <h2 className={`text-xl md:text-2xl font-minimal leading-relaxed uppercase tracking-wider ${quoteTextClass}`}>
            &ldquo;Some things are beautiful precisely because they are temporary.&rdquo;
          </h2>
          <div className="pt-6 font-mono text-xs uppercase tracking-widest text-sky-500">
            End of Record
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-[10px] text-slate-500 z-20 font-mono uppercase tracking-widest">
        <p className="flex items-center justify-center gap-2">
          <span>Logged via</span>
          <span className="font-semibold text-sky-500">HeartPage</span>
          <span>&middot;</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-sky-550" /> 7D TTL ACTIVE</span>
        </p>
      </footer>
    </div>
  );
}
