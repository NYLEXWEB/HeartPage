"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // States
  const [isWeddingDay, setIsWeddingDay] = useState(false);
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Parallax Scroll FX
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const [parallaxScale, setParallaxScale] = useState(1);
  const [parallaxOpacity, setParallaxOpacity] = useState(1);
  const [cornersY, setCornersY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(pct);

      const heroHeight = window.innerHeight;
      const progress = Math.min(scrollTop / heroHeight, 1);
      
      setParallaxY(progress * 60);
      setParallaxScale(1 - progress * 0.06);
      setParallaxOpacity(1 - progress * 0.8);
      setCornersY(progress * -20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate Countdown
  useEffect(() => {
    if (!relationshipDate) return;

    const calculateTimeLeft = () => {
      const weddingDate = new Date(relationshipDate);
      if (isNaN(weddingDate.getTime())) return;
      
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        setIsWeddingDay(true);
        return;
      }

      setIsWeddingDay(false);
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setCountdown({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [relationshipDate]);

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

  // Safe date formatting matching mockup "12 · December · 2026"
  const safeDate = relationshipDate ? new Date(relationshipDate) : new Date();
  const formattedDate = isNaN(safeDate.getTime())
    ? "12 · December · 2026"
    : safeDate
        .toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })
        .replace(/ /g, " · ");

  // Motion Reveal Presets
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  const revealScale = {
    initial: { opacity: 0, scale: 0.92 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 1.1, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  const initials = `${yourName ? yourName.charAt(0).toUpperCase() : "A"} & ${partnerName ? partnerName.charAt(0).toUpperCase() : "R"}`;

  return (
    <div className="antialiased relative select-none w-full min-h-screen bg-[#f7f1e4] text-[#0e1912] font-jost overflow-x-hidden">
      {/* Custom Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Cormorant:ital,wght@0,300;0,400;0,600;1,400&family=Parisienne&family=Jost:wght@300;400;500&display=swap');
        
        :root {
          --ink:        #0e1912;
          --emerald:    #10241a;
          --emerald-2:  #16301f;
          --ivory:      #f7f1e4;
          --ivory-2:    #efe6d1;
          --gold:       #c9a24b;
          --gold-soft:  #e4c988;
          --gold-line:  rgba(201,162,75,0.55);
        }
        
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-script { font-family: 'Parisienne', cursive; }
        .font-cormorant { font-family: 'Cormorant', serif; }
        .font-jost { font-family: 'Jost', sans-serif; }

        .bg-emerald-deep {
          background: radial-gradient(120% 140% at 50% 0%, var(--emerald-2) 0%, var(--emerald) 55%, #0b160f 100%);
        }

        .gold-line {
          background: linear-gradient(90deg, transparent, var(--gold) 50%, transparent);
          height: 1px;
        }

        .divider-dot::before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          background: var(--gold);
          transform: rotate(45deg);
          margin: 0 auto;
        }

        .grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .monogram-draw path {
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          animation: draw-mono 3.2s cubic-bezier(.22,.61,.36,1) forwards;
        }
        
        @keyframes draw-mono {
          to { stroke-dashoffset: 0; }
        }
      `}} />

      {/* Scroll progress indicator */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#c9a24b] to-[#e4c988] z-50 transition-[width] duration-75 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative min-h-screen bg-emerald-deep text-[#f7f1e4] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <div className="grain" />

        {/* Ambient Corner Flourishes */}
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out" 
          style={{ transform: `translateY(${cornersY}px)` }}
        >
          <svg className="absolute top-6 left-6 w-20 h-20 md:w-28 md:h-28 opacity-70" viewBox="0 0 100 100" fill="none">
            <path d="M2 2 C 2 40, 20 60, 60 60" stroke="var(--gold)" strokeWidth="1" />
            <circle cx="60" cy="60" r="2.2" fill="var(--gold)" />
          </svg>
          <svg className="absolute top-6 right-6 w-20 h-20 md:w-28 md:h-28 opacity-70 -scale-x-100" viewBox="0 0 100 100" fill="none">
            <path d="M2 2 C 2 40, 20 60, 60 60" stroke="var(--gold)" strokeWidth="1" />
            <circle cx="60" cy="60" r="2.2" fill="var(--gold)" />
          </svg>
          <svg className="absolute bottom-6 left-6 w-20 h-20 md:w-28 md:h-28 opacity-70 scale-y-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M2 2 C 2 40, 20 60, 60 60" stroke="var(--gold)" strokeWidth="1" />
            <circle cx="60" cy="60" r="2.2" fill="var(--gold)" />
          </svg>
          <svg className="absolute bottom-6 right-6 w-20 h-20 md:w-28 md:h-28 opacity-70 scale-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M2 2 C 2 40, 20 60, 60 60" stroke="var(--gold)" strokeWidth="1" />
            <circle cx="60" cy="60" r="2.2" fill="var(--gold)" />
          </svg>
        </div>

        <motion.p 
          {...reveal} 
          className="font-cormorant tracking-[0.35em] text-[11px] md:text-xs text-[#e4c988] uppercase mb-8"
        >
          Together with their families
        </motion.p>

        {/* Monogram signature */}
        <motion.div 
          {...revealScale}
          className="relative w-[220px] h-[220px] md:w-[300px] md:h-[300px] mb-8"
          style={{
            transform: `translateY(${parallaxY}px) scale(${parallaxScale})`,
            opacity: parallaxOpacity,
          }}
        >
          <svg viewBox="0 0 300 300" className="monogram-draw w-full h-full">
            <circle cx="150" cy="150" r="128" fill="none" stroke="var(--gold)" strokeWidth="1" />
            <g className="inner-flourish">
              <path d="M150 40 C 170 60, 170 60, 150 80 C 130 60, 130 60, 150 40 Z" fill="none" stroke="var(--gold)" strokeWidth="1" />
              <path d="M150 260 C 170 240, 170 240, 150 220 C 130 240, 130 240, 150 260 Z" fill="none" stroke="var(--gold)" strokeWidth="1" />
              <path d="M40 150 C 60 130, 60 130, 80 150 C 60 170, 60 170, 40 150 Z" fill="none" stroke="var(--gold)" strokeWidth="1" />
              <path d="M260 150 C 240 130, 240 130, 220 150 C 240 170, 240 170, 260 150 Z" fill="none" stroke="var(--gold)" strokeWidth="1" />
            </g>
            <text 
              x="150" 
              y="172" 
              textAnchor="middle" 
              fontFamily="Cormorant Garamond, serif" 
              fontSize="86" 
              fill="var(--gold-soft)" 
              fontWeight="500" 
              letterSpacing="2"
            >
              {initials}
            </text>
          </svg>
        </motion.div>

        <motion.h1 {...reveal} className="font-display font-normal text-5xl md:text-7xl text-[#e4c988] mb-3">
          {yourName || "Bride"}
        </motion.h1>
        <motion.div {...reveal} className="font-display italic text-2xl md:text-3xl text-[#efe6d1]/80 my-1">
          and
        </motion.div>
        <motion.h1 {...reveal} className="font-display font-normal text-5xl md:text-7xl text-[#e4c988] mb-8">
          {partnerName || "Groom"}
        </motion.h1>

        <motion.div {...reveal} className="w-16 gold-line mb-8" />

        <motion.p {...reveal} className="font-cormorant text-lg md:text-xl tracking-[0.25em] uppercase text-[#efe6d1]/90">
          {formattedDate}
        </motion.p>
        <motion.p {...reveal} className="font-cormorant text-sm tracking-[0.2em] uppercase text-[#efe6d1]/50 mt-2">
          Kozhikode, Kerala
        </motion.p>

        <a href="#message-section" className="absolute bottom-10 flex flex-col items-center gap-2 text-[#efe6d1]/70 group">
          <span className="font-cormorant text-[10px] tracking-[0.25em] uppercase">Scroll</span>
          <span className="w-px h-10 bg-[#e4c988]/50 group-hover:h-14 transition-all duration-500" />
        </a>
      </section>

      {/* ============================================================ */}
      {/* INVITATION MESSAGE */}
      {/* ============================================================ */}
      <section id="message-section" className="relative px-6 py-28 md:py-36 bg-[#f7f1e4]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...reveal} className="divider-dot justify-center mb-8 flex items-center gap-3">
            <span className="w-10 gold-line" />
            <span className="w-10 gold-line" />
          </motion.div>

          <motion.p 
            {...reveal} 
            className="font-cormorant italic text-2xl md:text-3xl leading-relaxed text-[#10241a]/95 whitespace-pre-line"
          >
            "{message || "Two souls, one heart, one beautiful beginning. With hearts full of joy, we invite you to witness our vows and celebrate the start of forever, surrounded by the people we love most."}"
          </motion.p>

          <motion.div {...reveal} className="divider-dot justify-center mt-10 flex items-center gap-3">
            <span className="w-10 gold-line" />
            <span className="w-10 gold-line" />
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COUNTDOWN */}
      {/* ============================================================ */}
      <section className="relative px-6 py-28 md:py-36 bg-emerald-deep text-[#f7f1e4] overflow-hidden">
        <div className="grain" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p {...reveal} className="font-cormorant tracking-[0.35em] text-xs text-[#e4c988] uppercase mb-4">
            The Countdown Begins
          </motion.p>
          <motion.h2 {...reveal} className="font-display italic text-3xl md:text-5xl mb-14 text-[#efe6d1]">
            Until we say &ldquo;I do&rdquo;
          </motion.h2>

          <motion.div {...revealScale} className="grid grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto">
            <div className="border border-[rgba(201,162,75,0.55)] bg-white/[0.03] rounded-sm py-6 md:py-10 px-2 backdrop-blur-sm">
              <div className="font-display text-4xl md:text-6xl text-[#e4c988]">{countdown.days}</div>
              <div className="font-cormorant text-[10px] md:text-xs tracking-[0.35em] uppercase mt-2 text-[#efe6d1]/70">Days</div>
            </div>
            <div className="border border-[rgba(201,162,75,0.55)] bg-white/[0.03] rounded-sm py-6 md:py-10 px-2 backdrop-blur-sm">
              <div className="font-display text-4xl md:text-6xl text-[#e4c988]">{countdown.hours}</div>
              <div className="font-cormorant text-[10px] md:text-xs tracking-[0.35em] uppercase mt-2 text-[#efe6d1]/70">Hours</div>
            </div>
            <div className="border border-[rgba(201,162,75,0.55)] bg-white/[0.03] rounded-sm py-6 md:py-10 px-2 backdrop-blur-sm">
              <div className="font-display text-4xl md:text-6xl text-[#e4c988]">{countdown.minutes}</div>
              <div className="font-cormorant text-[10px] md:text-xs tracking-[0.35em] uppercase mt-2 text-[#efe6d1]/70">Minutes</div>
            </div>
            <div className="border border-[rgba(201,162,75,0.55)] bg-white/[0.03] rounded-sm py-6 md:py-10 px-2 backdrop-blur-sm">
              <div className="font-display text-4xl md:text-6xl text-[#e4c988]">{countdown.seconds}</div>
              <div className="font-cormorant text-[10px] md:text-xs tracking-[0.35em] uppercase mt-2 text-[#efe6d1]/70">Seconds</div>
            </div>
          </motion.div>

          {isWeddingDay && (
            <motion.p {...reveal} className="font-cormorant italic text-lg text-[#efe6d1]/80 mt-12">
              {yourName} &amp; {partnerName} are married! 🤵👰💍🤍
            </motion.p>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* COUPLE NAMES DETAIL */}
      {/* ============================================================ */}
      <section className="relative px-6 py-28 md:py-36 bg-[#f7f1e4]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 md:gap-8 text-center">
          <motion.div {...reveal}>
            <div className="mx-auto mb-6 w-14 h-14 rounded-full border border-[rgba(201,162,75,0.55)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
                <path d="M12 21s-7-4.35-9.5-8.2C.5 9.5 2 5.5 6 5c2.2-.28 3.7 1.1 4.5 2.3.3.45.7.45 1 0C12.3 6.1 13.8 4.72 16 5c4 .5 5.5 4.5 3.5 7.8C19 16.65 12 21 12 21z" />
              </svg>
            </div>
            <p className="font-cormorant tracking-[0.35em] text-[11px] text-[#a9853a] uppercase mb-3">The Host</p>
            <h3 className="font-display font-medium text-3xl md:text-4xl mb-4 text-[#10241a]">{yourName || "Bride"}</h3>
            <p className="font-cormorant text-[#10241a]/70 leading-relaxed max-w-sm mx-auto">
              Beloved Family &amp; Friends of {yourName || "Bride"}
            </p>
          </motion.div>

          <motion.div {...reveal}>
            <div className="mx-auto mb-6 w-14 h-14 rounded-full border border-[rgba(201,162,75,0.55)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
                <path d="M12 21s-7-4.35-9.5-8.2C.5 9.5 2 5.5 6 5c2.2-.28 3.7 1.1 4.5 2.3.3.45.7.45 1 0C12.3 6.1 13.8 4.72 16 5c4 .5 5.5 4.5 3.5 7.8C19 16.65 12 21 12 21z" />
              </svg>
            </div>
            <p className="font-cormorant tracking-[0.35em] text-[11px] text-[#a9853a] uppercase mb-3">The Partner</p>
            <h3 className="font-display font-medium text-3xl md:text-4xl mb-4 text-[#10241a]">{partnerName || "Groom"}</h3>
            <p className="font-cormorant text-[#10241a]/70 leading-relaxed max-w-sm mx-auto">
              Beloved Family &amp; Friends of {partnerName || "Groom"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MEMORY GALLERY (OPTIONAL) */}
      {/* ============================================================ */}
      {images && images.length > 0 && (
        <section className="relative px-6 py-28 md:py-36 bg-[#f7f1e4] border-t border-[rgba(201,162,75,0.55)]/30">
          <div className="max-w-6xl mx-auto text-center">
            <motion.p {...reveal} className="font-cormorant tracking-[0.35em] text-xs text-[#a9853a] uppercase mb-4">
              Captured Moments
            </motion.p>
            <motion.h2 {...reveal} className="font-display italic text-3xl md:text-5xl mb-14 text-[#10241a]">
              Our Gallery
            </motion.h2>

            <motion.div 
              {...revealScale}
              className={`grid gap-8 ${
                images.length === 1 
                  ? "grid-cols-1 max-w-xl mx-auto" 
                  : images.length === 2 
                  ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto" 
                  : images.length === 3 
                  ? "grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto" 
                  : "grid-cols-2 md:grid-cols-4"
              }`}
            >
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative group aspect-[4/5] overflow-hidden border border-[rgba(201,162,75,0.55)] bg-[#fcfaf5] p-2 transition-transform duration-500 hover:scale-[1.02] shadow-sm"
                >
                  <div className="w-full h-full overflow-hidden relative">
                    <img 
                      src={img} 
                      alt={`Moment ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1912]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <span className="font-cormorant text-[#f7f1e4] italic text-sm tracking-wider">Moment #0{idx + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* RSVP / ACTION SECTION */}
      {/* ============================================================ */}
      <section className="relative px-6 py-20 bg-[#f7f1e4] text-center border-t border-[rgba(201,162,75,0.55)]/20">
        <div className="max-w-md mx-auto space-y-6">
          <motion.div {...reveal} className="space-y-4">
            <h3 className="font-display italic text-2xl md:text-3xl text-[#10241a]">
              Are you joining us?
            </h3>
            <p className="font-cormorant text-sm text-[#10241a]/70 tracking-wide">
              Please RSVP by letting us know if you can attend our wedding celebration.
            </p>
          </motion.div>

          <motion.div {...reveal} className="pt-2">
            <button
              onClick={handleReplyClick}
              className="px-8 py-3.5 bg-gradient-to-r from-[#e4c988] to-[#c9a24b] text-[#10241a] rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-amber-500/10 cursor-pointer"
            >
              Send Congratulations / RSVP
            </button>
          </motion.div>
          
          <motion.div {...reveal} className="pt-4">
            <a
              href="/create"
              className="inline-block font-cormorant text-[10px] tracking-[0.2em] uppercase border-b border-[rgba(201,162,75,0.55)] pb-0.5 text-[#a9853a] hover:text-[#c9a24b] transition-colors"
            >
              Create Your Own Invitation Scrapbook ✨
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="relative px-6 py-20 bg-emerald-deep text-[#f7f1e4] text-center overflow-hidden">
        <div className="grain" />
        <motion.div 
          {...revealScale} 
          className="w-10 h-10 mx-auto mb-6 relative"
        >
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M20 5 C 25 12, 25 12, 20 19 C 15 12, 15 12, 20 5 Z" fill="none" stroke="var(--gold)" strokeWidth="1" />
            <path d="M20 35 C 25 28, 25 28, 20 21 C 15 28, 15 28, 20 35 Z" fill="none" stroke="var(--gold)" strokeWidth="1" />
          </svg>
        </motion.div>
        <motion.p {...reveal} className="font-display text-3xl text-[#e4c988] mb-2">
          {yourName || "Bride"} &amp; {partnerName || "Groom"}
        </motion.p>
        <motion.p {...reveal} className="font-cormorant text-xs tracking-[0.35em] uppercase text-[#efe6d1]/50">
          With love and gratitude
        </motion.p>
      </footer>
    </div>
  );
}
