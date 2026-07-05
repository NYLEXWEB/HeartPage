"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BackgroundMusic from "@/components/BackgroundMusic";

interface WeddingTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate: string; // Used as wedding date
  message: string;
  images: string[];
  theme: "light" | "dark";
  customFields?: { label: string; value: string }[];
  groomPhoto?: string;
  bridePhoto?: string;
  isPreview?: boolean;
  musicEnabled?: boolean;
  hideMusicPlayer?: boolean;
  selectedMusic?: string;
}

export default function WeddingTemplate({
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  theme,
  customFields = [],
  groomPhoto,
  bridePhoto,
  isPreview = false,
  musicEnabled = true,
  hideMusicPlayer = false,
  selectedMusic,
}: WeddingTemplateProps) {
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
  const [threadY, setThreadY] = useState(0);

  // Dynamically load Google Fonts on mount to avoid re-renders reloading the fonts and causing page flickering/layout shifts
  useEffect(() => {
    const linkId = "google-fonts-wedding-v2";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Work+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Petit+Formal+Script&display=swap";
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

      setParallaxY(progress * 50);
      setParallaxScale(1 - progress * 0.05);
      setParallaxOpacity(1 - progress * 0.75);
      setThreadY(progress * -30);
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

  // Safe date formatting — "12 Dec 2026"
  const safeDate = relationshipDate ? new Date(relationshipDate) : new Date();
  const formattedDate = isNaN(safeDate.getTime())
    ? "12 December 2026"
    : safeDate.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });

  const dateDetails = useMemo(() => {
    if (!relationshipDate) return null;
    const d = new Date(relationshipDate);
    if (isNaN(d.getTime())) return null;
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const day = d.toLocaleDateString("en-US", { day: "numeric" });
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.toLocaleDateString("en-US", { year: "numeric" });
    return { dayName, day, month, year };
  }, [relationshipDate]);

  // Motion Reveal Presets
  const reveal = {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  const revealScale = {
    initial: { opacity: 0, scale: 0.94 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  return (
    <div
      id="wedding-website-root"
      className={`antialiased relative select-none w-full min-h-screen bg-[var(--paper)] text-[var(--ink)] font-body overflow-x-hidden ${isDark ? "dark" : ""}`}
    >
      {/* Custom Styles Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --ink:        ${isDark ? "#f3ece1" : "#241f1a"};
          --plum:       #2f1f34;
          --plum-2:     #3d2a44;
          --paper:      ${isDark ? "#241a26" : "#f7f2e9"};
          --paper-2:    ${isDark ? "#1c1420" : "#efe6d3"};
          --brass:      #ad8a52;
          --brass-soft: #d3b581;
          --rose:       #cf9d92;
        }

        #wedding-website-root {
          background-color: var(--paper) !important;
          color: var(--ink) !important;
        }

        .font-display { font-family: 'Fraunces', serif; }
        .font-script  { font-family: 'Petit Formal Script', cursive; }
        .font-body    { font-family: 'Work Sans', sans-serif; }
        .font-mono    { font-family: 'Space Mono', monospace; }

        .bg-plum-deep {
          background: linear-gradient(160deg, var(--plum) 0%, var(--plum-2) 55%, #241a28 100%);
        }

        .brass-line {
          background: linear-gradient(90deg, transparent, var(--brass) 50%, transparent);
          height: 1px;
        }

        .grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .thread-draw path {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: draw-thread 2.6s cubic-bezier(.22,.61,.36,1) forwards;
        }
        .thread-draw path:nth-child(2) { animation-delay: .15s; }

        @keyframes draw-thread {
          to { stroke-dashoffset: 0; }
        }

        .num-underline {
          position: relative;
        }
        .num-underline::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -10px;
          transform: translateX(-50%);
          width: 22px;
          height: 2px;
          background: var(--brass);
        }

        .wedding-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url("/wedding%20hero%20section.png");
          background-size: cover;
          background-position: center;
          opacity: 0.85;
          z-index: 0;
          pointer-events: none;
        }
        .wedding-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(36, 26, 40, 0.55) 0%, rgba(24, 15, 28, 0.8) 100%);
        }
        @media (max-width: 768px) {
          .wedding-hero-bg {
            background-image: url("/wedding%20hero%20section%20mobile.png");
          }
        }

        .wedding-text-shadow {
          text-shadow: 0 2px 14px rgba(24, 15, 28, 0.75), 0 1px 2px rgba(24, 15, 28, 0.5);
        }
      `,
        }}
      />

      {/* Scroll progress indicator */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-[var(--brass)] z-50 transition-[width] duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative min-h-screen bg-plum-deep text-[#f3ece1] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <div className="grain" />
        <div className="wedding-hero-bg" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-4xl">
          <motion.p
            {...reveal}
            className="font-mono tracking-[0.3em] text-[10px] md:text-[11px] text-[var(--rose)] uppercase mb-10 wedding-text-shadow"
          >
            Together with their families
          </motion.p>

          {/* Two threads becoming one — signature motif */}
          <motion.div
            {...revealScale}
            className="relative w-[240px] md:w-[340px] h-[90px] md:h-[120px] mb-10"
            style={{
              transform: `translateY(${parallaxY}px) scale(${parallaxScale})`,
              opacity: parallaxOpacity,
            }}
          >
            <svg viewBox="0 0 340 120" className="thread-draw w-full h-full" fill="none">
              <path
                d="M10 20 C 120 20, 150 60, 170 60 S 220 100, 330 100"
                stroke="var(--brass-soft)"
                strokeWidth="1.4"
              />
              <path
                d="M10 100 C 120 100, 150 60, 170 60 S 220 20, 330 20"
                stroke="var(--brass)"
                strokeWidth="1.4"
              />
              <circle cx="170" cy="60" r="3" fill="var(--brass-soft)" />
            </svg>
          </motion.div>

          <motion.h1 {...reveal} className="font-display font-normal text-5xl md:text-8xl leading-[0.95] text-[#f3ece1] text-center wedding-text-shadow">
            {yourName || "Groom"}
          </motion.h1>
          <motion.div {...reveal} className="font-script text-3xl md:text-4xl text-[var(--brass-soft)] my-2 wedding-text-shadow">
            and
          </motion.div>
          <motion.h1 {...reveal} className="font-display font-normal text-5xl md:text-8xl leading-[0.95] text-[#f3ece1] mb-10 text-center wedding-text-shadow">
            {partnerName || "Bride"}
          </motion.h1>

          <motion.div {...reveal} className="w-16 brass-line mb-8" />

          <motion.p {...reveal} className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--rose)] wedding-text-shadow">
            {formattedDate}
          </motion.p>
        </div>

        <a href="#message-section" className="absolute bottom-10 flex flex-col items-center gap-2 text-[#f3ece1]/60 group z-10">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase">Scroll</span>
          <span className="w-px h-10 bg-[var(--brass)]/50 group-hover:h-14 transition-all duration-500" />
        </a>
      </section>

      {/* ============================================================ */}
      {/* BRIDE & GROOM PHOTOS SECTION — arched diptych */}
      {/* ============================================================ */}
      {(groomPhoto || bridePhoto) && (() => {
        const groomInitial = yourName ? yourName.charAt(0).toUpperCase() : "G";
        const brideInitial = partnerName ? partnerName.charAt(0).toUpperCase() : "B";

        return (
          <section className="relative py-24 md:py-36 bg-[var(--paper)] border-b border-[var(--brass)]/20 overflow-hidden">
            <motion.div {...reveal} className="text-center mb-20 px-6">
              <span className="font-mono tracking-[0.3em] text-[10px] uppercase text-[var(--brass)] block mb-3">
                Introducing
              </span>
              <h2 className="font-display italic text-4xl md:text-6xl">the two of us</h2>
            </motion.div>

            <div className="max-w-5xl mx-auto px-6 relative">
              {/* Center Crest Emblem (Only when both photos are present and on large screens) */}
              {groomPhoto && bridePhoto && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full border border-dashed border-[var(--brass)]/60 animate-[spin_30s_linear_infinite]" />
                    <div className="w-18 h-18 rounded-full bg-[var(--paper)] border-2 border-[var(--brass)] flex flex-col items-center justify-center shadow-xl">
                      <span className="font-script text-[10px] text-[var(--brass)] leading-none">Vows</span>
                      <span className="font-display text-base font-semibold tracking-wider text-[var(--brass)] mt-1">
                        {groomInitial}&amp;{brideInitial}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 ${groomPhoto && bridePhoto ? "md:grid-cols-2 gap-12 lg:gap-16 pb-16 lg:pb-24" : "max-w-md mx-auto"}`}>
                {/* GROOM PORTRAIT */}
                {groomPhoto && (
                  <motion.div {...revealScale} className="relative w-full">
                    <div className="relative p-3 border border-[var(--brass)]/30 rounded-t-full bg-[var(--paper-2)]/40 shadow-xl max-w-[320px] w-full mx-auto">
                      <div className="border border-[var(--brass)]/20 rounded-t-full p-2">
                        <div className="aspect-[3/4.5] overflow-hidden rounded-t-full relative shadow-inner">
                          <img
                            src={groomPhoto}
                            alt={yourName || "Groom"}
                            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out select-none"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                      <div className="pt-6 pb-3 text-center">
                        <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--rose)] block mb-1">
                          The Groom
                        </span>
                        <h3 className="font-display text-3xl text-[var(--ink)] tracking-tight">{yourName || "Groom"}</h3>
                        <p className="font-script text-lg text-[var(--brass)] mt-1">the steady anchor</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* BRIDE PORTRAIT */}
                {bridePhoto && (
                  <motion.div {...revealScale} className="relative w-full">
                    <div className="relative p-3 border border-[var(--brass)]/30 rounded-t-full bg-[var(--paper-2)]/40 shadow-xl max-w-[320px] w-full mx-auto lg:translate-y-16">
                      <div className="border border-[var(--brass)]/20 rounded-t-full p-2">
                        <div className="aspect-[3/4.5] overflow-hidden rounded-t-full relative shadow-inner">
                          <img
                            src={bridePhoto}
                            alt={partnerName || "Bride"}
                            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out select-none"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                      <div className="pt-6 pb-3 text-center">
                        <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--rose)] block mb-1">
                          The Bride
                        </span>
                        <h3 className="font-display text-3xl text-[var(--ink)] tracking-tight">{partnerName || "Bride"}</h3>
                        <p className="font-script text-lg text-[var(--brass)] mt-1">the guiding light</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ============================================================ */}
      {/* SAVE THE DATE & WELCOME SECTION */}
      {/* ============================================================ */}
      {dateDetails && (
        <section className="relative px-6 py-20 md:py-28 bg-[var(--paper-2)] border-b border-[var(--brass)]/20 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div {...reveal} className="mb-8">
              <span className="font-mono tracking-[0.4em] text-[10px] text-[var(--brass)] uppercase block mb-2">
                Join Us In Celebration
              </span>
              <h2 className="font-display italic text-4xl md:text-5xl text-[var(--ink)]">
                Save the Date
              </h2>
            </motion.div>

            {/* Editorial Date Highlight Grid */}
            <motion.div
              {...revealScale}
              className="max-w-2xl mx-auto border-t border-b border-[var(--brass)]/30 py-8 my-10 grid grid-cols-3 items-center justify-center gap-4 text-[var(--ink)]"
            >
              <div className="text-right pr-4 md:pr-8 border-r border-[var(--brass)]/20">
                <span className="font-mono text-xs md:text-sm tracking-widest uppercase block text-[var(--rose)]">
                  {dateDetails.dayName}
                </span>
              
              </div>
              <div className="flex flex-col items-center justify-center px-2">
                <span className="font-display font-light text-5xl md:text-7xl leading-none tracking-tight text-[var(--brass)]">
                  {dateDetails.day}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink)]/70 mt-1">
                  {dateDetails.month}
                </span>
              </div>
              <div className="text-left pl-4 md:pl-8 border-l border-[var(--brass)]/20">
                <span className="font-display font-medium text-lg md:text-xl tracking-wider text-[var(--brass)] block">
                  {dateDetails.year}
                </span>
                <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--rose)]">
                  matrimony
                </span>
              </div>
            </motion.div>

            {/* Warm Welcome text block */}
            <motion.div {...reveal} className="max-w-xl mx-auto space-y-4">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--rose)]">
                A Warm Welcome to Everyone
              </p>
              <h3 className="font-display text-2xl md:text-3xl text-[var(--ink)]">
                We are overjoyed to welcome you
              </h3>
              <p className="font-body text-sm md:text-base leading-relaxed text-[var(--ink)]/70">
                As we pledge our hearts and begin our journey of a lifetime, your presence, blessing, and love are what we treasure most. Welcome to our wedding celebration page—we look forward to celebrating with you!
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* INVITATION MESSAGE */}
      {/* ============================================================ */}
      <section id="message-section" className="relative px-6 py-28 md:py-36 bg-[var(--paper)]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...reveal} className="flex items-center justify-center gap-3 mb-10">
            <span className="w-10 brass-line" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[var(--brass)]" />
            <span className="w-10 brass-line" />
          </motion.div>

          <motion.p
            {...reveal}
            className="font-display italic text-2xl md:text-4xl leading-relaxed text-[var(--ink)] whitespace-pre-line"
          >
            {message ||
              "Two souls, one heart, one beautiful beginning. With hearts full of joy, we invite you to witness our vows and celebrate the start of forever, surrounded by the people we love most."}
          </motion.p>

          <motion.div {...reveal} className="flex items-center justify-center gap-3 mt-10">
            <span className="w-10 brass-line" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[var(--brass)]" />
            <span className="w-10 brass-line" />
          </motion.div>

          {/* Dynamic Custom Fields */}
          {customFields && customFields.length > 0 && (
            <div className="mt-16 max-w-lg mx-auto divide-y divide-[var(--brass)]/20 border-t border-b border-[var(--brass)]/20">
              {customFields.map((field, idx) => {
                const link = getLinkUrl(field.value);
                return (
                  <motion.div key={idx} {...reveal} className="py-6 text-center">
                    <h4 className="font-mono tracking-[0.2em] text-[10px] text-[var(--brass)] uppercase mb-2">
                      {field.label}
                    </h4>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-display italic text-lg text-[var(--ink)] hover:text-[var(--brass)] underline underline-offset-4 decoration-[var(--brass)]/50 hover:decoration-[var(--brass)] transition-all duration-300 break-all"
                      >
                        {field.value.length > 35 ? "Click here to view details" : field.value} ↗
                      </a>
                    ) : (
                      <p className="font-body text-base md:text-lg text-[var(--ink)]/85 leading-relaxed whitespace-pre-line">
                        {field.value}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* COUNTDOWN — flat editorial */}
      {/* ============================================================ */}
      <section className="relative px-6 py-28 md:py-36 bg-plum-deep text-[#f3ece1] overflow-hidden">
        <div className="grain" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p {...reveal} className="font-mono tracking-[0.3em] text-[10px] text-[var(--rose)] uppercase mb-4">
            The Countdown Begins
          </motion.p>
          <motion.h2 {...reveal} className="font-display italic text-3xl md:text-5xl mb-16">
            until we say “I do”
          </motion.h2>

          <motion.div {...revealScale} className="grid grid-cols-4 max-w-2xl mx-auto">
            {[
              { v: countdown.days, l: "Days" },
              { v: countdown.hours, l: "Hours" },
              { v: countdown.minutes, l: "Minutes" },
              { v: countdown.seconds, l: "Seconds" },
            ].map((item, i) => (
              <div key={i} className="px-2 md:px-4 border-t-2 border-[var(--brass)] pt-6">
                <div className="font-mono font-bold text-3xl md:text-6xl tracking-tight">{item.v}</div>
                <div className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-3 text-[#f3ece1]/60">
                  {item.l}
                </div>
              </div>
            ))}
          </motion.div>

          {isWeddingDay && (
            <motion.p {...reveal} className="font-display italic text-lg text-[#f3ece1]/85 mt-14">
              {yourName} &amp; {partnerName} are married! 🤍
            </motion.p>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* COUPLE NAMES DETAIL */}
      {/* ============================================================ */}
      <section className="relative px-6 py-28 md:py-36 bg-[var(--paper)]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 md:gap-8 text-center">
          <motion.div {...reveal}>
            <p className="font-mono tracking-[0.3em] text-[10px] text-[var(--brass)] uppercase mb-4 num-underline inline-block pb-2">
              The Host
            </p>
            <h3 className="font-display font-medium text-3xl md:text-4xl mb-4 mt-4 text-[var(--ink)]">
              {yourName || "Bride"}
            </h3>
            <p className="font-body text-sm leading-relaxed max-w-sm mx-auto text-[var(--ink)]/65">
              Beloved family &amp; friends of {yourName || "Bride"}
            </p>
          </motion.div>

          <motion.div {...reveal}>
            <p className="font-mono tracking-[0.3em] text-[10px] text-[var(--brass)] uppercase mb-4 num-underline inline-block pb-2">
              The Partner
            </p>
            <h3 className="font-display font-medium text-3xl md:text-4xl mb-4 mt-4 text-[var(--ink)]">
              {partnerName || "Groom"}
            </h3>
            <p className="font-body text-sm leading-relaxed max-w-sm mx-auto text-[var(--ink)]/65">
              Beloved family &amp; friends of {partnerName || "Groom"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MEMORY GALLERY (OPTIONAL) — mixed-ratio editorial grid */}
      {/* ============================================================ */}
      {images && images.length > 0 && (
        <section className="relative px-6 py-28 md:py-36 bg-[var(--paper-2)] border-t border-[var(--brass)]/20">
          <div className="max-w-6xl mx-auto text-center">
            <motion.p {...reveal} className="font-mono tracking-[0.3em] text-[10px] text-[var(--brass)] uppercase mb-4">
              Captured Moments
            </motion.p>
            <motion.h2 {...reveal} className="font-display italic text-3xl md:text-5xl mb-16 text-[var(--ink)]">
              our gallery
            </motion.h2>

            <motion.div
              {...revealScale}
              className={`grid gap-3 md:gap-4 ${
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
                  className={`relative group overflow-hidden bg-[var(--paper)] ${
                    idx % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                  } transition-transform duration-500 hover:scale-[1.015]`}
                >
                  <img
                    src={img}
                    alt={`Moment ${idx + 1}`}
                    className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--plum)]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="font-mono text-[#f3ece1] text-[10px] tracking-[0.2em] uppercase">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
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
      <section className="relative px-6 py-24 bg-plum-deep text-center overflow-hidden">
        <div className="grain" />
        <div className="max-w-md mx-auto space-y-7 relative z-10">
          <motion.div {...reveal} className="space-y-4">
            <h3 className="font-display italic text-2xl md:text-3xl text-[#f3ece1]">Are you joining us?</h3>
            <p className="font-body text-sm text-[#f3ece1]/65 tracking-wide">
              Please let us know if you can attend our wedding celebration.
            </p>
          </motion.div>

          <motion.div {...reveal} className="pt-1">
            <button
              onClick={handleReplyClick}
              className="px-9 py-3.5 border border-[var(--brass)] text-[#f3ece1] rounded-none text-xs font-mono font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[var(--brass)] hover:text-[var(--plum)] cursor-pointer"
            >
              Send Congratulations / RSVP
            </button>
          </motion.div>

          <motion.div {...reveal} className="pt-3">
            <a
              href="/create"
              className="inline-block font-mono text-[10px] tracking-[0.2em] uppercase border-b border-[var(--brass)]/60 pb-0.5 text-[var(--rose)] hover:text-[var(--brass-soft)] transition-colors"
            >
              Create Your Own Invitation ✨
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="relative px-6 py-20 bg-[var(--ink)] text-[#f3ece1] text-center overflow-hidden">
        <motion.div {...revealScale} className="w-16 h-6 mx-auto mb-6 relative" style={{ transform: `translateY(${threadY}px)` }}>
          <svg viewBox="0 0 64 24" className="w-full h-full" fill="none">
            <path d="M4 4 C 24 4, 30 20, 32 20 S 40 4, 60 4" stroke="var(--brass)" strokeWidth="1.2" />
          </svg>
        </motion.div>
        <motion.p {...reveal} className="font-display text-3xl text-[#f3ece1] mb-2">
          {yourName || "Bride"} &amp; {partnerName || "Groom"}
        </motion.p>
        <motion.p {...reveal} className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#f3ece1]/45">
          With love and gratitude
        </motion.p>
      </footer>
      <BackgroundMusic category="wedding" enabled={musicEnabled && !hideMusicPlayer} selectedMusic={selectedMusic} />
    </div>
  );
}