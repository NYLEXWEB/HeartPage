"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Compass, Volume2, VolumeX, Award, Smile, Mail, PenLine } from "lucide-react";
import confetti from "canvas-confetti";

interface FriendTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  theme: "light" | "dark";
  customFields?: { label: string; value: string }[];
  isPreview?: boolean;
  isFullPreview?: boolean;
  musicEnabled?: boolean;
  hideMusicPlayer?: boolean;
  selectedMusic?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function FriendTemplate({
  yourName = "Sam",
  partnerName = "Taylor",
  relationshipDate = "2020-09-15",
  message = "You are the cheese to my macaroni, the partner in crime for all my terrible ideas. Thanks for always being there!",
  images = [],
  theme = "light",
  customFields = [],
  isPreview = false,
  musicEnabled = true,
  hideMusicPlayer = false,
  isFullPreview = false,
  selectedMusic,
}: FriendTemplateProps) {
  const getLinkUrl = (val: string) => {
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    if (val.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/)) return `https://${val}`;
    return null;
  };

  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [friendTime, setFriendTime] = useState({
    years: "00", months: "00", days: "00", hours: "00", minutes: "00", seconds: "00",
  });
  const [nextAnniversary, setNextAnniversary] = useState({
    days: "000", hours: "00", minutes: "00", seconds: "00",
  });

  const startDate = useMemo(() => {
    let parsedDate = new Date("2020-09-15T00:00:00");
    if (relationshipDate) {
      const d = new Date(relationshipDate);
      if (!isNaN(d.getTime())) {
        if (!relationshipDate.includes("T")) d.setHours(0, 0, 0, 0);
        parsedDate = d;
      }
    }
    return parsedDate;
  }, [relationshipDate]);

  const initials = `${yourName ? yourName.charAt(0).toUpperCase() : "S"}&${partnerName ? partnerName.charAt(0).toUpperCase() : "T"}`;

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

  // Live friendship counter + next-anniversary countdown (functional, not a scroll effect)
  useEffect(() => {
    const updateCounters = () => {
      const now = new Date();
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();
      let hours = now.getHours() - startDate.getHours();
      let minutes = now.getMinutes() - startDate.getMinutes();
      let seconds = now.getSeconds() - startDate.getSeconds();

      if (seconds < 0) { minutes--; seconds += 60; }
      if (minutes < 0) { hours--; minutes += 60; }
      if (hours < 0) { days--; hours += 24; }
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) { years--; months += 12; }

      setFriendTime({
        years: String(Math.max(0, years)).padStart(2, "0"),
        months: String(Math.max(0, months)).padStart(2, "0"),
        days: String(Math.max(0, days)).padStart(2, "0"),
        hours: String(Math.max(0, hours)).padStart(2, "0"),
        minutes: String(Math.max(0, minutes)).padStart(2, "0"),
        seconds: String(Math.max(0, seconds)).padStart(2, "0"),
      });

      let targetYear = now.getFullYear();
      const annMonth = startDate.getMonth();
      const annDay = startDate.getDate();
      let annDate = new Date(targetYear, annMonth, annDay, 0, 0, 0);
      if (now > annDate) {
        targetYear++;
        annDate = new Date(targetYear, annMonth, annDay, 0, 0, 0);
      }
      const diff = annDate.getTime() - now.getTime();
      setNextAnniversary({
        days: String(Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))).padStart(3, "0"),
        hours: String(Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24))).padStart(2, "0"),
        minutes: String(Math.max(0, Math.floor((diff / (1000 * 60)) % 60))).padStart(2, "0"),
        seconds: String(Math.max(0, Math.floor((diff / 1000) % 60))).padStart(2, "0"),
      });
    };

    updateCounters();
    const interval = setInterval(updateCounters, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // Autoplay ambient audio on first interaction
  useEffect(() => {
    if (!musicEnabled || hideMusicPlayer) return;
    let hasInteracted = false;
    const handleInteraction = () => {
      const audio = audioRef.current;
      if (!hasInteracted && audio) {
        audio.play().then(() => { setIsPlaying(true); hasInteracted = true; }).catch(() => {});
      }
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [musicEnabled, hideMusicPlayer]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.load();
      if (isPlaying) audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMusic]);

  const handleBadgeCelebration = () => {
    confetti({
      particleCount: 140,
      spread: 72,
      origin: { y: 0.6 },
      colors: ["#2F6F62", "#E5A13E", "#E2604F", "#182620"],
    });
  };

  return (
    <div
      id="friend-website-root"
      className={`min-h-screen w-full relative overflow-x-hidden font-poppins selection:bg-[#2F6F62]/20 ${theme === "dark" ? "dark" : ""}`}
    >
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div key={p.id} className="fw-particle" style={p.style} />
        ))}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
