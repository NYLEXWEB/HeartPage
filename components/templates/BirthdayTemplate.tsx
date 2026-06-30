"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Send, Clock, Cake } from "lucide-react";
import { useRouter } from "next/navigation";

interface BirthdayTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate: string; // Used as Birth Date
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

export default function BirthdayTemplate({
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  theme,
  isPreview = false,
}: BirthdayTemplateProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompterBeenClicked, setHasPrompterBeenClicked] = useState(false);
  const [isCelebrationDay, setIsCelebrationDay] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isDark = theme === "dark";

  // Calculate Next Birthday Countdown
  useEffect(() => {
    if (!relationshipDate) return;

    const calculateTimeLeft = () => {
      const birthDate = new Date(relationshipDate);
      const now = new Date();
      
      // Get birth month and day
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();

      // Next birthday occurrence
      let nextBirthday = new Date(now.getFullYear(), birthMonth, birthDay);
      
      // If birthday has already passed this year, set to next year
      if (now > nextBirthday && now.toDateString() !== nextBirthday.toDateString()) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }

      // Check if today is the birthday (same month and day)
      const isToday = now.getMonth() === birthMonth && now.getDate() === birthDay;
      setIsCelebrationDay(isToday);

      if (isToday) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const difference = nextBirthday.getTime() - now.getTime();
      
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

  const handleOpenEnvelope = () => {
    setIsOpen(true);
    setHasPrompterBeenClicked(true);
  };

  const handleReplyClick = () => {
    const params = new URLSearchParams({
      isReply: "true",
      category: "birthday",
      yourName: partnerName,
      partnerName: yourName,
    });
    if (relationshipDate) {
      params.append("relationshipDate", relationshipDate);
    }
    router.push(`/create?${params.toString()}`);
  };

  // Base Theme Colors
  const bgClass = isDark
    ? "bg-gradient-to-br from-[#0c0501] via-[#211102] to-[#0a0400] text-[#fef3c7]"
    : "bg-gradient-to-br from-[#fffbeb] via-[#fffbf0] to-[#fef3c7] text-[#78350f]";

  const cardClass = isDark
    ? "bg-[#1d0f04]/80 border-amber-900/30 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
    : "bg-white/90 border-amber-200 text-slate-800 shadow-[0_15px_35px_rgba(245,158,11,0.08)]";

  return (
    <div className={`min-h-screen w-full relative flex flex-col items-center justify-center overflow-x-hidden py-16 px-4 ${bgClass}`}>
      
      {/* Sparkles / Balloon Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[12%] left-[10%] animate-pulse text-amber-500/20 text-3xl">🎂</div>
        <div className="absolute top-[25%] right-[8%] animate-bounce text-amber-500/10 text-5xl">🎈</div>
        <div className="absolute bottom-[20%] left-[5%] animate-bounce text-amber-500/15 text-4xl">🎁</div>
        <div className="absolute bottom-[10%] right-[15%] animate-pulse text-amber-500/20 text-3xl">✨</div>
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        
        {/* Envelope Preview */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="font-poppins text-xs tracking-[0.2em] text-amber-600 font-bold uppercase mb-8 text-center animate-pulse">
                🎁 BIRTHDAY SURPRISE AWAITS 🎁
              </h2>

              {/* Pointing Hand Prompter */}
              {!hasPrompterBeenClicked && (
                <div className="mb-4 flex flex-col items-center cursor-pointer" onClick={handleOpenEnvelope}>
                  <div className="animate-bounce text-3xl">👇</div>
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-md mt-1 animate-pulse">
                    Click to Open Gift
                  </span>
                </div>
              )}

              {/* Letter Envelope Box Graphic */}
              <div 
                onClick={handleOpenEnvelope}
                className="w-[300px] h-[200px] bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400/40 rounded-xl relative shadow-2xl cursor-pointer hover:scale-[1.03] transition-transform duration-300 flex flex-col justify-center items-center group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <p className="font-serif italic text-xs text-amber-700 dark:text-amber-300 mt-4 tracking-wider">
                  Surprise for {partnerName}...
                </p>
                <span className="absolute bottom-3 text-[10px] font-mono uppercase tracking-widest text-amber-500/60">
                  Open with Love • {yourName}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Celebration Overlay if it is birthday */}
              {isCelebrationDay ? (
                <div className="w-full p-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center rounded-2xl mb-6 shadow-lg animate-pulse flex items-center justify-center gap-2">
                  <Cake className="w-6 h-6 animate-bounce" />
                  <span className="font-bold text-sm tracking-wide uppercase">Happy Birthday {partnerName}! 🎂✨</span>
                </div>
              ) : (
                /* Realtime Countdown Display */
                <div className="w-full p-5 bg-amber-500/10 border border-amber-500/20 text-center rounded-2xl mb-6 shadow-inner flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Countdown to Birthday
                  </span>
                  
                  <div className="flex gap-4 text-center items-center mt-2">
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-amber-500 font-bold">{countdown.days}</span>
                      <span className="block text-[8px] font-mono text-amber-600/70 tracking-wider uppercase">Days</span>
                    </div>
                    <span className="text-amber-500 font-light text-xl">:</span>
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-amber-500 font-bold">{countdown.hours}</span>
                      <span className="block text-[8px] font-mono text-amber-600/70 tracking-wider uppercase">Hrs</span>
                    </div>
                    <span className="text-amber-500 font-light text-xl">:</span>
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-amber-500 font-bold">{countdown.minutes}</span>
                      <span className="block text-[8px] font-mono text-amber-600/70 tracking-wider uppercase">Mins</span>
                    </div>
                    <span className="text-amber-500 font-light text-xl">:</span>
                    <div>
                      <span className="block font-serif text-2xl md:text-3xl text-amber-500 font-bold">{countdown.seconds}</span>
                      <span className="block text-[8px] font-mono text-amber-600/70 tracking-wider uppercase">Secs</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Scrapbook Letter Card */}
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md transition-all duration-300 ${cardClass}`}>
                
                <div className="text-center space-y-4">
                  
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Cake className="w-6 h-6 text-amber-500" />
                  </div>
                  
                  <h3 className="font-luxury-serif text-3xl font-normal leading-tight text-amber-500">
                    To {partnerName} 💖
                  </h3>
                  
                  {/* Greeting Letter Box */}
                  <div className="bg-amber-550/[0.03] dark:bg-amber-500/10 border border-amber-400/20 p-6 rounded-2xl text-left space-y-4 shadow-inner relative overflow-hidden">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-amber-500">A Special Message</span>
                    <p className="font-serif text-sm italic leading-relaxed text-slate-750 dark:text-slate-200 whitespace-pre-line relative z-10">
                      "{message}"
                    </p>
                    <div className="w-full text-right text-xs font-serif text-amber-500 relative z-10">
                      — With love, {yourName}
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-amber-500/15 pt-2" />

                  {/* Send Reply Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReplyClick}
                      className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-bold font-poppins tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Return Thank You Message
                    </button>
                  </div>

                </div>

              </div>

              {/* Creator Footer CTA */}
              <div className="mt-12 text-center">
                <a
                  href="/create"
                  className="font-poppins text-xs tracking-wider text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1 bg-white/20 px-4 py-2 rounded-full border border-amber-500/20"
                >
                  Create Your Own Special Birthday Scrapbook ✨
                </a>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
