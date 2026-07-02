"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BackgroundMusic from "@/components/BackgroundMusic";

interface BirthdayTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate: string; // Used as birth date
  message: string;
  images: string[];
  theme: "light" | "dark";
  customFields?: { label: string; value: string }[];
  isPreview?: boolean;
  birthdayPhoto?: string;
  musicEnabled?: boolean;
  hideMusicPlayer?: boolean;
}

export default function BirthdayTemplate({
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  theme,
  customFields = [],
  isPreview = false,
  birthdayPhoto,
  musicEnabled = true,
  hideMusicPlayer = false,
}: BirthdayTemplateProps) {
  const router = useRouter();
  const isDark = theme === "dark";

  // Helper to parse potential links
  const getLinkUrl = (val: string) => {
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return val;
    }
    if (val.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/)) {
      return `https://${val}`;
    }
    return null;
  };

  // States
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [wished, setWished] = useState(false);
  const [blownFlames, setBlownFlames] = useState<boolean[]>([false, false, false]);
  const [confetti, setConfetti] = useState<{
    id: number;
    dx: number;
    dy: number;
    rot: number;
    style: React.CSSProperties;
  }[]>([]);

  // Parallax Scroll FX
  const [scrollProgress, setScrollProgress] = useState(0);
  const [balloonY, setBalloonY] = useState(0);
  const [balloonOpacity, setBalloonOpacity] = useState(1);

  // Dynamically load Google Fonts on mount to avoid re-renders reloading the fonts and causing page flickering/layout shifts
  useEffect(() => {
    const linkId = "google-fonts-birthday";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Caveat:wght@500;600;700&family=Nunito:wght@300;400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(pct);

      const heroHeight = window.innerHeight;
      const progress = Math.min(scrollTop / heroHeight, 1);
      setBalloonY(progress * -40);
      setBalloonOpacity(1 - progress * 0.7);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate Age Dynamically
  useEffect(() => {
    if (relationshipDate) {
      const birthDate = new Date(relationshipDate);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setCalculatedAge(age > 0 && age < 120 ? age : null);
      }
    }
  }, [relationshipDate]);

  // Make a Wish: blow out candles + confetti burst
  const burstConfetti = () => {
    const colors = ["#ff5c8a", "#ffb84d", "#4fe0c5", "#c9a8ff", "#fff7ed"];
    const newConfetti = Array.from({ length: 60 }).map((_, i) => {
      const size = 6 + Math.random() * 6;
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 220;
      const dx = Math.cos(angle) * dist;
      const dy = -Math.abs(Math.sin(angle) * dist) - 80 - Math.random() * 120;
      const rot = Math.random() * 720 - 360;

      return {
        id: i,
        dx,
        dy: dy + 260,
        rot,
        style: {
          position: "absolute" as const,
          left: `${45 + Math.random() * 10}%`,
          top: "55%",
          width: `${size}px`,
          height: `${size * (Math.random() > 0.5 ? 1 : 2.2)}px`,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          opacity: 1,
          transform: "translate(0,0) rotate(0deg)",
          transition: `transform ${1.2 + Math.random()}s cubic-bezier(.2,.6,.3,1), opacity 1.6s ease`,
          pointerEvents: "none" as const,
        } as React.CSSProperties,
      };
    });
    setConfetti(newConfetti);

    // Apply animation positioning shortly after creation
    setTimeout(() => {
      setConfetti((prev) =>
        prev.map((c) => ({
          ...c,
          style: {
            ...c.style,
            transform: `translate(${c.dx}px, ${c.dy}px) rotate(${c.rot}deg)`,
            opacity: 0,
          },
        }))
      );
    }, 50);
  };

  const handleMakeWish = () => {
    if (wished) return;
    setWished(true);

    // sequential blow flames
    [0, 1, 2].forEach((idx) => {
      setTimeout(() => {
        setBlownFlames((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, idx * 150);
    });

    setTimeout(() => {
      burstConfetti();
    }, 550);
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

  // Motion Reveal Presets
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  const revealPop = {
    initial: { opacity: 0, scale: 0.85, rotate: -3 },
    whileInView: { opacity: 1, scale: 1, rotate: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] as const },
  };

  const revealScale = {
    initial: { opacity: 0, scale: 0.92 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 1.1, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  return (
    <div className={`antialiased relative select-none w-full min-h-screen ${isDark ? "bg-[#0c071f] text-slate-100 dark" : "bg-[#fff7ed] text-[#1a1030]"} font-nunito overflow-x-hidden`}>
      {/* Custom Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --night:      ${isDark ? "#090414" : "#1a1030"};
          --night-2:    ${isDark ? "#170a2f" : "#2a1653"};
          --night-3:    ${isDark ? "#05010a" : "#150c26"};
          --pink:       #ff5c8a;
          --pink-soft:  #ff9db8;
          --marigold:   #ffb84d;
          --mint:       #4fe0c5;
          --lilac:      #c9a8ff;
          --cream:      ${isDark ? "#0c071f" : "#fff7ed"};
        }
        
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-hand { font-family: 'Caveat', cursive; }

        .bg-night {
          background: radial-gradient(120% 140% at 50% 0%, var(--night-2) 0%, var(--night) 55%, var(--night-3) 100%);
        }

        .text-outline {
          -webkit-text-stroke: 1.5px var(--marigold);
          color: transparent;
        }

        /* Balloons bob animation */
        .balloon {
          position: absolute;
          animation: bob 6s ease-in-out infinite;
          will-change: transform;
        }
        .balloon.d2 { animation-duration: 7.5s; animation-delay: .3s; }
        .balloon.d3 { animation-duration: 5.5s; animation-delay: .6s; }
        .balloon.d4 { animation-duration: 8s; animation-delay: .15s; }
        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-22px) rotate(2deg); }
        }

        /* Candle flame flicker */
        .flame {
          animation: flicker 1.1s ease-in-out infinite alternate;
          transform-origin: bottom center;
        }
        @keyframes flicker {
          0% { transform: scale(1) rotate(-2deg); opacity: 1; }
          50% { transform: scale(1.08) rotate(2deg); opacity: .92; }
          100% { transform: scale(0.96) rotate(-1deg); opacity: 1; }
        }

        .card-tape::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%) rotate(-3deg);
          width: 70px;
          height: 22px;
          background: rgba(255,184,77,0.55);
        }

        .grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .045;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }
      `}} />

      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative min-h-screen bg-night text-white flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <div className="grain" />

        {/* Floating Balloons Parallax Wrapper */}
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out z-10"
          style={{
            transform: `translateY(${balloonY}px)`,
            opacity: balloonOpacity,
          }}
        >
          <svg className="balloon absolute left-[6%] top-[14%] w-14 md:w-20" viewBox="0 0 60 80" fill="none">
            <ellipse cx="30" cy="30" rx="28" ry="30" fill="var(--pink)" />
            <path d="M30 60 L30 78" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
            <path d="M25 60 Q30 66 35 60" fill="var(--pink)" />
          </svg>
          <svg className="balloon d2 absolute right-[8%] top-[10%] w-16 md:w-24" viewBox="0 0 60 80" fill="none">
            <ellipse cx="30" cy="30" rx="28" ry="30" fill="var(--mint)" />
            <path d="M30 60 L30 78" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
            <path d="M25 60 Q30 66 35 60" fill="var(--mint)" />
          </svg>
          <svg className="balloon d3 absolute left-[14%] bottom-[12%] w-12 md:w-16" viewBox="0 0 60 80" fill="none">
            <ellipse cx="30" cy="30" rx="28" ry="30" fill="var(--marigold)" />
            <path d="M30 60 L30 78" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
            <path d="M25 60 Q30 66 35 60" fill="var(--marigold)" />
          </svg>
          <svg className="balloon d4 absolute right-[12%] bottom-[16%] w-14 md:w-20" viewBox="0 0 60 80" fill="none">
            <ellipse cx="30" cy="30" rx="28" ry="30" fill="var(--lilac)" />
            <path d="M30 60 L30 78" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
            <path d="M25 60 Q30 66 35 60" fill="var(--lilac)" />
          </svg>
        </div>

        <motion.p 
          {...reveal} 
          className="font-display tracking-[0.3em] text-xs md:text-sm text-[#ffb84d] uppercase mb-6"
        >
          A little celebration for
        </motion.p>

        <motion.h1 
          {...reveal} 
          className="font-display font-extrabold text-5xl sm:text-6xl md:text-8xl leading-[0.95] text-center mb-4"
        >
          Happy Birthday,<br />
          <span className="text-outline">{partnerName || "Zara"}</span> <span>🎉</span>
        </motion.h1>

        {calculatedAge !== null ? (
          <motion.div 
            {...reveal} 
            className="inline-flex items-center gap-2 font-hand text-3xl md:text-4xl text-[#ff9db8] mb-10"
          >
            <span>turning</span>
            <span className="font-display font-bold text-white text-4xl md:text-5xl">{calculatedAge}</span>
            <span>today</span>
          </motion.div>
        ) : (
          <motion.div 
            {...reveal} 
            className="inline-flex items-center gap-2 font-hand text-3xl md:text-4xl text-[#ff9db8] mb-10"
          >
            <span>celebrating today</span>
          </motion.div>
        )}

        <a href="#message-card" className="absolute bottom-10 flex flex-col items-center gap-2 text-white/60 group">
          <span className="font-display text-[10px] tracking-widest uppercase">Scroll down</span>
          <span className="w-px h-10 bg-[#ffb84d]/60 group-hover:h-14 transition-all duration-500" />
        </a>
      </section>

      {/* ============================================================ */}
      {/* BIRTHDAY STAR PHOTO SHOWCASE SECTION */}
      {/* ============================================================ */}
      {birthdayPhoto && (
        <section className={`relative px-6 py-20 ${isDark ? "bg-[#0a061b] border-t border-purple-950/20" : "bg-[#fffaf0] border-t border-amber-100/50"} overflow-hidden`}>
          {/* Decorative ambient blobs */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
            {/* Left: Polaroid/Paper Frame for Photo */}
            <motion.div 
              {...revealPop}
              className={`relative p-4 md:p-5 ${isDark ? "bg-[#18112d] border border-purple-900/35 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]" : "bg-white shadow-[0_25px_60px_-15px_rgba(26,16,48,0.15)]"} rounded-lg rotate-[-2deg] max-w-[320px] w-full`}
            >
              <div className="aspect-[3/4] overflow-hidden rounded relative">
                <img 
                  src={birthdayPhoto} 
                  alt={partnerName || "Birthday Star"} 
                  className="w-full h-full object-cover select-none" 
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="pt-5 pb-2 text-center">
                <p className="font-hand text-2xl text-[#ff5c8a] tracking-wider">
                  {partnerName || "Birthday Star"} ✨
                </p>
              </div>
            </motion.div>

            {/* Right: Content details */}
            <motion.div 
              {...reveal}
              className="max-w-md text-center md:text-left space-y-5"
            >
              <span className="font-display tracking-[0.25em] text-xs font-semibold text-[#ffb84d] uppercase bg-[#ffb84d]/10 px-3 py-1 rounded-full">
                Celebrating Our Favorite Person
              </span>
              <h2 className={`font-display font-black text-4xl md:text-5xl ${isDark ? "text-white" : "text-[#1a1030]"} tracking-tight leading-tight`}>
                Here's to <span className={isDark ? "text-[#ff5c8a]" : "text-[#ff3b70]"}>another year</span> of shining bright!
              </h2>
              <p className={`font-display text-sm leading-relaxed ${isDark ? "text-slate-350" : "text-slate-600"}`}>
                Today we celebrate you, {partnerName}! Your laughter, your spirit, and the joy you bring into all of our lives. May this year be filled with dream-chasing and beautiful new beginnings.
              </p>
              <div className="flex justify-center md:justify-start gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff5c8a] animate-ping" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffb84d]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4fe0c5]" />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* MESSAGE CARD */}
      {/* ============================================================ */}
      <section id="message-card" className={`relative px-6 py-24 md:py-32 ${isDark ? "bg-[#0c071f]" : "bg-[#fff7ed]"}`}>
        <div className="max-w-xl mx-auto">
          <motion.div 
            {...revealPop} 
            className={`card-tape relative ${isDark ? "bg-[#18112d] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-purple-900/35" : "bg-white shadow-[0_20px_60px_-15px_rgba(26,16,48,0.25)]"} px-8 py-12 md:px-12 md:py-14 rotate-[-1deg]`}
          >
            <p className={`font-hand text-3xl md:text-4xl leading-relaxed ${isDark ? "text-slate-100" : "text-[#1a1030]"} whitespace-pre-line`}>
              "{message || "Wishing you a day as wonderful as you are, and a year ahead full of laughter, adventure, and every little thing that makes you smile. Here's to you!"}"
            </p>
            <p className={`font-display text-sm ${isDark ? "text-slate-400" : "text-[#1a1030]/50"} mt-8 uppercase tracking-widest`}>— With love, always, {yourName}</p>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Custom Fields */}
      {customFields && customFields.length > 0 && (
        <section className={`relative px-6 py-10 ${isDark ? "bg-[#0c071f]" : "bg-[#fff7ed]"}`}>
          <div className="max-w-md mx-auto space-y-4 text-center">
            <p className="font-display tracking-[0.3em] text-xs text-[#ff5c8a] uppercase">
              Special Information
            </p>
            <div className="space-y-4">
              {customFields.map((field, idx) => {
                const link = getLinkUrl(field.value);
                return (
                  <motion.div 
                    key={idx} 
                    {...revealPop} 
                    className={`card-tape relative ${isDark ? "bg-[#18112d] border border-purple-900/35 shadow-lg" : "bg-white shadow-md border border-amber-100/50"} p-5`}
                    style={{ transform: `rotate(${(idx % 2 === 0 ? -1 : 1) * 0.8}deg)` }}
                  >
                    <h4 className="font-display font-semibold text-xs text-[#ffb84d] uppercase tracking-wider mb-1">
                      {field.label}
                    </h4>
                    {link ? (
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 font-hand text-2xl text-[#ff5c8a] hover:text-[#ff3b70] underline decoration-[#ffb84d]/60 hover:decoration-[#ffb84d] transition-all duration-300 break-all"
                      >
                        {field.value.length > 30 ? "Click to Open Details" : field.value} ↗
                      </a>
                    ) : (
                      <p className={`font-hand text-2xl ${isDark ? "text-slate-200" : "text-[#1a1030]"} leading-relaxed whitespace-pre-line`}>
                        {field.value}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* INTERACTIVE CAKE + MAKE A WISH */}
      {/* ============================================================ */}
      <section className="relative px-6 py-24 md:py-32 bg-night text-white overflow-hidden">
        <div className="grain" />
        
        {/* React Confetti Burst Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {confetti.map((conf) => (
            <div key={conf.id} style={conf.style} />
          ))}
        </div>

        <div className="max-w-lg mx-auto text-center relative z-10">
          <motion.p {...reveal} className="font-display tracking-[0.3em] text-xs text-[#ffb84d] uppercase mb-3">
            Make a wish
          </motion.p>
          <motion.h2 {...reveal} className="font-display font-bold text-3xl md:text-4xl mb-12">
            Blow out the candles
          </motion.h2>

          <motion.div {...revealPop} className="relative mx-auto mb-10 w-[220px]">
            <svg viewBox="0 0 220 200" className="w-full h-auto">
              {/* plate */}
              <ellipse cx="110" cy="175" rx="95" ry="12" fill="rgba(255,255,255,0.08)"/>
              
              {/* cake base */}
              <rect x="35" y="120" width="150" height="55" rx="10" fill="var(--pink)"/>
              <rect x="35" y="120" width="150" height="14" rx="7" fill="var(--pink-soft)"/>
              
              {/* cake middle */}
              <rect x="50" y="80" width="120" height="45" rx="9" fill="var(--mint)"/>
              <rect x="50" y="80" width="120" height="12" rx="6" fill="#8ff0dd"/>
              
              {/* drips */}
              <circle cx="70" cy="120" r="6" fill="var(--marigold)"/>
              <circle cx="110" cy="123" r="7" fill="var(--marigold)"/>
              <circle cx="150" cy="119" r="6" fill="var(--marigold)"/>
              
              {/* candle 1 */}
              <g id="candle-1">
                <rect x="75" y="55" width="6" height="26" rx="2" fill="var(--marigold)"/>
                <ellipse 
                  className={`transition-all duration-[1200ms] ease-out pointer-events-none ${blownFlames[0] ? "opacity-50 -translate-y-8 scale-150" : "opacity-0"}`} 
                  cx="78" cy="45" rx="4" ry="8" fill="white"
                />
                <path 
                  className={`flame transition-all duration-500 ease-out ${blownFlames[0] ? "opacity-0 scale-0 pointer-events-none" : ""}`} 
                  d="M78 40 C 74 46, 74 52, 78 55 C 82 52, 82 46, 78 40 Z" fill="#ffd15c"
                />
              </g>

              {/* candle 2 */}
              <g id="candle-2">
                <rect x="107" y="45" width="6" height="36" rx="2" fill="var(--lilac)"/>
                <ellipse 
                  className={`transition-all duration-[1200ms] ease-out pointer-events-none ${blownFlames[1] ? "opacity-50 -translate-y-8 scale-150" : "opacity-0"}`} 
                  cx="110" cy="35" rx="4" ry="8" fill="white"
                />
                <path 
                  className={`flame transition-all duration-500 ease-out ${blownFlames[1] ? "opacity-0 scale-0 pointer-events-none" : ""}`} 
                  d="M110 30 C 106 36, 106 42, 110 45 C 114 42, 114 36, 110 30 Z" fill="#ffd15c"
                />
              </g>

              {/* candle 3 */}
              <g id="candle-3">
                <rect x="139" y="55" width="6" height="26" rx="2" fill="var(--mint)"/>
                <ellipse 
                  className={`transition-all duration-[1200ms] ease-out pointer-events-none ${blownFlames[2] ? "opacity-50 -translate-y-8 scale-150" : "opacity-0"}`} 
                  cx="142" cy="45" rx="4" ry="8" fill="white"
                />
                <path 
                  className={`flame transition-all duration-500 ease-out ${blownFlames[2] ? "opacity-0 scale-0 pointer-events-none" : ""}`} 
                  d="M142 40 C 138 46, 138 52, 142 55 C 146 52, 146 46, 142 40 Z" fill="#ffd15c"
                />
              </g>
            </svg>
          </motion.div>

          <motion.button 
            {...reveal} 
            disabled={wished}
            onClick={handleMakeWish}
            className="btn-wish font-display font-bold tracking-wide text-sm md:text-base rounded-full px-8 py-4 shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-default"
          >
            🎂 Make a Wish
          </motion.button>
          
          <AnimatePresence>
            {wished && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-hand text-2xl text-[#ffb84d] mt-6 h-8"
              >
                May all your wishes come true, {partnerName}! ✨
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BIRTHDAY MEMORIES GALLERY (OPTIONAL) */}
      {/* ============================================================ */}
      {images && images.length > 0 && (
        <section className={`relative px-6 py-24 md:py-32 ${isDark ? "bg-[#0b061d] border-t border-slate-900" : "bg-[#fff7ed] border-t border-[#1a1030]/5"}`}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.p {...reveal} className="font-display tracking-[0.3em] text-xs text-[#ff5c8a] uppercase mb-3">
              Captured Moments
            </motion.p>
            <motion.h2 {...reveal} className={`font-display font-bold text-3xl md:text-4xl mb-12 ${isDark ? "text-slate-100" : "text-[#1a1030]"}`}>
              Our Memory Scrapbook
            </motion.h2>

            <motion.div 
              {...revealScale}
              className={`grid gap-8 ${
                images.length === 1 
                  ? "grid-cols-1 max-w-md mx-auto" 
                  : images.length === 2 
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" 
                  : images.length === 3 
                  ? "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto" 
                  : "grid-cols-2 md:grid-cols-4"
              }`}
            >
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`relative group ${isDark ? "bg-[#18112d] border border-purple-900/35" : "bg-white"} p-3 rounded-xl shadow-[0_10px_30px_rgba(26,16,48,0.08)] transition-all duration-300 hover:scale-[1.03] hover:rotate-1`}
                  style={{ transform: `rotate(${(idx % 2 === 0 ? -1.5 : 1.5) * (idx + 1)}deg)` }}
                >
                  {/* Tape decorator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-[rgba(255,184,77,0.4)] rotate-[-2deg] pointer-events-none" />
                  
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-50 relative">
                    <img 
                      src={img} 
                      alt={`Memory ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <span className={`font-hand text-xl ${isDark ? "text-slate-350" : "text-[#1a1030]/70"}`}>Moment #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* RSVP / THANK YOU REPLY ACTION */}
      {/* ============================================================ */}
      <section className={`relative px-6 py-20 ${isDark ? "bg-[#0c071f] border-t border-slate-900" : "bg-[#fff7ed] border-t border-[#1a1030]/5"} text-center`}>
        <div className="max-w-md mx-auto space-y-6">
          <motion.div {...reveal} className="space-y-3">
            <h3 className={`font-display font-bold text-2xl ${isDark ? "text-slate-100" : "text-[#1a1030]"}`}>
              Send a reply to {yourName || "someone special"}?
            </h3>
            <p className={`font-display text-sm ${isDark ? "text-slate-400" : "text-[#1a1030]/60"}`}>
              Let them know you loved the birthday surprise!
            </p>
          </motion.div>

          <motion.div {...reveal} className="pt-2">
            <button
              onClick={handleReplyClick}
              className="px-8 py-4 bg-gradient-to-b from-[#ffb84d] to-[#ff9d3d] text-[#150c26] rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-amber-500/10 cursor-pointer"
            >
              Return Thank You Message
            </button>
          </motion.div>
          
          <motion.div {...reveal} className="pt-4">
            <a
              href="/create"
              className={`inline-block font-display text-[10px] tracking-widest uppercase border-b border-[#ffb84d] pb-0.5 ${isDark ? "text-slate-400 hover:text-pink-400" : "text-[#1a1030]/60 hover:text-[#ff5c8a]"} transition-colors`}
            >
              Create Your Own Birthday Scrapbook ✨
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className={`relative px-6 py-16 ${isDark ? "bg-[#0c071f]" : "bg-[#fff7ed]"} text-center`}>
        <motion.p {...reveal} className={`font-hand text-3xl ${isDark ? "text-slate-200" : "text-[#1a1030]/80"} mb-2`}>
          Happy Birthday, {partnerName || "Zara"}! 🎈
        </motion.p>
        <motion.p {...reveal} className={`font-display text-[10px] tracking-widest uppercase ${isDark ? "text-slate-500" : "text-[#1a1030]/40"}`}>
          Made with love, just for you
        </motion.p>
      </footer>
      <BackgroundMusic category="birthday" enabled={musicEnabled && !hideMusicPlayer} />
    </div>
  );
}
