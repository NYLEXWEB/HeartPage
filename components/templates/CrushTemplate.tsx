"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Send, ArrowRight, Play, VolumeX, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import BackgroundMusic from "@/components/BackgroundMusic";

interface CrushTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  theme: "light" | "dark";
  customFields?: { label: string; value: string }[];
  isPreview?: boolean;
  musicEnabled?: boolean;
  hideMusicPlayer?: boolean;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
}

export default function CrushTemplate({
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  theme,
  customFields = [],
  isPreview = false,
  musicEnabled = true,
  hideMusicPlayer = false,
}: CrushTemplateProps) {
  const router = useRouter();

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
  
  // Navigation & States
  const [stage, setStage] = useState<"envelope" | "suspense" | "proposal" | "accepted">("envelope");
  const [suspenseIndex, setSuspenseIndex] = useState(0);
  const [hasPrompterBeenClicked, setHasPrompterBeenClicked] = useState(false);
  const [noBtnOffset, setNoBtnOffset] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);
  const [speechBubble, setSpeechBubble] = useState("");
  
  // Custom click particles state
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(true);

  const isDark = theme === "dark";

  // Suspense buildup messages
  const suspenseSlides = [
    { title: "Hey " + partnerName + "...", text: "There is something I've been wanting to share with you for a while now." },
    { title: "Every single day...", text: "Conversations with you are the highlight of my week, and you always bring a smile to my face." },
    { title: "And because of that...", text: "I wanted to create this special page to ask you a very important question..." }
  ];

  // Speech bubble text array for runaway attempts
  const warningTexts = [
    "Are you sure? 🥺",
    "Nice try! 😉",
    "Try again! ⚡",
    "Not an option! 🔒",
    "Click Yes! 💕",
    "Error 404: No option not found! ❌",
    "Resistance is futile! 😂"
  ];

  // Spawn floating hearts on click
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart: HeartParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 20 + 15
    };
    setParticles((prev) => [...prev, newHeart]);
  };

  // Clean particles after animation
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  // Runaway button positioning and scale changes
  const handleNoButtonMove = () => {
    const rangeX = 130;
    const rangeY = 90;
    const x = (Math.random() - 0.5) * rangeX * 2;
    const y = (Math.random() - 0.5) * rangeY * 2;
    setNoBtnOffset({ x, y });
    
    // Set warning bubble text
    const index = Math.min(noAttempts, warningTexts.length - 1);
    setSpeechBubble(warningTexts[index]);
    setNoAttempts((prev) => prev + 1);
  };

  const handleNextSuspense = () => {
    if (suspenseIndex < suspenseSlides.length - 1) {
      setSuspenseIndex((prev) => prev + 1);
    } else {
      setStage("proposal");
    }
  };

  const handleReplyClick = () => {
    const params = new URLSearchParams({
      isReply: "true",
      category: "crush",
      yourName: partnerName,
      partnerName: yourName,
    });
    if (relationshipDate) {
      params.append("relationshipDate", relationshipDate);
    }
    router.push(`/create?${params.toString()}`);
  };

  // Scales based on runaway attempts
  const yesScale = 1 + noAttempts * 0.15;
  const noScale = Math.max(0.5, 1 - noAttempts * 0.1);

  // Themes Color Maps
  const bgClass = isDark
    ? "bg-gradient-to-br from-[#0c0014] via-[#1b002c] to-[#04000b] text-[#ffe6f2]"
    : "bg-gradient-to-br from-[#fff0f6] via-[#fff5f5] to-[#faf0fc] text-[#4a0b2e]";

  const cardClass = isDark
    ? "bg-[#160324]/85 border-pink-900/40 text-pink-100 shadow-[0_0_60px_rgba(244,63,94,0.2)] backdrop-blur-xl"
    : "bg-white/95 border-pink-150 text-slate-800 shadow-[0_20px_45px_rgba(244,63,94,0.1)] backdrop-blur-xl";

  return (
    <div 
      onClick={handleBackgroundClick}
      className={`min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden py-16 px-4 cursor-default select-none ${bgClass}`}
    >
      
      {/* Background Floating Hearts (Parallax Atmosphere) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] animate-pulse text-pink-500/10 text-4xl">💖</div>
        <div className="absolute top-[25%] right-[15%] animate-bounce text-purple-500/10 text-5xl">💘</div>
        <div className="absolute bottom-[20%] left-[8%] animate-pulse text-rose-500/10 text-6xl">💝</div>
        <div className="absolute bottom-[35%] right-[10%] animate-bounce text-pink-500/15 text-3xl">💕</div>
      </div>

      {/* Floating Click Particles Render */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.5, x: p.x - p.size / 2, y: p.y - p.size / 2 }}
            animate={{ opacity: 0, scale: 1.5, y: p.y - p.size / 2 - 120, x: p.x - p.size / 2 + (Math.random() - 0.5) * 50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ position: "absolute", zIndex: 50 }}
          >
            <Heart className="text-pink-500 fill-pink-500" style={{ width: p.size, height: p.size }} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header controls (Sound/Music placeholder) */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-pink-500 hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
          title={isMuted ? "Unmute Ambient Music" : "Mute Music"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4 animate-spin" />}
        </button>
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: ENVELOPE */}
          {stage === "envelope" && (
            <motion.div
              key="envelope-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-pink-500/10 rounded-2xl border border-pink-500/20 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-pink-500 animate-pulse" />
              </div>
              <h2 className="font-poppins text-xs tracking-[0.25em] text-pink-500 font-bold uppercase mb-8 text-center animate-pulse">
                You received a secret confession
              </h2>

              {/* Pointing Hand Prompter */}
              {!hasPrompterBeenClicked && (
                <div 
                  className="mb-6 flex flex-col items-center cursor-pointer" 
                  onClick={(e) => { e.stopPropagation(); setStage("suspense"); setHasPrompterBeenClicked(true); }}
                >
                  <div className="animate-bounce text-4xl">👇</div>
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3.5 py-1.5 rounded-full shadow-lg shadow-pink-500/20 mt-1 animate-pulse">
                    Click to Reveal
                  </span>
                </div>
              )}

              {/* Heart Envelope Envelope */}
              <div 
                onClick={(e) => { e.stopPropagation(); setStage("suspense"); setHasPrompterBeenClicked(true); }}
                className="w-[310px] h-[210px] bg-pink-50 dark:bg-pink-950/40 border-2 border-pink-400/40 rounded-2xl relative shadow-2xl cursor-pointer hover:scale-[1.03] transition-transform duration-300 flex flex-col justify-center items-center group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-transparent pointer-events-none" />
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                </div>
                <p className="font-serif italic text-xs text-pink-600 dark:text-pink-300 mt-4 tracking-wider">
                  Personal confession for {partnerName}
                </p>
                <span className="absolute bottom-3 text-[9px] font-mono uppercase tracking-widest text-pink-500/60">
                  Click to open letter
                </span>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: SUSPENSE BUILDUP SLIDESHOW */}
          {stage === "suspense" && (
            <motion.div
              key="suspense-stage"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between min-h-[300px] ${cardClass}`}>
                
                {/* Progress bar */}
                <div className="w-full bg-pink-500/10 h-1 rounded-full overflow-hidden mb-6">
                  <div 
                    className="bg-pink-500 h-full transition-all duration-300"
                    style={{ width: `${((suspenseIndex + 1) / suspenseSlides.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-4 flex-1 flex flex-col justify-center text-center">
                  <motion.h3 
                    key={`title-${suspenseIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-luxury-serif text-3xl font-normal text-pink-500"
                  >
                    {suspenseSlides[suspenseIndex].title}
                  </motion.h3>
                  
                  <motion.p 
                    key={`text-${suspenseIndex}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 dark:text-slate-350 text-sm leading-relaxed"
                  >
                    {suspenseSlides[suspenseIndex].text}
                  </motion.p>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextSuspense}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold text-xs shadow-md shadow-pink-500/10 hover:scale-[1.02] transition-transform duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    {suspenseIndex === suspenseSlides.length - 1 ? "Open Question" : "Continue"} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* STAGE 3: THE PROPOSAL */}
          {stage === "proposal" && (
            <motion.div
              key="proposal-stage"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md relative ${cardClass}`}>
                
                {/* Speech Bubble above runaway button */}
                <AnimatePresence>
                  {speechBubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono tracking-wide shadow-md z-30 flex items-center justify-center gap-1 whitespace-nowrap"
                    >
                      <Sparkles className="w-3 h-3 text-white fill-white" /> {speechBubble}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center space-y-6">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                  </div>

                  <h3 className="font-luxury-serif text-3xl font-normal leading-tight text-pink-500">
                    Will you be mine? 💖
                  </h3>

                  <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">
                    {yourName} has feelings for you. Do you accept {yourName} as your partner?
                  </p>

                  {relationshipDate && (
                    <p className="text-[10px] font-mono bg-pink-500/5 text-pink-500 border border-pink-500/10 px-2.5 py-1 rounded-full inline-block">
                      Proposal Target: {new Date(relationshipDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}

                  <div className="w-full h-[1px] bg-pink-500/15 my-4" />

                  {/* Yes/No Buttons container */}
                  <div className="flex flex-col items-center justify-center gap-4 relative min-h-[160px] w-full">
                    
                    {/* YES BUTTON */}
                    <motion.button
                      type="button"
                      animate={{ scale: yesScale }}
                      style={{ originX: 0.5, originY: 0.5 }}
                      onClick={() => setStage("accepted")}
                      className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold text-sm shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-2 z-10 whitespace-nowrap glow-pink-btn"
                    >
                      YES! I Accept 💖
                    </motion.button>

                    {/* NO RUNAWAY BUTTON */}
                    <motion.button
                      type="button"
                      onMouseEnter={handleNoButtonMove}
                      onClick={handleNoButtonMove}
                      animate={{ 
                        x: noBtnOffset.x, 
                        y: noBtnOffset.y,
                        scale: noScale
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 160,
                        damping: 15,
                        mass: 0.8
                      }}
                      className="absolute px-5 py-2.5 border border-slate-350 dark:border-slate-700 bg-white/30 text-slate-500 dark:text-slate-400 rounded-full font-bold text-xs cursor-pointer select-none"
                    >
                      {noAttempts > 5 ? "Stop! 🥺" : noAttempts > 2 ? "No way 🙅" : "No 😢"}
                    </motion.button>

                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* STAGE 4: PROPOSAL ACCEPTED */}
          {stage === "accepted" && (
            <motion.div
              key="accepted-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md text-center space-y-6 ${cardClass}`}>
                
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>

                <h3 className="font-luxury-serif text-3.5xl text-emerald-600 dark:text-emerald-400 font-normal">
                  Yay! Confession Accepted! 🎉
                </h3>

                <p className="text-slate-500 dark:text-slate-300 text-xs italic">
                  Here is the special letter {yourName} wrote for you:
                </p>

                {/* Confession message card */}
                <div className="bg-pink-500/5 dark:bg-pink-500/10 border border-pink-400/25 p-6 rounded-2xl text-left space-y-4 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-pink-500/[0.02] to-transparent pointer-events-none" />
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-pink-500 block">Personal Note</span>
                  <p className="font-serif text-sm italic leading-relaxed text-slate-750 dark:text-slate-200 whitespace-pre-line relative z-10">
                    "{message}"
                  </p>
                  <div className="w-full text-right text-xs font-serif text-pink-500 relative z-10">
                    — Yours forever, {yourName}
                  </div>
                </div>

                {/* Dynamic Custom Fields */}
                {customFields && customFields.length > 0 && (
                  <div className="space-y-3 pt-2 text-left">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-500 dark:text-slate-400 block">Additional Details</span>
                    <div className="space-y-2">
                      {customFields.map((field, idx) => {
                        const link = getLinkUrl(field.value);
                        return (
                          <div 
                            key={idx} 
                            className="bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm"
                          >
                            <h4 className="font-poppins font-semibold text-[10px] text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {field.label}
                            </h4>
                            {link ? (
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1 font-serif text-sm text-pink-500 hover:text-pink-600 underline underline-offset-2 break-all"
                              >
                                {field.value.length > 30 ? "Click to view link" : field.value} ↗
                              </a>
                            ) : (
                              <p className="font-serif text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
                                {field.value}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="w-full h-[1px] bg-pink-500/15 pt-2" />

                {/* Reply action button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReplyClick}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-bold font-poppins tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 animate-pulse" /> Send Reply Message
                  </button>
                </div>

              </div>

              {/* Creator CTA footer */}
              <div className="mt-12 text-center flex flex-col items-center">
                <a
                  href="/create"
                  className="font-poppins text-xs tracking-wider text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1.5 bg-white/20 px-4.5 py-2.5 rounded-full border border-pink-500/20 backdrop-blur-md"
                >
                  Create Your Own Confession Page ✨
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <BackgroundMusic category="crush" enabled={musicEnabled && !hideMusicPlayer} />
    </div>
  );
}
