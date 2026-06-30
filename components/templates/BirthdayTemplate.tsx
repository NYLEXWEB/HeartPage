"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Send, Clock, Cake, Star, Award } from "lucide-react";
import { useRouter } from "next/navigation";

interface BirthdayTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate: string; // Used as birth date
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

interface Balloon {
  id: number;
  x: number; // percentage width
  color: string;
  size: number;
  speed: number;
  label: string;
  popped: boolean;
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
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [activeWish, setActiveWish] = useState("");
  
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isDark = theme === "dark";

  // Birthday Wishes Phrases when popping balloons
  const wishPhrases = [
    "Make a wish! 🌟",
    "May all your dreams come true! ✨",
    "You are awesome! 🎂",
    "Eat more cake! 🍰",
    "Cheers to another year! 🥂",
    "Have a blast! 🎉",
    "Stay golden! 💛"
  ];

  // Calculate Next Birthday
  useEffect(() => {
    if (!relationshipDate) return;

    const calculateTimeLeft = () => {
      const birthDate = new Date(relationshipDate);
      const now = new Date();
      
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();

      let nextBirthday = new Date(now.getFullYear(), birthMonth, birthDay);
      
      if (now > nextBirthday && now.toDateString() !== nextBirthday.toDateString()) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }

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

  // Spawn balloons on open
  const handleOpenGift = () => {
    setIsOpen(true);
    setHasPrompterBeenClicked(true);

    const colors = [
      "from-rose-450 to-pink-550 shadow-pink-500/30",
      "from-amber-400 to-yellow-500 shadow-yellow-500/30",
      "from-sky-400 to-blue-500 shadow-blue-500/30",
      "from-emerald-400 to-green-500 shadow-green-500/30",
      "from-purple-400 to-indigo-500 shadow-purple-500/30",
    ];

    // Generate 12 balloons
    const newBalloons = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // 10% to 90%
      color: colors[i % colors.length],
      size: 40 + Math.random() * 30, // 40px to 70px
      speed: 8 + Math.random() * 8, // 8s to 16s float speed
      label: wishPhrases[i % wishPhrases.length],
      popped: false,
    }));
    setBalloons(newBalloons);
  };

  const handlePopBalloon = (id: number, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
    setPoppedCount((c) => c + 1);
    setActiveWish(label);

    // Reset wish text after 2 seconds
    setTimeout(() => {
      setActiveWish("");
    }, 2000);
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

  // Base Theme Styles
  const bgClass = isDark
    ? "bg-gradient-to-br from-[#0c0602] via-[#1e0e02] to-[#040100] text-[#fef3c7]"
    : "bg-gradient-to-br from-[#fffbeb] via-[#fffdf5] to-[#fef3c7] text-[#78350f]";

  const cardClass = isDark
    ? "bg-[#1d0e04]/85 border-amber-900/40 text-amber-100 shadow-[0_0_60px_rgba(245,158,11,0.2)] backdrop-blur-xl"
    : "bg-white/95 border-amber-200 text-slate-800 shadow-[0_20px_45px_rgba(245,158,11,0.08)] backdrop-blur-xl";

  return (
    <div className={`min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden py-16 px-4 ${bgClass}`}>
      
      {/* Balloon Popper Playground (Render floating balloons) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {balloons.map((b) => (
          <AnimatePresence key={b.id}>
            {!b.popped && (
              <motion.div
                initial={{ y: "105vh", x: `${b.x}vw` }}
                animate={{ y: "-10vh" }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: b.speed, ease: "linear" }}
                style={{ 
                  position: "absolute", 
                  width: b.size, 
                  height: b.size * 1.2,
                  pointerEvents: "auto"
                }}
                onClick={(e) => handlePopBalloon(b.id, b.label, e)}
                className="cursor-pointer"
              >
                {/* Balloon Body */}
                <div className={`w-full h-[85%] rounded-full bg-gradient-to-b ${b.color} relative shadow-lg`}>
                  {/* Highlight sheen */}
                  <div className="absolute top-2 left-3 w-3 h-6 bg-white/30 rounded-full rotate-[25deg]" />
                </div>
                {/* Balloon string knot */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-500/45 mx-auto -mt-1" />
                <div className="w-[1px] h-12 bg-white/20 mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Floating Sparkles & Wishes Banner */}
      <AnimatePresence>
        {activeWish && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-8 z-50 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 uppercase tracking-widest text-xs font-mono"
          >
            <Sparkles className="w-4 h-4 text-white fill-white animate-spin" /> {activeWish}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: CLOSED GIFT PRESENT */}
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="font-poppins text-xs tracking-[0.25em] text-amber-600 font-bold uppercase mb-8 text-center animate-pulse">
                🎁 Unbox Your Birthday Gift 🎁
              </h2>

              {/* Pointing Hand Prompter */}
              {!hasPrompterBeenClicked && (
                <div className="mb-4 flex flex-col items-center cursor-pointer" onClick={handleOpenGift}>
                  <div className="animate-bounce text-4xl">👇</div>
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold bg-amber-500 text-white px-3.5 py-1.5 rounded-full shadow-lg shadow-amber-500/20 mt-1 animate-pulse">
                    Tap to Unwrap
                  </span>
                </div>
              )}

              {/* Premium Gift Box wrapper */}
              <div 
                onClick={handleOpenGift}
                className="w-[300px] h-[210px] bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400/40 rounded-2xl relative shadow-2xl cursor-pointer hover:scale-[1.03] transition-transform duration-300 flex flex-col justify-center items-center group overflow-hidden"
              >
                <div className="absolute inset-x-0 top-[47%] h-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 border-y border-amber-400/30 z-10" />
                <div className="absolute inset-y-0 left-[47%] w-6 bg-gradient-to-b from-amber-500 via-yellow-500 to-amber-600 border-x border-amber-400/30 z-10" />
                
                <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-zinc-900 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-20 shadow-md">
                  <Gift className="w-7 h-7 text-amber-500 animate-pulse" />
                </div>
                <p className="font-serif italic text-xs text-amber-700 dark:text-amber-300 mt-6 tracking-wider z-20 bg-amber-50 dark:bg-zinc-900/60 px-3 py-1 rounded-full border border-amber-500/10">
                  Surprise for {partnerName}
                </p>
              </div>
            </motion.div>
          ) : (
            
            /* STAGE 2: SURPRISE OPENED */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              
              {/* Balloon Game Helper Label */}
              {poppedCount < 3 && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <Award className="w-3.5 h-3.5" /> Tap the floating balloons to make wishes! ({poppedCount}/3)
                </div>
              )}

              {/* Birthday Greeting Banner */}
              {isCelebrationDay ? (
                <div className="w-full p-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center rounded-2xl mb-6 shadow-xl animate-pulse flex items-center justify-center gap-2">
                  <Cake className="w-6 h-6 animate-bounce" />
                  <span className="font-bold text-sm tracking-wide uppercase">Happy Birthday {partnerName}! 🎂✨</span>
                </div>
              ) : (
                /* Countdown Timer widget */
                <div className="w-full p-5 bg-amber-500/10 border border-amber-500/25 text-center rounded-2xl mb-6 shadow-inner flex flex-col items-center justify-center gap-2">
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

              {/* Main Birthday wishes Card */}
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md transition-all duration-300 relative overflow-hidden ${cardClass}`}>
                
                {/* Decorative golden star overlay */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full pointer-events-none" />

                <div className="text-center space-y-5">
                  
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Cake className="w-6 h-6 text-amber-500" />
                  </div>
                  
                  <h3 className="font-luxury-serif text-3xl font-normal leading-tight text-amber-500">
                    To {partnerName} 💖
                  </h3>
                  
                  {/* Greeting Message Letter */}
                  <div className="bg-amber-550/[0.03] dark:bg-amber-500/10 border border-amber-400/20 p-6 rounded-2xl text-left space-y-4 shadow-inner relative">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-amber-500 block">Surprise Scrapbook Letter</span>
                    <p className="font-serif text-sm italic leading-relaxed text-slate-750 dark:text-slate-200 whitespace-pre-line relative z-10">
                      "{message}"
                    </p>
                    <div className="w-full text-right text-xs font-serif text-amber-500 relative z-10">
                      — With all my love, {yourName}
                    </div>
                  </div>

                  {relationshipDate && (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-spin" />
                      <span>Birth Date: {new Date(relationshipDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  )}

                  <div className="w-full h-[1px] bg-amber-500/15 pt-2" />

                  {/* Return Thank You Message Button */}
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

              {/* Creator CTA footer link */}
              <div className="mt-12 text-center">
                <a
                  href="/create"
                  className="font-poppins text-xs tracking-wider text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1 bg-white/20 px-4 py-2 rounded-full border border-amber-500/20 backdrop-blur-md"
                >
                  Create Your Own Birthday Scrapbook ✨
                </a>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
