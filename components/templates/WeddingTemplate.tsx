"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Send, Clock, Calendar, MapPin, Award } from "lucide-react";
import { useRouter } from "next/navigation";

interface WeddingTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate: string; // Used as wedding date
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

interface SparkleParticle {
  id: number;
  x: number; // percentage width
  color: string;
  size: number;
  speed: number;
  delay: number;
}

export default function WeddingTemplate({
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  theme,
  isPreview = false,
}: WeddingTemplateProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompterBeenClicked, setHasPrompterBeenClicked] = useState(false);
  const [isWeddingDay, setIsWeddingDay] = useState(false);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isDark = theme === "dark";

  // Generate floating sparkles/rings
  useEffect(() => {
    if (!isOpen) return;
    const colors = ["#d4af37", "#f3e5ab", "#aa7c11", "#e6ca65"]; // Luxury gold palette
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = isMobile ? 12 : 30; // Mobile optimization

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 8, // 4px to 12px
      speed: 10 + Math.random() * 15, // 10s to 25s
      delay: Math.random() * -20, // Negative delay to start immediately
    }));
    setParticles(newParticles);
  }, [isOpen]);

  // Calculate Next Wedding Date Countdown
  useEffect(() => {
    if (!relationshipDate) return;

    const calculateTimeLeft = () => {
      const weddingDate = new Date(relationshipDate);
      const now = new Date();
      
      const difference = weddingDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsWeddingDay(true);
        return;
      }

      setIsWeddingDay(false);
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setCountdown({ days: d, hours: h, minutes: m, seconds: s });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [relationshipDate]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setHasPrompterBeenClicked(true);
  };

  const handleReplyClick = () => {
    const params = new URLSearchParams({
      isReply: "true",
      category: "wedding",
      yourName: partnerName,
      partnerName: yourName,
    });
    if (relationshipDate) {
      params.append("relationshipDate", relationshipDate);
    }
    router.push(`/create?${params.toString()}`);
  };

  // Base Theme Styles (Champagne / Gold Luxury palette)
  const bgClass = isDark
    ? "bg-gradient-to-br from-[#0f0e0b] via-[#1d1a12] to-[#0a0907] text-[#f7f3e9]"
    : "bg-gradient-to-br from-[#fbf9f4] via-[#f7f2e8] to-[#eedfcc] text-[#4d402f]";

  const cardClass = isDark
    ? "bg-[#181611]/85 border-[#4a3e2a]/40 text-[#f5eedc] shadow-[0_0_60px_rgba(212,175,55,0.15)] backdrop-blur-xl"
    : "bg-white/95 border-[#e5d8bf] text-slate-800 shadow-[0_20px_45px_rgba(212,175,55,0.06)] backdrop-blur-xl";

  const sealColor = isDark ? "from-yellow-600 to-amber-700" : "from-amber-600 to-yellow-600";

  return (
    <div className={`min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden py-16 px-4 ${bgClass}`}>
      
      {/* Floating sparkles animation */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {isOpen && particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: "105vh", x: `${p.x}vw`, opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.7, 0.7, 0] }}
            transition={{ 
              duration: p.speed, 
              ease: "linear",
              repeat: Infinity,
              delay: p.delay
            }}
            style={{ 
              position: "absolute", 
              width: p.size, 
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              filter: "blur(1px)",
              boxShadow: `0 0 8px ${p.color}`
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: CLOSED ENVELOPE */}
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="font-poppins text-xs tracking-[0.25em] text-[#aa7c11] dark:text-[#d4af37] font-bold uppercase mb-8 text-center animate-pulse">
                💍 You are Invited 💍
              </h2>

              {/* Pointing Hand Prompter */}
              {!hasPrompterBeenClicked && (
                <div className="mb-4 flex flex-col items-center cursor-pointer" onClick={handleOpenInvitation}>
                  <div className="animate-bounce text-4xl">👇</div>
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold bg-[#aa7c11] text-white px-3.5 py-1.5 rounded-full shadow-lg shadow-yellow-500/20 mt-1 animate-pulse">
                    Open Invitation
                  </span>
                </div>
              )}

              {/* Premium Wedding Card Envelope */}
              <div 
                onClick={handleOpenInvitation}
                className="w-[300px] h-[210px] bg-[#fdfbf7] dark:bg-[#1a1712] border-2 border-[#e5d8bf]/60 rounded-2xl relative shadow-2xl cursor-pointer hover:scale-[1.03] transition-transform duration-300 flex flex-col justify-center items-center group overflow-hidden"
              >
                {/* Wax seal */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${sealColor} border border-[#d4af37]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-20 shadow-lg`}>
                  <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                </div>
                
                <p className="font-serif italic text-xs text-[#8c6d31] dark:text-[#e5d8bf] mt-6 tracking-wider z-20 bg-[#faf6ed]/90 dark:bg-zinc-900/60 px-4 py-1.5 rounded-full border border-[#d4af37]/20">
                  {yourName} &amp; {partnerName}
                </p>
                <span className="absolute bottom-3 text-[9px] font-mono uppercase tracking-widest text-[#aa7c11]/60">
                  Tap Wax Seal to Open
                </span>
              </div>
            </motion.div>
          ) : (
            
            /* STAGE 2: INVITATION DETAILS */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              
              {/* Countdown Banner */}
              {isWeddingDay ? (
                <div className="w-full p-5 bg-gradient-to-r from-[#aa7c11] to-[#d4af37] text-white text-center rounded-2xl mb-6 shadow-xl animate-pulse flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 animate-bounce" />
                  <span className="font-bold text-sm tracking-wide uppercase">Happy Wedding Day! 🤵👰💍</span>
                </div>
              ) : (
                <div className="w-full p-5 bg-[#d4af37]/10 border border-[#d4af37]/25 text-center rounded-2xl mb-6 shadow-inner flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#aa7c11] dark:text-[#d4af37] font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Countdown to Celebration
                  </span>
                  
                  <div className="flex gap-4 text-center items-center mt-2">
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-[#aa7c11] dark:text-[#d4af37] font-bold">{countdown.days}</span>
                      <span className="block text-[8px] font-mono text-[#aa7c11]/70 tracking-wider uppercase">Days</span>
                    </div>
                    <span className="text-[#aa7c11] dark:text-[#d4af37] font-light text-xl">:</span>
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-[#aa7c11] dark:text-[#d4af37] font-bold">{countdown.hours}</span>
                      <span className="block text-[8px] font-mono text-[#aa7c11]/70 tracking-wider uppercase">Hrs</span>
                    </div>
                    <span className="text-[#aa7c11] dark:text-[#d4af37] font-light text-xl">:</span>
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-[#aa7c11] dark:text-[#d4af37] font-bold">{countdown.minutes}</span>
                      <span className="block text-[8px] font-mono text-[#aa7c11]/70 tracking-wider uppercase">Mins</span>
                    </div>
                    <span className="text-[#aa7c11] dark:text-[#d4af37] font-light text-xl">:</span>
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-[#aa7c11] dark:text-[#d4af37] font-bold">{countdown.seconds}</span>
                      <span className="block text-[8px] font-mono text-[#aa7c11]/70 tracking-wider uppercase">Secs</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Invitation Card */}
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md transition-all duration-300 relative overflow-hidden ${cardClass}`}>
                
                {/* Decorative gold flourishes */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full pointer-events-none" />

                <div className="text-center space-y-6">
                  
                  <div className="w-12 h-12 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Heart className="w-6 h-6 text-[#aa7c11] dark:text-[#d4af37] fill-[#aa7c11] dark:fill-[#d4af37]" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#aa7c11] dark:text-[#d4af37] font-bold">Wedding Invitation</span>
                    <h3 className="font-serif italic text-3xl font-normal leading-tight text-[#aa7c11] dark:text-[#d4af37] pt-2">
                      {yourName} &amp; {partnerName}
                    </h3>
                  </div>
                  
                  {/* Wedding Invitation Letter */}
                  <div className="bg-[#aa7c11]/[0.02] dark:bg-[#d4af37]/5 border border-[#e5d8bf]/30 p-6 rounded-2xl text-left space-y-4 shadow-inner relative">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#aa7c11] dark:text-[#d4af37] block">Invitation Note</span>
                    <p className="font-serif text-sm italic leading-relaxed text-slate-750 dark:text-slate-200 whitespace-pre-line relative z-10">
                      "{message}"
                    </p>
                  </div>

                  {relationshipDate && (
                    <div className="bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl p-4 space-y-3 text-xs text-[#aa7c11] dark:text-[#d4af37] font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Date: {new Date(relationshipDate).toLocaleDateString("en-US", { weekday: 'long', year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>Location: Details inside invitation</span>
                      </div>
                    </div>
                  )}

                  <div className="w-full h-[1px] bg-[#d4af37]/15 pt-2" />

                  {/* Return Thank You Message Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReplyClick}
                      className="w-full py-3.5 bg-[#aa7c11] hover:bg-[#8c6d31] text-white rounded-full text-xs font-bold font-poppins tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Congratulations / RSVP
                    </button>
                  </div>

                </div>

              </div>

              {/* Creator CTA footer link */}
              <div className="mt-12 text-center">
                <a
                  href="/create"
                  className="font-poppins text-xs tracking-wider text-[#aa7c11] dark:text-[#d4af37] hover:underline transition-colors flex items-center gap-1 bg-white/20 px-4 py-2 rounded-full border border-[#d4af37]/20 backdrop-blur-md"
                >
                  Create Your Own Invitation Scrapbook ✨
                </a>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