:root {
  --paper: ${theme === "dark" ? "#0C0A0B" : "#F4EFE7"};
  --paper-raised: ${theme === "dark" ? "#181415" : "#FFFCF7"};

  --ink: ${theme === "dark" ? "#FFFFFF" : "#241719"};
  --ink-soft: ${theme === "dark" ? "#A5999A" : "#756568"};

  --line: ${theme === "dark"
    ? "rgba(229,161,62,0.16)"
    : "rgba(104,31,43,0.14)"};

  --teal: ${theme === "dark" ? "#E5A13E" : "#681F2B"};

  --teal-soft: ${theme === "dark"
    ? "rgba(229,161,62,0.12)"
    : "#F1E2E3"};

  --marigold: #B8924A;
  --coral: #D6B36A;
}
        #friend-website-root { background-color: var(--paper); color: var(--ink); }
        .fw-card {
          background: var(--paper-raised);
          border: 1px solid var(--line);
        }
        .fw-eyebrow {
          font-family: ui-monospace, "Space Mono", monospace;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--teal);
          font-size: 0.7rem;
        }
        .fw-rule { height: 1px; background: var(--line); }
        .fw-hover { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, border-color 0.35s ease; }
        .fw-hover:hover { transform: translateY(-4px); border-color: var(--teal); box-shadow: 0 18px 40px -20px rgba(24,38,32,0.25); }

        /* Certificate signature element */
        .fw-certificate {
          position: relative;
          background: var(--paper-raised);
          border: 1px solid var(--line);
          border-radius: 4px;
          box-shadow: 0 30px 60px -30px rgba(24,38,32,0.35);
        }
        .fw-certificate::before, .fw-certificate::after {
          content: "";
          position: absolute;
          left: 0; right: 0;
          height: 14px;
          background-image: radial-gradient(circle at 12px 50%, var(--paper) 6px, transparent 6.5px);
          background-size: 24px 14px;
          background-repeat: repeat-x;
        }
        .fw-certificate::before { top: -7px; }
        .fw-certificate::after { bottom: -7px; transform: rotate(180deg); }
        .fw-seal {
          filter: drop-shadow(0 8px 16px rgba(24,38,32,0.2));
        }

        /* Envelope */
        .fw-envelope-wrapper {
          position: relative; width: 320px; max-width: 88vw; height: 220px;
          cursor: pointer; perspective: 1000px;
        }
        .fw-envelope { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
        .fw-envelope-front {
          position: absolute; width: 0; height: 0;
          border-left: 160px solid transparent; border-right: 160px solid transparent;
          border-bottom: 110px solid var(--paper-raised);
          bottom: 0; left: 0; transform: translateZ(3px);
        }
        .fw-envelope-sides {
          position: absolute; width: 0; height: 0;
          border-top: 110px solid transparent; border-bottom: 110px solid transparent;
          border-left: 160px solid var(--paper); top: 0; left: 0; transform: translateZ(2px);
        }
        .fw-envelope-sides-right {
          position: absolute; width: 0; height: 0;
          border-top: 110px solid transparent; border-bottom: 110px solid transparent;
          border-right: 160px solid var(--paper); top: 0; right: 0; transform: translateZ(2px);
        }
        .fw-envelope-flap {
          position: absolute; width: 0; height: 0;
          border-left: 160px solid transparent; border-right: 160px solid transparent;
          border-top: 110px solid var(--teal);
          top: 0; left: 0; transform-origin: top;
          transform: translateZ(4px) rotateX(0deg);
          transition: transform 0.45s ease;
        }
        .fw-envelope-wrapper.open .fw-envelope-flap { transform: translateZ(0px) rotateX(180deg); }
        .fw-letter-paper {
          position: absolute; width: 290px; max-width: 82vw; height: 185px;
          background: #ffffff !important;
          left: 15px; bottom: 10px; padding: 22px; box-sizing: border-box;
          overflow: hidden; border: 1px solid var(--line);
          transform: translateZ(1px);
          transition: transform 0.4s ease 0s, height 0.4s ease 0s;
        }
        .fw-envelope-wrapper.open .fw-letter-paper {
          transform: translateZ(5px) translateY(-135px) scale(1.04);
          height: 250px;
          box-shadow: 0 20px 45px -15px rgba(24,38,32,0.3);
          transition: transform 0.4s ease 0.28s, height 0.4s ease 0.28s;
        }

        .fw-vinyl { animation: fw-spin 12s linear infinite; }
        @keyframes fw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @keyframes fw-float-particle {
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
        .fw-particle {
          position: absolute;
          border-radius: 50%;
          background: var(--teal);
          pointer-events: none;
          animation: fw-float-particle var(--duration, 20s) linear infinite;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .fw-vinyl { animation: none; }
          .fw-particle { display: none; }
        }
      `}} />

      {isPreview && (
        <div className={`sticky ${isFullPreview ? "top-16" : "top-0"} z-[10000] w-full bg-[#2F6F62] text-white text-center py-1.5 text-xs font-semibold uppercase tracking-widest`}>
          Live Preview Mode
        </div>
      )}

      {/* HERO */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-center items-center px-4 py-24">
        {/* Responsive Background Images */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Desktop Image */}
          <img 
            src="/friends%20hero%20section.png" 
            alt="Hero Background Desktop" 
            className="hidden md:block w-full h-full object-cover opacity-75" 
            loading="eager"
            decoding="async"
          />
          {/* Mobile Image */}
          <img 
            src="/friends%20hero%20section%20mobile.png" 
            alt="Hero Background Mobile" 
            className="block md:hidden w-full h-full object-cover opacity-75" 
            loading="eager"
            decoding="async"
          />
          {/* Subtle gradient overlay to ensure text readability and fade into the page background color */}
          <div 
            className="absolute inset-0" 
            style={{
              background: `linear-gradient(to bottom, transparent 40%, var(--paper) 95%)`
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 text-center max-w-3xl flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="w-16 h-16 rounded-full border border-[var(--line)] fw-card flex items-center justify-center mb-8">
            <span className="text-xl font-semibold tracking-widest" style={{ color: "var(--teal)" }}>{initials}</span>
          </motion.div>

          <motion.span variants={fadeUp} className="fw-eyebrow mb-4 block">Certified Best Friends</motion.span>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight leading-[1.05]">
            {yourName} <span style={{ color: "var(--teal)" }}>&amp;</span> {partnerName}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl italic max-w-xl mb-10 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            "{message || "Real friendship is when you walk into their house and your WiFi connects automatically."}"
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="#friend-certificate"
            className={`px-8 py-3.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 mb-16 border-none ${
              theme === "dark" ? "text-slate-900 font-bold" : "text-white"
            }`}
            style={{ backgroundColor: "var(--teal)" }}
          >
            See the certificate
          </motion.a>

          <motion.div variants={fadeUp} className="fw-card fw-hover rounded-2xl p-6 md:p-8 w-full max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x" style={{ borderColor: "var(--line)" }}>
              <div className="px-4 text-center">
                <h3 className="fw-eyebrow mb-2">Besties since</h3>
                <p className="text-lg font-medium">{startDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <div className="px-4 text-center py-4 md:py-0" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
                <h3 className="fw-eyebrow mb-2">Shenanigans logged</h3>
                <p className="text-lg font-medium">Infinite</p>
              </div>
              <div className="px-4 text-center">
                <h3 className="fw-eyebrow mb-2">Anniversary</h3>
                <p className="text-lg font-medium">{startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SIGNATURE ELEMENT — FRIENDSHIP CERTIFICATE (replaces the old pinned scroll sequence) */}
      <section id="friend-certificate" className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="fw-eyebrow mb-2 block">Official Documentation</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">The Certificate</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fw-certificate max-w-xl mx-auto p-10 md:p-14 relative"
        >
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 120 120" width="72" height="72" className="fw-seal">
              <circle cx="60" cy="60" r="54" fill="var(--teal)" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--marigold)" strokeWidth="2" strokeDasharray="4 5" />
              <text x="60" y="66" textAnchor="middle" fontSize="26" fontWeight="700" fill={theme === "dark" ? "var(--paper)" : "white"}>{initials}</text>
            </svg>
          </div>

          <p className="fw-eyebrow text-center mb-3">Certificate No. BFF-{startDate.getFullYear()}</p>
          <h3 className="text-2xl md:text-3xl font-semibold text-center mb-6 leading-snug">
            This certifies that {yourName} &amp; {partnerName}<br />are officially, permanently besties.
          </h3>
          <div className="fw-rule w-16 mx-auto mb-6" />
          <p className="text-center italic" style={{ color: "var(--ink-soft)" }}>
            Issued on {startDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}, valid for life, non-transferable, and legally unbreakable.
          </p>
        </motion.div>
      </section>

      {/* LIVE COUNTERS */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="fw-eyebrow mb-2 block">Friendship Timeline</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Days of adventure</h2>
          </div>

          <div className="fw-card rounded-2xl p-6 md:p-10 mb-10">
            <p className="text-center italic mb-8" style={{ color: "var(--ink-soft)" }}>Counting our bestie adventures in real time</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              {[
                ["Years", friendTime.years],
                ["Months", friendTime.months],
                ["Days", friendTime.days],
                ["Hours", friendTime.hours],
                ["Minutes", friendTime.minutes],
                ["Seconds", friendTime.seconds],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl p-4 md:p-5" style={{ background: "var(--teal-soft)" }}>
                  <span className="block text-3xl md:text-5xl font-semibold mb-1" style={{ color: "var(--teal)" }}>{value}</span>
                  <span className="fw-eyebrow">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fw-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-1">Next Friendship Day</h3>
                <p className="italic" style={{ color: "var(--ink-soft)" }}>Until another milestone together</p>
              </div>
              <div className="flex gap-4 items-center">
                {[["Days", nextAnniversary.days], ["Hrs", nextAnniversary.hours], ["Min", nextAnniversary.minutes], ["Sec", nextAnniversary.seconds]].map(([label, value], i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <span style={{ color: "var(--teal)" }}>:</span>}
                    <div>
                      <span className="block text-2xl font-semibold" style={{ color: "var(--teal)" }}>{value}</span>
                      <span className="fw-eyebrow">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LETTER */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="text-center mb-14">
            <span className="fw-eyebrow mb-2 block">A Letter</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">From me to you</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center py-8 relative"
          >
            {!envelopeOpen && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30">
                <span className="text-xs text-white font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: "var(--teal)" }}>
                  Tap to open
                </span>
              </div>
            )}
            <div className={`fw-envelope-wrapper ${envelopeOpen ? "open" : ""}`} onClick={() => setEnvelopeOpen(!envelopeOpen)}>
              <div className="fw-envelope">
                <div className="fw-envelope-flap" />
                <div className="fw-envelope-front" />
                <div className="fw-envelope-sides" />
                <div className="fw-envelope-sides-right" />
                <div
                  className="fw-letter-paper italic flex flex-col justify-between"
                  onClick={(e) => { if (envelopeOpen) e.stopPropagation(); }}
                >
                  <div className="text-xs not-italic pb-2 mb-2 flex justify-between font-mono" style={{ borderBottom: "1px solid rgba(104,31,43,0.14)", color: "#681F2B" }}>
                    <span>To my partner in crime</span>
                    <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed line-clamp-6 md:line-clamp-none overflow-y-auto" style={{ color: "#241719" }}>
                    {message}
                  </p>
                  <div className="text-right text-xs not-italic pt-2 mt-2 font-mono" style={{ borderTop: "1px solid rgba(104,31,43,0.14)", color: "#681F2B" }}>
                    <span>Your favorite chaos, {yourName}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs font-mono tracking-widest uppercase mt-8 text-center" style={{ color: "var(--ink-soft)" }}>
              {envelopeOpen ? "Tap envelope to close" : "Tap envelope to read"}
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href={`/create?category=friends&yourName=${encodeURIComponent(partnerName)}&partnerName=${encodeURIComponent(yourName)}&relationshipDate=${encodeURIComponent(relationshipDate || "")}&isReply=true`}
                className={`px-6 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300 flex items-center gap-2 decoration-none ${
                  theme === "dark" ? "text-slate-900 font-bold" : "text-white"
                }`}
                style={{ backgroundColor: "var(--teal)" }}
              >
                <Mail className="w-3.5 h-3.5" />
                Send reply
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CUSTOM FIELDS */}
      {customFields && customFields.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-xl mx-auto text-center">
            <span className="fw-eyebrow mb-2 block">Useful details</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">Important information</h2>
            <div className="space-y-5">
              {customFields.map((field, idx) => {
                const link = getLinkUrl(field.value);
                return (
                  <div key={idx} className="fw-card fw-hover rounded-xl p-6 text-left">
                    <h4 className="fw-eyebrow mb-2">{field.label}</h4>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 italic text-lg underline underline-offset-4 break-all" style={{ color: "var(--teal)" }}>
                        {field.value.length > 35 ? "Click to view details" : field.value} ↗
                      </a>
                    ) : (
                      <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: "var(--ink-soft)" }}>{field.value}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* WHY YOU'RE LEGENDARY */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="fw-eyebrow mb-2 block">Memorable chapters</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Why you're legendary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Smile, title: "No filter needed", copy: "With you, I can be my absolute weirdest self — hours spent debating useless topics or laughing at jokes nobody else finds funny." },
              { icon: Compass, title: "The escape route", copy: "Every late-night drive, grocery run, or random cafe hang-out turns into a memorable chapter. Zero boredom when we're together." },
              { icon: Award, title: "Loyalty unlocked", copy: "No matter how chaotic things get, knowing I can call you at 3AM and hear your voice is the ultimate reassurance." },
            ].map(({ icon: Icon, title, copy }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="fw-card fw-hover rounded-2xl p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{title}</h3>
                  <p className="italic leading-relaxed" style={{ color: "var(--ink-soft)" }}>{copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {images && images.length > 0 && (
        <section className="py-20 md:py-28 px-4" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="fw-eyebrow mb-2 block">Captured moments</span>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Our gallery</h2>
            </div>
            <div className={`grid gap-5 ${images.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"}`}>
              {images.map((img, idx) => (
                <div key={idx} className="fw-card overflow-hidden rounded-2xl aspect-[4/5] relative group">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BADGE */}
      <section className="py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-xl mx-auto flex justify-center">
          <button
            onClick={handleBadgeCelebration}
            className="fw-card fw-hover px-10 py-10 rounded-full font-semibold text-xl md:text-2xl uppercase tracking-wider cursor-pointer flex flex-col items-center justify-center gap-2 border-none"
          >
            <PenLine className="w-8 h-8" style={{ color: "var(--marigold)" }} />
            <span style={{ color: "var(--ink-soft)" }}>Certified</span>
            <span style={{ color: "var(--teal)" }} className="text-2xl md:text-3xl">Besties</span>
            <span className="text-[10px] uppercase tracking-widest mt-1 text-white px-3 py-1 rounded-full border-none" style={{ backgroundColor: "var(--marigold)" }}>Tap to celebrate</span>
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xl tracking-widest" style={{ color: "var(--teal)" }}>{yourName ? yourName.charAt(0).toUpperCase() : "S"}</span>
            <Smile className="w-5 h-5" style={{ color: "var(--teal)" }} />
            <span className="text-xl tracking-widest" style={{ color: "var(--teal)" }}>{partnerName ? partnerName.charAt(0).toUpperCase() : "T"}</span>
          </div>
          <p className="italic text-base max-w-sm mx-auto" style={{ color: "var(--ink-soft)" }}>
            "A single loyal friend is worth more than ten thousand relatives."
          </p>
          <div className="my-6">
            <a href="/create" className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-wider uppercase transition-all duration-300 decoration-none" style={{ border: "1px solid var(--teal)", color: "var(--teal)" }}>
              Create your own page
            </a>
          </div>
          <div className="fw-rule w-12 mx-auto my-4" />
          <p className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "var(--ink-soft)" }}>
            Made with love • © 2026 {yourName} &amp; {partnerName}
          </p>
        </div>
      </footer>

      {/* AMBIENT AUDIO PLAYER */}
      {musicEnabled && !hideMusicPlayer && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 fw-card p-2.5 rounded-full shadow-lg">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden ${isPlaying ? "fw-vinyl" : ""}`} style={{ backgroundColor: "var(--ink)" }}>
            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--teal)" }} />
            </div>
          </div>
          <button onClick={toggleAudio} className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-none cursor-pointer" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
            {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <audio ref={audioRef} loop preload="auto">
            <source src={selectedMusic ? `/Website Music/${encodeURIComponent(selectedMusic)}` : "/Website Music/Besties.mp3"} type="audio/mpeg" />
          </audio>
        </div>
      )}
    </div>
  );
}
