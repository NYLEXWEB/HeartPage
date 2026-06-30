"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, Compass, Star, MapPin } from "lucide-react";

interface CoupleTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  xOffset1: number;
  xOffset2: number;
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
      return `${months[monthIndex]} ${day}, ${year}`;
    }
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

export default function CoupleTemplate({
  yourName = "Alex",
  partnerName = "Jordan",
  relationshipDate = "2024-01-01",
  message = "Every single day with you is a gift. From the quiet mornings to the wild adventures, you are my home. Here's to us, our past, and our beautiful future.",
  images = [],
  theme = "light",
  isPreview = false,
}: CoupleTemplateProps) {
  const isDark = theme === "dark";
  const [timeDiff, setTimeDiff] = useState({ years: 0, months: 0, days: 0, totalDays: 0 });
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  // Calculate elapsed time
  useEffect(() => {
    if (!relationshipDate) return;
    
    const calculateTime = () => {
      const start = new Date(relationshipDate);
      // Validate date
      if (isNaN(start.getTime())) return;
      
      const now = new Date();
      const differenceMs = now.getTime() - start.getTime();
      
      if (differenceMs < 0) {
        setTimeDiff({ years: 0, months: 0, days: 0, totalDays: 0 });
        return;
      }

      const totalDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      setTimeDiff({ years, months, days, totalDays });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [relationshipDate]);

  // Generate floating hearts
  useEffect(() => {
    const generatedHearts = Array.from({ length: 15 }).map((_, i) => {
      const x = Math.random() * 100;
      return {
        id: i,
        x,
        y: 100 + Math.random() * 20, // start below viewport
        size: Math.random() * 20 + 10, // size in px
        delay: Math.random() * 10,
        duration: Math.random() * 10 + 8,
        xOffset1: x + (Math.random() * 10 - 5),
        xOffset2: x - (Math.random() * 10 - 5),
      };
    });
    const timer = setTimeout(() => {
      setHearts(generatedHearts);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Background and styles based on theme (cream white and light blue)
  const bgClass = isDark ? "bg-mesh-couples-dark text-slate-800" : "bg-mesh-couples-light text-slate-800";
  const textTitleClass = isDark ? "text-sky-600 font-luxury romantic-glow" : "text-slate-900 font-luxury romantic-glow";
  const cardBgClass = isDark ? "bg-white/90 border border-sky-100 shadow-sm" : "bg-white/80 border border-sky-100 shadow-sm";
  const accentTextClass = isDark ? "text-sky-500" : "text-sky-600";
  const dateBadgeClass = isDark ? "bg-sky-50 border border-sky-100 text-sky-700 font-semibold" : "bg-sky-50 border border-sky-100 text-sky-700 font-semibold";

  return (
    <div className={`min-h-screen w-full relative overflow-hidden pb-20 ${bgClass} transition-colors duration-500`}>
      {/* Floating Hearts Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              className="absolute text-sky-500/20"
              style={{
                left: `${heart.x}%`,
                fontSize: `${heart.size}px`,
              }}
              initial={{ y: "110vh", opacity: 0, scale: 0.5 }}
              animate={{
                y: "-10vh",
                opacity: [0, 0.7, 0.7, 0],
                x: [`${heart.x}%`, `${heart.xOffset1}%`, `${heart.xOffset2}%`],
                scale: [0.5, 1.2, 1, 0.8],
              }}
              transition={{
                duration: heart.duration,
                delay: heart.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart fill="currentColor" className="w-full h-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isPreview && (
        <div className="sticky top-0 z-50 w-full bg-sky-550 text-white text-center py-1 text-xs font-semibold uppercase tracking-widest shadow-md">
          Live Preview Mode
        </div>
      )}

      {/* LUXURY HERO SECTION */}
      <section className="container mx-auto px-4 pt-20 pb-16 flex flex-col items-center justify-center text-center relative z-20 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-sky-50 mb-2 border border-sky-100">
            <Heart className="w-8 h-8 text-sky-500 animate-pulse" fill="currentColor" />
          </div>
          
          <h1 className={`text-5xl md:text-8xl tracking-tight leading-tight ${textTitleClass}`}>
            {yourName} <span className="text-sky-500 font-sans">&amp;</span> {partnerName}
          </h1>

          {relationshipDate && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="inline-block mt-4"
            >
              <span className={`px-4 py-2 rounded-full text-sm md:text-base tracking-wider ${dateBadgeClass}`}>
                SINCE {formatDate(relationshipDate)}
              </span>
            </motion.div>
          )}

          <p className="text-slate-500 font-serif italic text-lg md:text-2xl mt-4">
            &ldquo;In all the world, there is no heart for me like yours.&rdquo;
          </p>
        </motion.div>
      </section>

      {/* RELATIONSHIP COUNTER */}
      {relationshipDate && timeDiff.totalDays > 0 && (
        <section className="container mx-auto px-4 py-12 relative z-20 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`rounded-3xl p-8 md:p-12 text-center shadow-xl ${cardBgClass}`}
          >
            <h2 className="text-xl md:text-2xl uppercase tracking-widest text-slate-400 mb-6 font-semibold">
              Time Spent Together
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Years", value: timeDiff.years },
                { label: "Months", value: timeDiff.months },
                { label: "Days", value: timeDiff.days },
                { label: "Total Days", value: timeDiff.totalDays, span: "col-span-2 md:col-span-1" },
              ].map((item, index) => (
                <div key={index} className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-sky-50/50 border border-sky-100/50 ${item.span || ""}`}>
                  <span className={`text-4xl md:text-5xl font-bold font-luxury ${accentTextClass}`}>
                    {item.value}
                  </span>
                  <span className="text-slate-400 text-xs md:text-sm uppercase tracking-wider mt-2">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* PROPOSAL / LOVE MESSAGE */}
      <section className="container mx-auto px-4 py-16 relative z-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={`rounded-3xl p-8 md:p-12 shadow-xl text-center font-luxury text-xl md:text-3xl leading-relaxed relative ${cardBgClass}`}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-sky-550 text-white rounded-full p-3 shadow-lg">
            <Heart className="w-6 h-6" fill="currentColor" />
          </div>
          <p className="mt-4 italic text-slate-800">
            &ldquo;{message}&rdquo;
          </p>
        </motion.div>
      </section>

      {/* TIMELINE */}
      <section className="container mx-auto px-4 py-16 relative z-20 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-luxury mb-4 text-slate-900">
            Our Love Story
          </h2>
          <div className="w-12 h-1 bg-sky-400 mx-auto rounded-full"></div>
        </div>

        <div className="relative border-l border-sky-200/50 ml-4 md:mx-auto md:w-0">
          {[
            {
              title: "When We First Met",
              desc: "The universe aligned and our paths crossed. A spark that changed everything.",
              icon: Compass,
            },
            {
              title: "Our First Date",
              desc: "Nervous laughter, shared secrets, and the moment we knew this was special.",
              icon: Star,
            },
            {
              title: "The Adventures",
              desc: "Exploring new places, traveling the world, and building a collection of inside jokes.",
              icon: MapPin,
            },
            {
              title: "Forever to Go",
              desc: "Growing side by side, supporting each other's dreams, and loving each other more every day.",
              icon: Heart,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative mb-12 md:w-1/2 md:odd:pr-8 md:even:pl-8 md:odd:text-right md:even:text-left md:even:ml-auto">
                {/* Dot */}
                <div className="absolute -left-[17px] md:left-auto md:right-auto md:-translate-x-1/2 top-1.5 bg-sky-500 rounded-full p-1.5 shadow-md z-30">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`rounded-2xl p-6 shadow-md border ${cardBgClass}`}
                >
                  <div className={`inline-flex p-3 rounded-full mb-3 bg-sky-50 text-sky-500 ${idx % 2 === 0 ? "md:float-right md:ml-3" : "md:float-left md:mr-3"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="clear-both"></div>
                  <h3 className="text-xl font-bold font-luxury mb-2 text-slate-800">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ENDING QUOTE */}
      <section className="container mx-auto px-4 py-20 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <Heart className="w-6 h-6 mx-auto text-sky-400" fill="currentColor" />
          <h2 className="text-3xl md:text-5xl font-luxury italic text-slate-800">
            &ldquo;Grow old along with me! The best is yet to be.&rdquo;
          </h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs mt-6">
            Forever Yours, {yourName}
          </p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-500 z-20">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-sky-500 fill-sky-500" /> on <span className="font-semibold text-sky-500 font-sans">HeartPage</span>
        </p>
      </footer>
    </div>
  );
}
