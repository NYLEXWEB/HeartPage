"use client";

import { useState, useEffect ,useMemo } from "react";
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
  selectedMusic?: string;
}

/**
 * Design notes:
 * - Subject framing: a birthday told as a day-into-night keepsake — a quiet,
 *   warm invitation rather than a primary-colour party-template look.
 * - Palette: blush-ivory paper (#FBF3EC) + deep plum ink (#2B1B2F) + muted
 *   rose / antique gold / dusty sage / soft lilac. No saturated cartoon
 *   balloon colours, no cream+terracotta AI-cliché pairing.
 * - Type: Fraunces (a real display serif with personality) for headlines,
 *   Caveat kept for the handwritten note and signature, Nunito for labels.
 * - Signature element: the candle-blow wish interaction — kept and polished,
 *   since it's the one truly unique, content-tied interactive moment.
 * - Light is the default; dark only activates via the `theme` prop.
 */

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
  selectedMusic,
}: BirthdayTemplateProps) {
  const router = useRouter();
  const isDark = theme === "dark";

  const getLinkUrl = (val: string) => {
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    if (val.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/)) return `https://${val}`;
    return null;
  };

  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [wished, setWished] = useState(false);
  const [blownFlames, setBlownFlames] = useState<boolean[]>([false, false, false]);
  const [confetti, setConfetti] = useState<{
    id: number; dx: number; dy: number; rot: number; style: React.CSSProperties;
  }[]>([]);

  const [balloonY, setBalloonY] = useState(0);
  const [balloonOpacity, setBalloonOpacity] = useState(1);

  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 6 + 3; // 3px to 9px
      const left = Math.random() * 100; // 0% to 100%
      const delay = Math.random() * -20; // negative delay so they start immediately
      const duration = Math.random() * 15 + 15; // 15s to 30s
      const drift = Math.random() * 80 - 40; // -40px to 40px
      const maxOpacity = Math.random() * 0.25 + 0.15; // 0.15 to 0.4
      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          "--duration": `${duration}s`,
          "--drift": `${drift}px`,
          "--max-opacity": maxOpacity,
        } as React.CSSProperties,
      };
    });
  }, []);

  const [nextBirthdayCountdown, setNextBirthdayCountdown] = useState({
    days: "00", hours: "00", minutes: "00", seconds: "00"
  });

  const getZodiacDetails = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const month = d.getMonth() + 1;
    const day = d.getDate();

    let sign = ""; let element = ""; let traits = ""; let symbol = ""; let desc = "";

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      sign = "Aries"; element = "Fire"; traits = "Courageous, Passionate, Adventurous"; symbol = "♈";
      desc = "A natural leader filled with energy and enthusiasm, always ready to start new adventures.";
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      sign = "Taurus"; element = "Earth"; traits = "Reliable, Patient, Devoted"; symbol = "♉";
      desc = "Grounded, stubborn but loyal, appreciating the beauty, stability, and finer comforts of life.";
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      sign = "Gemini"; element = "Air"; traits = "Expressive, Curious, Adaptable"; symbol = "♊";
      desc = "A lively mind filled with ideas, naturally witty, expressive, and incredibly fun to converse with.";
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      sign = "Cancer"; element = "Water"; traits = "Intuitive, Caring, Protective"; symbol = "♋";
      desc = "Deeply intuitive and emotional, caring deeply about loved ones and creating a warm, safe home.";
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      sign = "Leo"; element = "Fire"; traits = "Generous, Creative, Loyal"; symbol = "♌";
      desc = "Possesses a warm heart and radiant confidence, bringing passion, creativity, and laughter everywhere.";
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      sign = "Virgo"; element = "Earth"; traits = "Kind, Analytical, Practical"; symbol = "♍";
      desc = "Observant, kind-hearted, and incredibly thoughtful, finding order and beauty in the smallest details.";
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      sign = "Libra"; element = "Air"; traits = "Diplomatic, Harmonious, Charming"; symbol = "♎";
      desc = "A lover of beauty and harmony, bringing charm, balance, and peaceful vibes into everyone's life.";
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      sign = "Scorpio"; element = "Water"; traits = "Brave, Passionate, Loyal"; symbol = "♏";
      desc = "Intense, deeply passionate, and fiercely loyal, possessing an magnetic presence and rich inner world.";
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      sign = "Sagittarius"; element = "Fire"; traits = "Optimistic, Free-spirited, Witty"; symbol = "♐";
      desc = "A free spirit who loves freedom and learning, full of optimism and a wonderful sense of humor.";
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      sign = "Capricorn"; element = "Earth"; traits = "Disciplined, Ambitious, Patient"; symbol = "♑";
      desc = "Patient, practical, and highly ambitious, building steady pathways to reach the highest peaks.";
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      sign = "Aquarius"; element = "Air"; traits = "Original, Independent, Creative"; symbol = "♒";
      desc = "A unique thinker who values independence, creativity, and original ideas that make the world better.";
    } else {
      sign = "Pisces"; element = "Water"; traits = "Compassionate, Artistic, Wise"; symbol = "♓";
      desc = "Deeply compassionate and artistic, wise beyond years, with a beautifully creative and dreamy mind.";
    }
    return { sign, element, traits, symbol, desc };
  };

  const lifeStats = useMemo(() => {
    if (!relationshipDate) return null;
    const birthDate = new Date(relationshipDate);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    const diffTime = Math.max(0, today.getTime() - birthDate.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const heartbeats = Math.floor(totalDays * 24 * 60 * 80); // 80 bpm avg
    const breaths = Math.floor(totalDays * 24 * 60 * 16); // 16 breaths avg
    const orbits = Math.floor(totalDays / 365.25); // years
    const distanceKm = (totalDays * 2.57).toFixed(1); // 2.57 million km per day

    return {
      totalDays,
      heartbeats: heartbeats.toLocaleString(),
      breaths: breaths.toLocaleString(),
      orbits,
      distanceKm,
    };
  }, [relationshipDate]);

  const formattedBirthDate = useMemo(() => {
    if (!relationshipDate) return null;
    const d = new Date(relationshipDate);
    if (isNaN(d.getTime())) return null;
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    return { day, month };
  }, [relationshipDate]);

  useEffect(() => {
    if (!relationshipDate) return;
    const birthDate = new Date(relationshipDate);
    if (isNaN(birthDate.getTime())) return;

    const updateCountdown = () => {
      const today = new Date();
      let nextBdayYear = today.getFullYear();
      let nextBday = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate());
      
      if (today.getTime() > nextBday.getTime()) {
        nextBday = new Date(nextBdayYear + 1, birthDate.getMonth(), birthDate.getDate());
      }
      
      const diffTime = nextBday.getTime() - today.getTime();
      if (diffTime <= 0) {
        setNextBirthdayCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const d = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffTime % (1000 * 60)) / 1000);

      setNextBirthdayCountdown({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [relationshipDate]);

  useEffect(() => {
    const linkId = "google-fonts-birthday";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Caveat:wght@500;600;700&family=Nunito:wght@300;400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const heroHeight = window.innerHeight;
      const progress = Math.min(scrollTop / heroHeight, 1);
      setBalloonY(progress * -30);
      setBalloonOpacity(1 - progress * 0.7);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (relationshipDate) {
      const birthDate = new Date(relationshipDate);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        setCalculatedAge(age > 0 && age < 120 ? age : null);
      }
    }
  }, [relationshipDate]);

  const burstConfetti = () => {
    const colors = ["#D9607A", "#C9963B", "#6FA88F", "#9C86C4", "#FBF3EC"];
    const newConfetti = Array.from({ length: 54 }).map((_, i) => {
      const size = 5 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const dist = 110 + Math.random() * 200;
      const dx = Math.cos(angle) * dist;
      const dy = -Math.abs(Math.sin(angle) * dist) - 70 - Math.random() * 110;
      const rot = Math.random() * 720 - 360;
      return {
        id: i, dx, dy: dy + 240, rot,
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
          transition: `transform ${1.1 + Math.random()}s cubic-bezier(.2,.6,.3,1), opacity 1.5s ease`,
          pointerEvents: "none" as const,
        } as React.CSSProperties,
      };
    });
    setConfetti(newConfetti);
    setTimeout(() => {
      setConfetti((prev) => prev.map((c) => ({
        ...c,
        style: { ...c.style, transform: `translate(${c.dx}px, ${c.dy}px) rotate(${c.rot}deg)`, opacity: 0 },
      })));
    }, 50);
  };

  const handleMakeWish = () => {
    if (wished) return;
    setWished(true);
    [0, 1, 2].forEach((idx) => {
      setTimeout(() => {
        setBlownFlames((prev) => { const next = [...prev]; next[idx] = true; return next; });
      }, idx * 150);
    });
    setTimeout(() => burstConfetti(), 550);
  };

  const handleReplyClick = () => {
    const params = new URLSearchParams({
      isReply: "true", category: "birthday", yourName: partnerName, partnerName: yourName,
    });
    if (relationshipDate) params.append("relationshipDate", relationshipDate);
    router.push(`/create?${params.toString()}`);
  };

  const reveal = {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  };
  const revealPop = {
    initial: { opacity: 0, scale: 0.92, rotate: -2 },
    whileInView: { opacity: 1, scale: 1, rotate: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.34, 1.2, 0.64, 1] as const },
  };
  const revealScale = {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  return (
    <div className={`antialiased relative select-none w-full min-h-screen font-body ${isDark ? "dark" : ""}`}>
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div key={p.id} className="bday-particle" style={p.style} />
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
:root {
  --night:    ${isDark ? "#0B0604" : "#1A100C"};
  --night-2:  ${isDark ? "#25150F" : "#3A2419"};
  --night-3:  ${isDark ? "#050302" : "#0D0806"};

  --paper:    ${isDark ? "#1B120E" : "#F3E9DA"};
  --paper-2:  ${isDark ? "#261A14" : "#FFF9F0"};

  --ink:      ${isDark ? "#F6EBDD" : "#261710"};
  --ink-soft: ${isDark ? "#BDA99C" : "#79685E"};

  --line: ${isDark
    ? "rgba(201,154,98,0.15)"
    : "rgba(38,23,16,0.11)"};

  --rose:  #C46F32;
  --gold:  #C99A62;
  --sage:  #D7A875;
  --lilac: #8C5941;
}
        .font-display { font-family: 'Fraunces', serif; }
        .font-hand { font-family: 'Caveat', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }

        #bday-root { background-color: var(--paper); color: var(--ink); }
        .bg-night {
          background: radial-gradient(120% 140% at 50% 0%, var(--night-2) 0%, var(--night) 55%, var(--night-3) 100%);
        }
        .eyebrow {
          font-family: 'Nunito', sans-serif;
          letter-spacing: 0.28em; text-transform: uppercase; font-size: 0.68rem; font-weight: 700;
          color: var(--gold);
        }
        .bday-card {
          background: var(--paper-2);
          border: 1px solid var(--line);
        }

        .balloon { position: absolute; animation: bob 7s ease-in-out infinite; will-change: transform; opacity: 0.92; }
        .balloon.d2 { animation-duration: 8.5s; animation-delay: .3s; }
        .balloon.d3 { animation-duration: 6.5s; animation-delay: .6s; }
        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-18px) rotate(1.5deg); }
        }

        .flame { animation: flicker 1.1s ease-in-out infinite alternate; transform-origin: bottom center; }
        @keyframes flicker {
          0% { transform: scale(1) rotate(-2deg); opacity: 1; }
          50% { transform: scale(1.08) rotate(2deg); opacity: .92; }
          100% { transform: scale(0.96) rotate(-1deg); opacity: 1; }
        }

        .card-ribbon::before {
          content: '';
          position: absolute; top: -9px; left: 50%;
          transform: translateX(-50%) rotate(-2deg);
          width: 56px; height: 18px;
          background: rgba(201,150,59,0.35);
        }

        .grain {
          position: absolute; inset: 0; pointer-events: none; opacity: .04; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        @keyframes bday-float-particle {
          0% {
            transform: translateY(105vh) translateX(0) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: var(--max-opacity, 0.4);
          }
          85% {
            opacity: var(--max-opacity, 0.4);
          }
          100% {
            transform: translateY(-10vh) translateX(var(--drift, 40px)) scale(1.2);
            opacity: 0;
          }
        }
        .bday-particle {
          position: absolute;
          border-radius: 50%;
          background: var(--rose);
          pointer-events: none;
          animation: bday-float-particle var(--duration, 20s) linear infinite;
          opacity: 0;
        }

        .bday-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url("/birthday%20hero%20section.png");
          background-size: cover;
          background-position: center;
          opacity: 0.28;
          mix-blend-mode: luminosity;
          z-index: 0;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .bday-hero-bg {
            background-image: url("/birthday%20hero%20section%20mobile.png");
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .balloon { animation: none; }
          .flame { animation: none; }
          .bday-particle { display: none; }
        }
      ` }} />

      <div id="bday-root">
        {/* HERO */}
        <section className="relative min-h-screen bg-night text-[#F3EBE3] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
          <div className="grain" />
          <div className="bday-hero-bg" />

          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out z-10"
            style={{ transform: `translateY(${balloonY}px)`, opacity: balloonOpacity }}
          >
            <svg className="balloon absolute left-[8%] top-[16%] w-12 md:w-16" viewBox="0 0 60 80" fill="none">
              <ellipse cx="30" cy="30" rx="26" ry="29" fill="var(--rose)" />
              <path d="M30 59 L30 78" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
            </svg>
            <svg className="balloon d2 absolute right-[10%] top-[12%] w-14 md:w-18" viewBox="0 0 60 80" fill="none">
              <ellipse cx="30" cy="30" rx="26" ry="29" fill="var(--sage)" />
              <path d="M30 59 L30 78" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
            </svg>
            <svg className="balloon d3 absolute left-[16%] bottom-[18%] w-10 md:w-14" viewBox="0 0 60 80" fill="none">
              <ellipse cx="30" cy="30" rx="26" ry="29" fill="var(--gold)" />
              <path d="M30 59 L30 78" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
            </svg>
          </div>

          {birthdayPhoto && (
            <motion.div
              {...revealPop}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-[3px] border-[var(--gold)] shadow-xl -mt-10 mb-8 md:-mt-6 md:mb-10 flex-shrink-0 relative z-10"
            >
              <img
                src={birthdayPhoto}
                alt={partnerName || "Birthday Person"}
                className="w-full h-full object-cover select-none"
              />
            </motion.div>
          )}

          <motion.p {...reveal} className="eyebrow mb-6">A litt celebration for</motion.p>

          <motion.h1 {...reveal} className="font-display font-semibold text-5xl sm:text-6xl md:text-8xl leading-[0.98] text-center mb-5 tracking-tight">
            Happy Birthday,<br />
            <span style={{ color: "var(--rose)" }}>{partnerName || "Zara"}</span>
          </motion.h1>

          {calculatedAge !== null ? (
            <motion.div {...reveal} className="inline-flex items-center gap-2 font-hand text-3xl md:text-4xl mb-10" style={{ color: "var(--gold)" }}>
              <span>turning</span>
              <span className="font-display font-semibold text-white text-4xl md:text-5xl">{calculatedAge}</span>
              <span>today</span>
            </motion.div>
          ) : (
            <motion.div {...reveal} className="inline-flex items-center gap-2 font-hand text-3xl md:text-4xl mb-10" style={{ color: "var(--gold)" }}>
              <span>celebrating today</span>
            </motion.div>
          )}

          <a href="#message-card" className="absolute bottom-10 flex flex-col items-center gap-2 text-white/50 group">
            <span className="eyebrow !text-white/50">Scroll down</span>
            <span className="w-px h-10 bg-[var(--gold)]/60 group-hover:h-14 transition-all duration-500" />
          </a>
        </section>

        {/* PHOTO SHOWCASE */}
        {birthdayPhoto && (
          <section className="relative px-6 py-20 md:py-28" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
              {/* Polaroid Frame */}
              <motion.div {...revealPop} className="relative max-w-[340px] w-full">
                {/* Decorative floating items behind polaroid */}
                <div className="absolute -top-10 -left-6 -z-10 opacity-40 select-none animate-bounce">
                  <span className="text-4xl">🎈</span>
                </div>
                <div className="absolute -bottom-8 -right-4 -z-10 opacity-40 select-none animate-bounce" style={{ animationDelay: "1.2s" }}>
                  <span className="text-4xl">🍰</span>
                </div>
                <div className="absolute top-1/2 -right-8 -z-10 opacity-30 select-none hidden md:block">
                  <span className="text-3xl">✨</span>
                </div>

                <div className="bday-card relative p-4 md:p-5 rounded-lg rotate-[-2deg] shadow-2xl bg-white text-slate-900 border-[3px] border-[var(--gold)]">
                  {/* Semi-transparent Washi Tape Deco */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-[var(--gold)]/25 backdrop-blur-[1px] rotate-[1.5deg] border border-[var(--gold)]/20 shadow-sm" />
                  
                  <div className="aspect-[3/4] overflow-hidden rounded-sm relative shadow-inner">
                    <img src={birthdayPhoto} alt={partnerName || "Birthday Star"} className="w-full h-full object-cover select-none" loading="lazy" decoding="async" />
                  </div>
                  <div className="pt-6 pb-2 text-center border-t border-slate-100 mt-4">
                    <p className="font-hand text-3xl text-[var(--rose)]">{partnerName || "Birthday Star"}</p>
                    <p className="text-[9px] uppercase tracking-widest font-mono text-slate-400 mt-1">Level {calculatedAge || "Up"}</p>
                  </div>
                </div>
              </motion.div>

              {/* Text / Birthday profile detail */}
              <motion.div {...reveal} className="max-w-xl space-y-6">
                <div className="space-y-3 text-center lg:text-left">
                  <span className="eyebrow inline-block px-3 py-1 rounded-full" style={{ background: "rgba(201,150,59,0.12)" }}>
                    Celebrating our favorite person
                  </span>
                  <h2 className="font-display font-semibold text-4xl md:text-5xl tracking-tight leading-none">
                    Happy Birthday to the <span style={{ color: "var(--rose)" }}>one &amp; only</span>!
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    Today we celebrate you, {partnerName} — your laughter, your spirit, and the joy you bring into all of our lives. May this year be filled with dream-chasing and beautiful new beginnings.
                  </p>
                </div>

                {/* Calendar Card badge */}
                {formattedBirthDate && (
                  <div className="flex gap-4 items-center p-4 rounded-xl bday-card max-w-md mx-auto lg:mx-0" style={{ background: "rgba(201, 150, 59, 0.04)" }}>
                    <div className="flex flex-col items-center justify-center bg-[var(--rose)] text-white w-14 h-16 rounded-lg shadow-md overflow-hidden flex-shrink-0">
                      <span className="text-[9px] uppercase font-bold tracking-wider pt-1">{formattedBirthDate.month.substring(0, 3)}</span>
                      <span className="text-2xl font-display font-semibold pb-1">{formattedBirthDate.day}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold tracking-wider uppercase" style={{ color: "var(--gold)" }}>The Birthday Star's Day</h4>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>Marked on the calendar of our hearts forever.</p>
                    </div>
                  </div>
                )}


              </motion.div>
            </div>
          </section>
        )}

        {/* COSMIC JOURNEY (Zodiac + stats + next bday countdown) */}
        {relationshipDate && !isNaN(new Date(relationshipDate).getTime()) && (
          <section className="relative px-6 py-20 md:py-28" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14">
                <span className="eyebrow mb-2 block">Space &amp; Time</span>
                <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight">Your cosmic journey</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* COUNTDOWN CARD */}
                <motion.div {...revealPop} className="bday-card p-8 rounded-xl shadow-lg flex flex-col justify-between">
                  <div>
                    <span className="eyebrow mb-2 block" style={{ color: "var(--rose)" }}>Next Celebration</span>
                    <h3 className="font-display font-semibold text-2xl mb-4">Countdown to next birthday</h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink-soft)" }}>
                      Every second brings us closer to celebrating another beautiful milestone of your life.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      ["Days", nextBirthdayCountdown.days],
                      ["Hours", nextBirthdayCountdown.hours],
                      ["Mins", nextBirthdayCountdown.minutes],
                      ["Secs", nextBirthdayCountdown.seconds]
                    ].map(([label, val]) => (
                      <div key={label} className="p-3 rounded-lg" style={{ background: "rgba(217, 96, 122, 0.08)" }}>
                        <span className="block text-xl md:text-3xl font-display font-semibold" style={{ color: "var(--rose)" }}>{val}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--ink-soft)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* ZODIAC PROFILE CARD */}
                {getZodiacDetails(relationshipDate) && (() => {
                  const zodiac = getZodiacDetails(relationshipDate)!;
                  return (
                    <motion.div {...revealPop} className="bday-card p-8 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute right-4 top-4 text-7xl opacity-10 font-display select-none">
                        {zodiac.symbol}
                      </div>
                      <div>
                        <span className="eyebrow mb-2 block" style={{ color: "var(--rose)" }}>Written in the Stars</span>
                        <h3 className="font-display font-semibold text-2xl mb-1">{zodiac.sign} Profile</h3>
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mb-4" style={{ background: "rgba(201, 150, 59, 0.15)", color: "var(--gold)" }}>
                          {zodiac.element} Element
                        </span>
                        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink-soft)" }}>
                          {zodiac.desc}
                        </p>
                      </div>
                      <div className="border-t pt-4" style={{ borderColor: "var(--line)" }}>
                        <span className="text-[10px] eyebrow block mb-1">Key personality traits</span>
                        <span className="font-hand text-2xl" style={{ color: "var(--rose)" }}>{zodiac.traits}</span>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>

              {/* LIFE STATISTICS GRID */}
              {lifeStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Days Lived", value: lifeStats.totalDays.toLocaleString(), sub: "days of laughter & growth" },
                    { label: "Galactic Distance", value: `${lifeStats.distanceKm}M km`, sub: "traveled around the sun" },
                    { label: "Heartbeats", value: lifeStats.heartbeats, sub: "approx. beats of love" },
                    { label: "Breaths", value: lifeStats.breaths, sub: "approx. breaths of fresh air" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      {...revealScale}
                      className="bday-card p-5 rounded-lg text-center flex flex-col justify-center"
                      style={{ transform: `rotate(${(idx % 2 === 0 ? -0.8 : 0.8)}deg)` }}
                    >
                      <span className="text-[10px] eyebrow block mb-1">{stat.label}</span>
                      <span className="text-2xl md:text-3xl font-display font-semibold block mb-1" style={{ color: "var(--rose)" }}>{stat.value}</span>
                      <span className="text-[11px] leading-snug italic" style={{ color: "var(--ink-soft)" }}>{stat.sub}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* MESSAGE CARD */}
        <section id="message-card" className="relative px-6 py-24 md:py-32" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="max-w-xl mx-auto">
            <motion.div {...revealPop} className="card-ribbon bday-card relative px-8 py-12 md:px-12 md:py-14 rotate-[-1deg] shadow-xl rounded-sm">
              <p className="font-hand text-3xl md:text-4xl leading-relaxed whitespace-pre-line">
                "{message || "Wishing you a day as wonderful as you are, and a year ahead full of laughter, adventure, and every little thing that makes you smile. Here's to you!"}"
              </p>
              <p className="eyebrow mt-8" style={{ color: "var(--ink-soft)" }}>— With love, always, {yourName}</p>
            </motion.div>
          </div>
        </section>

        {/* CUSTOM FIELDS */}
        {customFields && customFields.length > 0 && (
          <section className="relative px-6 py-10">
            <div className="max-w-md mx-auto space-y-4 text-center">
              <p className="eyebrow">Special information</p>
              <div className="space-y-4">
                {customFields.map((field, idx) => {
                  const link = getLinkUrl(field.value);
                  return (
                    <motion.div
                      key={idx} {...revealPop}
                      className="card-ribbon bday-card relative p-5 shadow-md rounded-sm"
                      style={{ transform: `rotate(${(idx % 2 === 0 ? -1 : 1) * 0.7}deg)` }}
                    >
                      <h4 className="eyebrow mb-1">{field.label}</h4>
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-hand text-2xl underline underline-offset-4 break-all" style={{ color: "var(--rose)" }}>
                          {field.value.length > 30 ? "Click to open details" : field.value} ↗
                        </a>
                      ) : (
                        <p className="font-hand text-2xl leading-relaxed whitespace-pre-line">{field.value}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CANDLES + MAKE A WISH */}
        <section className="relative px-6 py-24 md:py-32 bg-night text-[#F3EBE3] overflow-hidden">
          <div className="grain" />
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {confetti.map((conf) => <div key={conf.id} style={conf.style} />)}
          </div>

          <div className="max-w-lg mx-auto text-center relative z-10">
            <motion.p {...reveal} className="eyebrow mb-3">Make a wish</motion.p>
            <motion.h2 {...reveal} className="font-display font-semibold text-3xl md:text-4xl mb-12 tracking-tight">Blow out the candles</motion.h2>

            <motion.div {...revealPop} className="relative mx-auto mb-10 w-[210px]">
              <svg viewBox="0 0 220 200" className="w-full h-auto">
                <ellipse cx="110" cy="175" rx="90" ry="11" fill="rgba(255,255,255,0.06)" />
                <rect x="35" y="120" width="150" height="55" rx="10" fill="var(--rose)" />
                <rect x="35" y="120" width="150" height="14" rx="7" fill="#E8859A" />
                <rect x="50" y="80" width="120" height="45" rx="9" fill="var(--sage)" />
                <rect x="50" y="80" width="120" height="12" rx="6" fill="#8DC0AA" />
                <circle cx="70" cy="120" r="6" fill="var(--gold)" />
                <circle cx="110" cy="123" r="7" fill="var(--gold)" />
                <circle cx="150" cy="119" r="6" fill="var(--gold)" />

                <g>
                  <rect x="75" y="55" width="6" height="26" rx="2" fill="var(--gold)" />
                  <ellipse className={`transition-all duration-[1200ms] ease-out pointer-events-none ${blownFlames[0] ? "opacity-40 -translate-y-8 scale-150" : "opacity-0"}`} cx="78" cy="45" rx="4" ry="8" fill="white" />
                  <path className={`flame transition-all duration-500 ease-out ${blownFlames[0] ? "opacity-0 scale-0 pointer-events-none" : ""}`} d="M78 40 C 74 46, 74 52, 78 55 C 82 52, 82 46, 78 40 Z" fill="#F0B857" />
                </g>
                <g>
                  <rect x="107" y="45" width="6" height="36" rx="2" fill="var(--lilac)" />
                  <ellipse className={`transition-all duration-[1200ms] ease-out pointer-events-none ${blownFlames[1] ? "opacity-40 -translate-y-8 scale-150" : "opacity-0"}`} cx="110" cy="35" rx="4" ry="8" fill="white" />
                  <path className={`flame transition-all duration-500 ease-out ${blownFlames[1] ? "opacity-0 scale-0 pointer-events-none" : ""}`} d="M110 30 C 106 36, 106 42, 110 45 C 114 42, 114 36, 110 30 Z" fill="#F0B857" />
                </g>
                <g>
                  <rect x="139" y="55" width="6" height="26" rx="2" fill="var(--sage)" />
                  <ellipse className={`transition-all duration-[1200ms] ease-out pointer-events-none ${blownFlames[2] ? "opacity-40 -translate-y-8 scale-150" : "opacity-0"}`} cx="142" cy="45" rx="4" ry="8" fill="white" />
                  <path className={`flame transition-all duration-500 ease-out ${blownFlames[2] ? "opacity-0 scale-0 pointer-events-none" : ""}`} d="M142 40 C 138 46, 138 52, 142 55 C 146 52, 146 46, 142 40 Z" fill="#F0B857" />
                </g>
              </svg>
            </motion.div>

            <motion.button
              {...reveal}
              disabled={wished}
              onClick={handleMakeWish}
              className="font-display font-semibold tracking-wide text-sm md:text-base rounded-full px-8 py-4 shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-default text-[#241528]"
              style={{ background: "linear-gradient(to bottom, var(--gold), #B9822C)" }}
            >
              Make a wish
            </motion.button>

            <AnimatePresence>
              {wished && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-hand text-2xl mt-6 h-8" style={{ color: "var(--gold)" }}>
                  May all your wishes come true, {partnerName}!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* GALLERY */}
        {images && images.length > 0 && (
          <section className="relative px-6 py-24 md:py-32" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="max-w-4xl mx-auto text-center">
              <motion.p {...reveal} className="eyebrow mb-3">Captured moments</motion.p>
              <motion.h2 {...reveal} className="font-display font-semibold text-3xl md:text-4xl mb-12 tracking-tight">Our memory scrapbook</motion.h2>

              <motion.div {...revealScale} className={`grid gap-8 ${
                images.length === 1 ? "grid-cols-1 max-w-md mx-auto"
                : images.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                : images.length === 3 ? "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto"
                : "grid-cols-2 md:grid-cols-4"
              }`}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="bday-card relative group p-3 rounded-lg shadow-md transition-all duration-300 hover:scale-[1.03]"
                    style={{ transform: `rotate(${(idx % 2 === 0 ? -1.2 : 1.2)}deg)` }}
                  >
                    <div className="aspect-square rounded overflow-hidden relative">
                      <img src={img} alt={`Memory ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="font-hand text-xl" style={{ color: "var(--ink-soft)" }}>Moment #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* REPLY CTA */}
        <section className="relative px-6 py-20 text-center" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="max-w-md mx-auto space-y-6">
            <motion.div {...reveal} className="space-y-3">
              <h3 className="font-display font-semibold text-2xl tracking-tight">Send a reply to {yourName || "someone special"}?</h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Let them know you loved the birthday surprise.</p>
            </motion.div>

            <motion.div {...reveal} className="pt-2">
              <button
                onClick={handleReplyClick}
                className="px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer text-[#241528]"
                style={{ background: "linear-gradient(to bottom, var(--gold), #B9822C)" }}
              >
                Return thank you message
              </button>
            </motion.div>

            <motion.div {...reveal} className="pt-4">
              <a href="/create" className="inline-block eyebrow border-b pb-0.5 transition-colors" style={{ borderColor: "var(--gold)", color: "var(--ink-soft)" }}>
                Create your own birthday scrapbook
              </a>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative px-6 py-16 text-center" style={{ borderTop: "1px solid var(--line)" }}>
          <motion.p {...reveal} className="font-hand text-3xl mb-2">Happy Birthday, {partnerName || "Zara"}!</motion.p>
          <motion.p {...reveal} className="eyebrow" style={{ color: "var(--ink-soft)" }}>Made with love, just for you</motion.p>
        </footer>
      </div>

      <BackgroundMusic category="birthday" enabled={musicEnabled && !hideMusicPlayer} selectedMusic={selectedMusic} />
    </div>
  );
}