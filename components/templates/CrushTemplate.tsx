"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Send, Gift, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface CrushTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

export default function CrushTemplate({
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  theme,
  isPreview = false,
}: CrushTemplateProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompterBeenClicked, setHasPrompterBeenClicked] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [noBtnOffset, setNoBtnOffset] = useState({ x: 0, y: 0 });
  const [noClickCount, setNoClickCount] = useState(0);

  const isDark = theme === "dark";

  // Runaway button mechanism
  const handleNoHoverOrClick = () => {
    // Generate random coordinates inside a range
    const rangeX = 140;
    const rangeY = 100;
    const x = (Math.random() - 0.5) * rangeX * 2;
    const y = (Math.random() - 0.5) * rangeY * 2;
    setNoBtnOffset({ x, y });
    setNoClickCount((prev) => prev + 1);
  };

  const handleOpenEnvelope = () => {
    setIsOpen(true);
    setHasPrompterBeenClicked(true);
  };

  const handleReplyClick = () => {
    const params = new URLSearchParams({
      isReply: "true",
      category: "crush",
      yourName: partnerName, // Inverted for response
      partnerName: yourName,
    });
    if (relationshipDate) {
      params.append("relationshipDate", relationshipDate);
    }
    router.push(`/create?${params.toString()}`);
  };

  // Base Theme Colors
  const bgClass = isDark
    ? "bg-gradient-to-br from-[#0d0115] via-[#21022d] to-[#04000b] text-[#ffe6f2]"
    : "bg-gradient-to-br from-[#fff0f6] via-[#fff5f5] to-[#f8f0fc] text-[#4a0b2e]";

  const cardClass = isDark
    ? "bg-[#180523]/80 border-pink-900/30 text-pink-100 shadow-[0_0_50px_rgba(236,72,153,0.15)]"
    : "bg-white/90 border-pink-150 text-slate-800 shadow-[0_15px_35px_rgba(236,72,153,0.08)]";

  return (
    <div className={`min-h-screen w-full relative flex flex-col items-center justify-center overflow-x-hidden py-16 px-4 ${bgClass}`}>
      
      {/* Decorative Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[10%] left-[5%] animate-bounce text-pink-500/20 text-3xl">💖</div>
        <div className="absolute top-[20%] right-[10%] animate-pulse text-pink-500/10 text-5xl">💘</div>
        <div className="absolute bottom-[30%] left-[8%] animate-pulse text-purple-500/15 text-4xl">🔮</div>
        <div className="absolute bottom-[15%] right-[12%] animate-bounce text-pink-500/20 text-2xl">💝</div>
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        
        {/* Envelope Container */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="font-poppins text-xs tracking-[0.2em] text-pink-500 font-bold uppercase mb-8 text-center animate-pulse">
                ✨ SECRET PROPOSAL AWAITS ✨
              </h2>

              {/* Pointing Hand Prompter */}
              {!hasPrompterBeenClicked && (
                <div className="mb-4 flex flex-col items-center cursor-pointer" onClick={handleOpenEnvelope}>
                  <div className="animate-bounce text-3xl">👇</div>
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold bg-pink-500 text-white px-2.5 py-1 rounded-full shadow-md mt-1 animate-pulse">
                    Click to Open Proposal
                  </span>
                </div>
              )}

              {/* Letter Envelope Graphic */}
              <div 
                onClick={handleOpenEnvelope}
                className="w-[300px] h-[200px] bg-pink-100 dark:bg-pink-950/60 border-2 border-pink-400/40 rounded-xl relative shadow-2xl cursor-pointer hover:scale-[1.03] transition-transform duration-300 flex flex-col justify-center items-center group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-transparent pointer-events-none" />
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                </div>
                <p className="font-serif italic text-xs text-pink-600 dark:text-pink-300 mt-4 tracking-wider">
                  Dear {partnerName}...
                </p>
                <span className="absolute bottom-3 text-[10px] font-mono uppercase tracking-widest text-pink-500/60">
                  With Love • {yourName}
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
              {/* Proposal Card */}
              <div className={`w-full border p-8 rounded-3xl backdrop-blur-md transition-all duration-300 ${cardClass}`}>
                
                <div className="text-center space-y-4">
                  
                  {!accepted ? (
                    <>
                      <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
                      </div>
                      
                      <h3 className="font-luxury-serif text-3xl font-normal leading-tight text-pink-500">
                        Hey {partnerName}!
                      </h3>
                      
                      <p className="font-poppins text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                        {yourName} has a confession to make and has been secretly holding onto these feelings. Will you give us a chance and go out with {yourName}?
                      </p>

                      {relationshipDate && (
                        <p className="text-[11px] font-mono bg-pink-500/5 text-pink-500 border border-pink-500/10 px-3 py-1.5 rounded-full inline-block">
                          Confession Date: {new Date(relationshipDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}

                      <div className="w-full h-[1px] bg-pink-500/15 my-6" />

                      {/* Interactive Buttons Container */}
                      <div className="flex flex-col items-center justify-center gap-4 relative min-h-[140px]">
                        
                        {/* Yes Button */}
                        <button
                          type="button"
                          onClick={() => setAccepted(true)}
                          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-2 z-10"
                        >
                          YES! I would love to 💖
                        </button>

                        {/* Runaway No Button */}
                        <button
                          type="button"
                          onMouseEnter={handleNoHoverOrClick}
                          onClick={handleNoHoverOrClick}
                          style={{
                            transform: `translate(${noBtnOffset.x}px, ${noBtnOffset.y}px)`,
                            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                          className="absolute px-5 py-2 border border-slate-350 dark:border-slate-700 bg-white/20 text-slate-500 dark:text-slate-400 rounded-full font-semibold text-xs transition-colors cursor-pointer"
                        >
                          {noClickCount > 5 ? "Wait, stop! 😢" : noClickCount > 2 ? "No way 🙅" : "No 😢"}
                        </button>

                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <Sparkles className="w-8 h-8 text-emerald-500" />
                      </div>

                      <h3 className="font-luxury-serif text-3xl text-emerald-600 dark:text-emerald-400 font-normal">
                        It's a Match! 🎉
                      </h3>

                      {/* Secret Letter Message Revealed */}
                      <div className="bg-pink-500/5 dark:bg-pink-500/10 border border-pink-400/20 p-6 rounded-2xl text-left space-y-4">
                        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-pink-500">Confession Letter</span>
                        <p className="font-serif text-sm italic leading-relaxed text-slate-750 dark:text-slate-200 whitespace-pre-line">
                          "{message}"
                        </p>
                        <div className="w-full text-right text-xs font-serif text-pink-500">
                          — With all my love, {yourName}
                        </div>
                      </div>

                      <div className="w-full h-[1px] bg-pink-500/15 pt-2" />

                      {/* Send Reply Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleReplyClick}
                          className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-bold font-poppins tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Reply Message
                        </button>
                      </div>

                    </motion.div>
                  )}

                </div>

              </div>

              {/* Creator Footer CTA */}
              <div className="mt-12 text-center">
                <a
                  href="/create"
                  className="font-poppins text-xs tracking-wider text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1 bg-white/20 px-4 py-2 rounded-full border border-pink-500/20"
                >
                  Create Your Own Secret Proposal Page ✨
                </a>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
