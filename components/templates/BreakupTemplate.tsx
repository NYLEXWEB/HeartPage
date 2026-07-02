"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Clock, EyeOff, BookOpen, Sunset, Compass, Volume2, VolumeX, Heart, Sparkles, AlertTriangle } from "lucide-react";

interface BreakupTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string; // Relationship Period (e.g. "2018 - 2024" or date)
  message: string;
  images: string[];
  theme: "light" | "dark";
  customFields?: { label: string; value: string }[];
  isPreview?: boolean;
}

export default function BreakupTemplate({
  yourName = "Riley",
  partnerName = "Casey",
  relationshipDate = "2021 - 2025",
  message = "Sometimes things fall apart so that better things can fall together. Thank you for the lessons, the laughter, and the time we shared. I will always wish you the best, wherever your path leads.",
  images = [],
  theme = "dark",
  customFields = [],
  isPreview = false,
}: BreakupTemplateProps) {
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
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isLight = theme === "light";

  // Dynamic Theme Colors
  const textTitle = isLight ? "text-slate-900" : "text-white";
  const textMain = isLight ? "text-slate-800" : "text-slate-200";
  const textMuted = isLight ? "text-slate-550" : "text-slate-400";
  const textLightGlow = isLight ? "text-slate-700" : "text-slate-350";
  const bgPreloader = isLight ? "bg-slate-50" : "bg-[#020617]";
  const borderPreloader = isLight ? "border-slate-300" : "border-slate-700";

  // Setup initials
  const initials = `${yourName ? yourName.charAt(0).toUpperCase() : 'R'}&${partnerName ? partnerName.charAt(0).toUpperCase() : 'C'}`;

  // Image assets mapping - Uploaded images will only render in the bottom gallery section
  const heroBg = null;
  const partner1Img = null;
  const partner2Img = null;
  const sunsetImg = null;

  // Load external scripts helper
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  // Main scroll, cursor, rain particles & GSAP engine
  useEffect(() => {
    let active = true;
    let lenisInstance: any = null;
    let mmContext: any = null;
    let rainFrameId: number | null = null;
    let particlesFrameId: number | null = null;

    let resizeRain: (() => void) | null = null;
    let resizeParticles: (() => void) | null = null;
    let mouseMoveCursor: ((e: MouseEvent) => void) | null = null;
    let mouseOverRoot: ((e: MouseEvent) => void) | null = null;
    let mouseOutRoot: ((e: MouseEvent) => void) | null = null;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const mainContainer = document.getElementById('breakup-website-root');

    const init = async () => {
      // Load CDN scripts sequentially
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js");

      if (!active) return;

      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      const Lenis = (window as any).Lenis;

      if (!gsap || !ScrollTrigger || !Lenis) return;

      gsap.registerPlugin(ScrollTrigger);

      // Smooth scroll engine setup (Bypass on mobile)
      if (!isPreview && !isMobile) {
        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1.0,
          infinite: false
        });

        lenisInstance.on('scroll', ScrollTrigger.update);
        const tickerCallback = (time: number) => {
          lenisInstance.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(0);
      }

      // Cursor Follower engine
      const cursor = document.getElementById('breakup-cursor');
      const follower = document.getElementById('breakup-cursor-follower');

      let cursorX: any, cursorY: any, followerX: any, followerY: any;
      if (cursor && follower && !isPreview && !isMobile) {
        cursorX = gsap.quickTo(cursor, "left", { duration: 0.08, ease: "power3.out" });
        cursorY = gsap.quickTo(cursor, "top", { duration: 0.08, ease: "power3.out" });
        followerX = gsap.quickTo(follower, "left", { duration: 0.25, ease: "power3.out" });
        followerY = gsap.quickTo(follower, "top", { duration: 0.25, ease: "power3.out" });

        gsap.set([cursor, follower], { left: "-100px", top: "-100px" });

        mouseMoveCursor = (e: MouseEvent) => {
          cursorX(e.clientX);
          cursorY(e.clientY);
          followerX(e.clientX);
          followerY(e.clientY);

          if (cursor.classList.contains('hidden')) {
            cursor.classList.remove('hidden');
            follower.classList.remove('hidden');
          }
        };
        window.addEventListener('mousemove', mouseMoveCursor);
      }

      // Event delegation for cursor hover state (Bypass on mobile)
      if (mainContainer && !isPreview && !isMobile) {
        mouseOverRoot = (e: MouseEvent) => {
          const target = (e.target as HTMLElement).closest('.hover-target');
          if (target && cursor && follower) {
            gsap.to(cursor, { width: 12, height: 12, backgroundColor: "#f43f5e", duration: 0.2 });
            gsap.to(follower, { width: 55, height: 55, borderColor: "#f43f5e", backgroundColor: "rgba(244, 63, 94, 0.08)", duration: 0.2 });
          }
        };
        mouseOutRoot = (e: MouseEvent) => {
          const target = (e.target as HTMLElement).closest('.hover-target');
          if (target && cursor && follower) {
            gsap.to(cursor, { width: 8, height: 8, backgroundColor: isLight ? "#475569" : "#64748b", duration: 0.2 });
            gsap.to(follower, { width: 40, height: 40, borderColor: isLight ? "rgba(71, 85, 105, 0.3)" : "rgba(100, 116, 139, 0.3)", backgroundColor: "transparent", duration: 0.2 });
          }
        };
        mainContainer.addEventListener('mouseover', mouseOverRoot);
        mainContainer.addEventListener('mouseout', mouseOutRoot);
      }

      // Parallax for hero backdrop
      const parallaxImg = document.getElementById('breakup-hero-img');
      if (parallaxImg) {
        gsap.to(parallaxImg, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: "#breakup-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Preloader animation
      const preloader = document.getElementById("breakup-preloader");
      const progress = document.getElementById("breakup-preloader-progress");

      if (preloader && progress && !isPreview) {
        setTimeout(() => { if (progress) progress.style.width = "40%"; }, 150);
        setTimeout(() => { if (progress) progress.style.width = "75%"; }, 500);
        setTimeout(() => { if (progress) progress.style.width = "100%"; }, 1000);
        setTimeout(() => {
          if (preloader) preloader.classList.add("opacity-0", "pointer-events-none");
          gsap.fromTo('.animate-breakup-init',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
          );
        }, 1600);
      } else {
        gsap.fromTo('.animate-breakup-init',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
        );
      }

      // Falling Rain Background Canvas
      const rainCanvas = document.getElementById("rain-canvas") as HTMLCanvasElement | null;
      if (rainCanvas) {
        const rCtx = rainCanvas.getContext("2d");
        if (rCtx) {
          let drops: RainDrop[] = [];
          const maxDrops = isMobile ? 15 : 60;
          let scrollSpeedMultiplier = 1.0;

          resizeRain = () => {
            rainCanvas.width = window.innerWidth;
            rainCanvas.height = window.innerHeight;
          };
          window.addEventListener("resize", resizeRain);
          resizeRain();

          class RainDrop {
            x!: number;
            y!: number;
            length!: number;
            speed!: number;
            opacity!: number;

            constructor() {
              this.reset();
              this.y = Math.random() * rainCanvas!.height;
            }

            reset() {
              this.x = Math.random() * rainCanvas!.width;
              this.y = -20;
              this.length = Math.random() * 20 + 15;
              this.speed = Math.random() * 4 + 4;
              this.opacity = Math.random() * 0.15 + 0.05;
            }

            update() {
              this.y += this.speed * scrollSpeedMultiplier;
              if (this.y > rainCanvas!.height + 20) {
                this.reset();
              }
            }

            draw() {
              if (!rCtx) return;
              rCtx.save();
              rCtx.strokeStyle = isLight ? "rgba(71, 85, 105, 0.25)" : "rgba(148, 163, 184, 0.4)";
              rCtx.globalAlpha = this.opacity;
              rCtx.lineWidth = 1;
              rCtx.beginPath();
              rCtx.moveTo(this.x, this.y);
              rCtx.lineTo(this.x, this.y + this.length);
              rCtx.stroke();
              rCtx.restore();
            }
          }

          for (let i = 0; i < maxDrops; i++) {
            drops.push(new RainDrop());
          }

          const animateRain = () => {
            rCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
            drops.forEach(d => {
              d.update();
              d.draw();
            });
            rainFrameId = requestAnimationFrame(animateRain);
          };
          animateRain();

          // Speed up rain slightly based on scroll speed
          ScrollTrigger.create({
            scroller: (isPreview && typeof document !== "undefined" && document.querySelector(".simulated-scrollable-container")) ? ".simulated-scrollable-container" : window,
            onUpdate: (self: any) => {
              scrollSpeedMultiplier = 1.0 + Math.abs(self.getVelocity() / 300);
              setTimeout(() => {
                scrollSpeedMultiplier = 1.0;
              }, 150);
            }
          });
        }
      }

      // GSAP Pinned Scroll Animation configuration (Drifting Apart)
      const breakupParticlesCanvas = document.getElementById("breakup-particles-canvas") as HTMLCanvasElement | null;
      if (breakupParticlesCanvas) {
        const ptCtx = breakupParticlesCanvas.getContext("2d");
        if (ptCtx) {
          let particles: SparkDust[] = [];
          let baseCount = isMobile ? 10 : 35;
          let burstActivated = false;

          resizeParticles = () => {
            if (breakupParticlesCanvas.parentElement) {
              breakupParticlesCanvas.width = breakupParticlesCanvas.parentElement.clientWidth;
              breakupParticlesCanvas.height = breakupParticlesCanvas.parentElement.clientHeight;
            }
          };
          window.addEventListener("resize", resizeParticles);
          resizeParticles();

          class SparkDust {
            isBurst: boolean;
            x!: number;
            y!: number;
            speedX!: number;
            speedY!: number;
            size!: number;
            decay!: number;
            color!: string;
            opacity!: number;

            constructor(isBurst = false) {
              this.isBurst = isBurst;
              this.reset();
              if (!isBurst && breakupParticlesCanvas) {
                this.y = Math.random() * breakupParticlesCanvas.height;
              }
            }

            reset() {
              if (breakupParticlesCanvas) {
                if (this.isBurst) {
                  this.x = breakupParticlesCanvas.width / 2;
                  this.y = breakupParticlesCanvas.height / 2;
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 5 + 1.5;
                  this.speedX = Math.cos(angle) * speed;
                  this.speedY = Math.sin(angle) * speed;
                  this.size = Math.random() * 3 + 1;
                  this.decay = Math.random() * 0.015 + 0.005;
                  this.color = Math.random() > 0.5 ? "#f43f5e" : "#64748b";
                } else {
                  this.x = Math.random() * breakupParticlesCanvas.width;
                  this.y = breakupParticlesCanvas.height + 10;
                  this.speedY = -(Math.random() * 1.0 + 0.3);
                  this.speedX = Math.random() * 0.6 - 0.3;
                  this.size = Math.random() * 2 + 0.5;
                  this.decay = 0;
                  this.color = "#64748b";
                }
              }
              this.opacity = Math.random() * 0.6 + 0.2;
            }

            update() {
              if (this.isBurst) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.speedX *= 0.94;
                this.speedY *= 0.94;
                this.opacity -= this.decay;
              } else {
                this.y += this.speedY;
                this.x += this.speedX;
                if (this.y < -10) this.reset();
              }
            }

            draw() {
              if (this.opacity <= 0 || !ptCtx) return;
              ptCtx.save();
              ptCtx.globalAlpha = this.opacity;
              ptCtx.fillStyle = this.color;
              ptCtx.beginPath();
              ptCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
              ptCtx.fill();
              ptCtx.restore();
            }
          }

          for (let i = 0; i < baseCount; i++) {
            particles.push(new SparkDust(false));
          }

          const triggerBurst = () => {
            const burstCount = isMobile ? 20 : 70;
            for (let i = 0; i < burstCount; i++) {
              particles.push(new SparkDust(true));
            }
          };

          const animateParticles = () => {
            ptCtx.clearRect(0, 0, breakupParticlesCanvas.width, breakupParticlesCanvas.height);
            particles = particles.filter(p => !p.isBurst || p.opacity > 0);
            particles.forEach(p => {
              p.update();
              p.draw();
            });
            particlesFrameId = requestAnimationFrame(animateParticles);
          };
          animateParticles();

          const handleScrollBurst = (progress: number) => {
            if (progress >= 0.74 && progress <= 0.78) {
              if (!burstActivated) {
                triggerBurst();
                burstActivated = true;
              }
            } else if (progress < 0.65 || progress > 0.85) {
              burstActivated = false;
            }
          };

          // Setup GSAP matchMedia context
          mmContext = gsap.matchMedia();
          gsap.set(".breakup-heart-path", { strokeDashoffset: 1000 });
          gsap.set(".breakup-svg-container", { xPercent: -50, yPercent: -50, scale: 0.8 });
          gsap.set(".scroll-sunset-frame", { xPercent: -50, yPercent: -50, scale: 0.9 });

          mmContext.add({
            isDesktop: "(min-width: 769px)",
            isMobile: "(max-width: 768px)"
          }, (context: any) => {
            const { isDesktop } = context.conditions;

            // Drifting APART: start close, scroll to drift away
            const startX1 = isDesktop ? "-4vw" : "-8vw";
            const startX2 = isDesktop ? "4vw" : "8vw";
            const targetX1 = isDesktop ? "-22vw" : "-38vw";
            const targetX2 = isDesktop ? "22vw" : "38vw";

            gsap.set(".scroll-partner-left", { x: startX1, scale: 0.98 });
            gsap.set(".scroll-partner-right", { x: startX2, scale: 0.98 });

            const scrollTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: "#breakup-scroll-container",
                start: "top top",
                end: "+=360%",
                scrub: 1.2,
                pin: true,
                anticipatePin: 1,
                scroller: (isPreview && typeof document !== "undefined" && document.querySelector(".simulated-scrollable-container")) ? ".simulated-scrollable-container" : window,
                onUpdate: (self: any) => {
                  handleScrollBurst(self.progress);
                }
              }
            });

            scrollTimeline
              .to(".scroll-partner-left", { x: targetX1, scale: 0.95, opacity: 0.6, ease: "power1.inOut" }, 0)
              .to(".scroll-partner-right", { x: targetX2, scale: 0.95, opacity: 0.6, ease: "power1.inOut" }, 0)
              .to(".breakup-scroll-glow", { opacity: 0.6, scale: 1.15, ease: "power1.inOut" }, 0)
              .to(".breakup-scroll-bg-overlay", { opacity: 0, ease: "power1.inOut" }, 0)
              .to(".scroll-partner-left, .scroll-partner-right", {
                opacity: 0,
                filter: "blur(12px)",
                scale: 0.9,
                ease: "power1.in"
              }, 0.5)
              .to(".breakup-svg-container", { opacity: 1, scale: 1, ease: "power1.out" }, 0.52)
              .to(".breakup-heart-path", { strokeDashoffset: 0, ease: "power1.inOut" }, 0.52)
              .to(".breakup-svg-container", { scale: 1.2, filter: "blur(8px)", opacity: 0, ease: "power1.in" }, 0.72)
              .to(".scroll-sunset-frame", { opacity: 1, scale: 1, ease: "power2.out" }, 0.74)
              .to(".breakup-scroll-title-text", { opacity: 1, y: 0, ease: "power2.out" }, 0.80)
              .to({}, { duration: 0.1 });
          });
        }
      }
    };

    init();

    return () => {
      active = false;
      const gsap = (window as any).gsap;
      if (gsap) {
        gsap.ticker.remove((time: number) => {
          if (lenisInstance) lenisInstance.raf(time * 1000);
        });
      }
      if (mmContext) mmContext.revert();
      const ScrollTrigger = (window as any).ScrollTrigger;
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((t: any) => t.kill());
      }
      if (lenisInstance) lenisInstance.destroy();
      if (resizeRain) window.removeEventListener("resize", resizeRain);
      if (resizeParticles) window.removeEventListener("resize", resizeParticles);
      if (mouseMoveCursor) window.removeEventListener("mousemove", mouseMoveCursor);
      if (mouseOverRoot && mainContainer) mainContainer.removeEventListener("mouseover", mouseOverRoot);
      if (mouseOutRoot && mainContainer) mainContainer.removeEventListener("mouseout", mouseOutRoot);
      if (rainFrameId) cancelAnimationFrame(rainFrameId);
      if (particlesFrameId) cancelAnimationFrame(particlesFrameId);
    };
  }, [images, isPreview, isLight]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log("Audio play blocked:", err));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div id="breakup-website-root" className={`min-h-screen w-full relative overflow-x-hidden font-poppins transition-colors duration-550 ${isLight ? "bg-slate-50 text-slate-800" : "bg-[#020617] text-slate-300"}`}>
      
      {/* Dynamic Scoped CSS Stylesheets */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-bg-breakup: ${isLight ? "#f8fafc" : "#020617"};
          --color-text-breakup: ${isLight ? "#0f172a" : "#cbd5e1"};
          --color-text-dim: ${isLight ? "#475569" : "#64748b"};
          --color-glass-bg: ${isLight ? "rgba(255, 255, 255, 0.75)" : "rgba(15, 23, 42, 0.65)"};
          --color-glass-border: ${isLight ? "rgba(148, 163, 184, 0.22)" : "rgba(255, 255, 255, 0.08)"};
        }

        #breakup-website-root {
          background-color: var(--color-bg-breakup) !important;
          color: var(--color-text-breakup) !important;
        }

        /* Custom cursor styling */
        .breakup-cursor {
          width: 8px;
          height: 8px;
          background-color: ${isLight ? "#475569" : "#64748b"};
          border-radius: 50%;
          position: fixed;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9999;
          transition: width 0.2s, height 0.2s, background-color 0.2s;
        }

        .breakup-cursor-follower {
          width: 40px;
          height: 40px;
          border: 1px solid ${isLight ? "rgba(71, 85, 105, 0.35)" : "rgba(148, 163, 184, 0.3)"};
          border-radius: 50%;
          position: fixed;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9998;
          transition: transform 0.08s ease-out;
        }

        /* Canvas positions */
        #rain-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 5;
        }

        #breakup-particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        /* Glassmorphic card styling */
        .breakup-glass-card {
          background: var(--color-glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--color-glass-border);
          box-shadow: ${isLight ? "0 10px 30px rgba(15, 23, 42, 0.04)" : "0 12px 35px 0 rgba(0, 0, 0, 0.02)"};
        }

        .breakup-glass-hover {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .breakup-glass-hover:hover {
          background: ${isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.8)"};
          transform: translateY(-5px);
          border-color: ${isLight ? "rgba(71, 85, 105, 0.35)" : "rgba(148, 163, 184, 0.3)"};
        }

        /* Scroll Animation pin layout */
        #breakup-scroll-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-bg-breakup);
        }

        .scroll-pin-section {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
          position: relative;
        }

        .scroll-partner-avatar {
          position: absolute;
          z-index: 10;
        }

        .breakup-svg-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          z-index: 11;
          width: 320px;
          height: 320px;
          opacity: 0;
          pointer-events: none;
        }

        .breakup-heart-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        .scroll-sunset-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          z-index: 12;
          opacity: 0;
        }

        /* Ambient player & Rotation */
        .vinyl-spinning {
          animation: spin-vinyl 15s linear infinite;
        }
        @keyframes spin-vinyl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        #breakup-ambient-player:hover .player-meta {
          max-w: 160px;
        }

        /* Envelope card */
        .breakup-envelope-wrapper {
          position: relative;
          width: 320px;
          height: 220px;
          background-color: ${isLight ? "#e2e8f0" : "#1e293b"};
          box-shadow: ${isLight ? "0 10px 30px rgba(15, 23, 42, 0.05)" : "0 10px 30px rgba(0,0,0,0.03)"};
          border-radius: 6px;
          cursor: pointer;
          perspective: 1000px;
          transition: transform 0.5s ease;
        }

        .breakup-envelope {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: ${isLight ? "#cbd5e1" : "#0f172a"};
          border-radius: 6px;
          transform-style: preserve-3d;
        }

        .breakup-envelope-front {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-bottom: 110px solid ${isLight ? "#f8fafc" : "#1b2535"};
          bottom: 0;
          left: 0;
          transform: translateZ(3px);
        }

        .breakup-envelope-sides {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 110px solid transparent;
          border-bottom: 110px solid transparent;
          border-left: 160px solid ${isLight ? "#cbd5e1" : "#161e2d"};
          top: 0;
          left: 0;
          transform: translateZ(2px);
        }

        .breakup-envelope-sides-right {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 110px solid transparent;
          border-bottom: 110px solid transparent;
          border-right: 160px solid ${isLight ? "#cbd5e1" : "#161e2d"};
          top: 0;
          right: 0;
          transform: translateZ(2px);
        }

        .breakup-envelope-flap {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-top: 110px solid ${isLight ? "#94a3b8" : "#334155"};
          top: 0;
          left: 0;
          transform-origin: top;
          transform: translateZ(4px) rotateX(0deg);
          transition: transform 0.4s ease 0s;
        }

        .breakup-letter-paper {
          position: absolute;
          width: 290px;
          height: 185px;
          background: ${isLight ? "#ffffff" : "#0f172a"};
          left: 15px;
          bottom: 10px;
          padding: 22px;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid ${isLight ? "rgba(71, 85, 105, 0.15)" : "rgba(148, 163, 184, 0.2)"};
          transform: translateZ(1px);
          transition: transform 0.4s ease 0s, height 0.4s ease 0s;
        }

        /* Open states */
        .breakup-envelope-wrapper.open .breakup-envelope-flap {
          transform: translateZ(0px) rotateX(180deg);
        }

        .breakup-envelope-wrapper.open .breakup-letter-paper {
          transform: translateZ(5px) translateY(-135px) scale(1.04);
          height: 250px;
          box-shadow: ${isLight ? "0 12px 30px rgba(15, 23, 42, 0.08)" : "0 15px 35px rgba(0, 0, 0, 0.08)"};
          border: 1px solid ${isLight ? "rgba(71, 85, 105, 0.25)" : "rgba(148, 163, 184, 0.3)"};
          transition: transform 0.4s ease 0.3s, height 0.4s ease 0.3s;
        }

        /* Grain overlay */
        .breakup-film-grain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9990;
        }
      ` }} />

      {/* Live Preview Mode header banner */}
      {isPreview && (
        <div className="sticky top-0 z-[10000] w-full bg-slate-500 text-white text-center py-1.5 text-xs font-semibold uppercase tracking-widest shadow-md">
          Live Preview Mode
        </div>
      )}

      {/* Film Grain overlay */}
      <div className="breakup-film-grain"></div>

      {/* Custom Cursor Followers (Hidden in preview mode) */}
      {!isPreview && (
        <>
          <div className="breakup-cursor hidden md:block" id="breakup-cursor"></div>
          <div className="breakup-cursor-follower hidden md:block" id="breakup-cursor-follower"></div>
        </>
      )}

      {/* Dynamic Rain Canvas */}
      <canvas id="rain-canvas"></canvas>

      {/* Monogram preloader */}
      {!isPreview && (
        <div id="breakup-preloader" className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${bgPreloader}`}>
          <div className="text-center flex flex-col items-center px-4">
            <div className={`w-20 h-20 border rounded-full flex items-center justify-center mb-6 bg-white/5 backdrop-blur-sm animate-pulse ${borderPreloader}`}>
              <span className={`font-luxury-serif text-2xl tracking-widest ${isLight ? "text-slate-700" : "text-slate-450"}`}>{initials}</span>
            </div>
            <h2 className={`font-sans text-xl md:text-2xl tracking-[0.2em] uppercase font-bold ${textTitle}`}>{yourName} &amp; {partnerName}</h2>
            <p className={`font-luxury-serif italic text-base mt-2 ${isLight ? "text-slate-500" : "text-slate-400/60"}`}>Opening Final Record...</p>
            <div className={`w-48 h-[1px] mt-8 relative overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
              <div id="breakup-preloader-progress" className={`absolute left-0 top-0 h-full w-0 transition-all duration-500 ease-out ${isLight ? "bg-slate-500" : "bg-slate-600"}`}></div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="breakup-hero" className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Hero Background Parallax Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {heroBg ? (
            <img src={heroBg} alt="Hero Backdrop" className="w-full h-full object-cover scale-105 filter blur-[2px] brightness-[0.70] saturate-[0.80]" id="breakup-hero-img" />
          ) : (
            <div className={`w-full h-full scale-105 ${isLight ? "bg-gradient-to-b from-slate-200 via-slate-100 to-slate-50" : "bg-gradient-to-b from-slate-950 via-slate-900 to-[#020617]"}`} id="breakup-hero-img" />
          )}
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80"></div>
          <div className={`absolute inset-0 opacity-90 ${isLight ? "bg-[radial-gradient(ellipse_at_center,transparent_20%,#f8fafc_100%)]" : "bg-[radial-gradient(ellipse_at_center,transparent_20%,#020617_100%)]"}`}></div>
        </div>

        {/* Ambient Dark glow meshes */}
        <div className={`absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none ${isLight ? "bg-slate-300/10" : "bg-slate-500/5"}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none ${isLight ? "bg-slate-400/10" : "bg-slate-700/5"}`}></div>

        {/* Hero Content layout */}
        <div className="relative z-10 text-center max-w-4xl px-4 mt-8 flex flex-col items-center">
          
          {/* Emblem Icon */}
          <div className={`w-16 h-16 border rounded-full flex items-center justify-center mb-8 backdrop-blur-md bg-white/5 opacity-0 translate-y-8 animate-breakup-init hover-target transition-all ${isLight ? "border-slate-300 hover:border-slate-500" : "border-slate-700 hover:border-slate-500"}`}>
            <Sunset className={`w-6 h-6 animate-pulse ${isLight ? "text-slate-600" : "text-slate-400"}`} />
          </div>

          {/* Heading title */}
          <h1 className={`font-luxury-serif text-5xl md:text-8xl font-normal mb-6 tracking-wide leading-tight opacity-0 translate-y-8 animate-breakup-init delay-1 ${textTitle}`}>
            {yourName} <span className={`italic font-light ${isLight ? "text-slate-400" : "text-slate-500"}`}>&amp;</span> {partnerName}
          </h1>

          {/* Date Badge */}
          {relationshipDate && (
            <div className="opacity-0 translate-y-8 animate-breakup-init delay-2 mb-6">
              <span className={`px-5 py-2 border rounded-full text-xs font-mono tracking-widest ${isLight ? "border-slate-300 bg-white/80 text-slate-700" : "border-slate-800 bg-slate-950/60 text-slate-400"}`}>
                PERIOD: {relationshipDate}
              </span>
            </div>
          )}

          {/* Quote text */}
          <p className={`font-luxury-serif italic text-xl md:text-2xl font-light max-w-2xl mb-10 tracking-wide leading-relaxed opacity-0 translate-y-8 animate-breakup-init delay-2 ${textMain}`}>
            "Some chapters are beautiful, precisely because they have an ending."
          </p>

          {/* Begin Journey CTA */}
          <a href="#breakup-scroll-container" className={`hover-target px-8 py-4 backdrop-blur-md font-poppins text-xs tracking-[0.25em] uppercase rounded-full transition-all duration-500 mb-16 opacity-0 translate-y-8 animate-breakup-init delay-3 shadow-lg ${isLight ? "bg-slate-200/50 hover:bg-slate-800 hover:text-white border border-slate-300 text-slate-800" : "bg-slate-800/20 hover:bg-slate-800 hover:text-white border border-slate-700/50 text-slate-300"}`}>
            View Final Record
          </a>
        </div>
      </section>

      {/* PINNED SCROLL ANIMATION ROW (DRIFTING APART) */}
      <div id="breakup-scroll-container" className="scroll-container hover-target">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full aurora-glow-1 opacity-0 breakup-scroll-glow pointer-events-none"></div>
        <div className="absolute inset-0 bg-slate-950/40 breakup-scroll-bg-overlay pointer-events-none"></div>

        {/* Custom canvas sparkler engine */}
        <canvas id="breakup-particles-canvas"></canvas>

        <div className="scroll-pin-section">
          
          {/* Left profile container */}
          <div className="scroll-partner-avatar scroll-partner-left flex flex-col items-center">
            <div className={`w-44 h-44 md:w-56 md:h-56 rounded-full border-4 p-1.5 shadow-2xl relative overflow-hidden flex items-center justify-center ${isLight ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950/80"}`}>
              {partner1Img ? (
                <img src={partner1Img} alt={yourName} className="w-full h-full object-cover rounded-full filter grayscale" />
              ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-slate-800"}`}>
                  <span className={`font-luxury-serif text-5xl md:text-7xl font-semibold ${isLight ? "text-slate-650" : "text-slate-400"}`}>{yourName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <span className={`mt-4 font-luxury-serif text-lg md:text-2xl font-bold tracking-wider ${isLight ? "text-slate-800" : "text-slate-400"}`}>{yourName}</span>
          </div>

          {/* Right profile container */}
          <div className="scroll-partner-avatar scroll-partner-right flex flex-col items-center">
            <div className={`w-44 h-44 md:w-56 md:h-56 rounded-full border-4 p-1.5 shadow-2xl relative overflow-hidden flex items-center justify-center ${isLight ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950/80"}`}>
              {partner2Img ? (
                <img src={partner2Img} alt={partnerName} className="w-full h-full object-cover rounded-full filter grayscale" />
              ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-slate-800"}`}>
                  <span className={`font-luxury-serif text-5xl md:text-7xl font-semibold ${isLight ? "text-slate-650" : "text-slate-400"}`}>{partnerName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <span className={`mt-4 font-luxury-serif text-lg md:text-2xl font-bold tracking-wider ${isLight ? "text-slate-800" : "text-slate-400"}`}>{partnerName}</span>
          </div>

          {/* Broken Heart outline drawing in SVG */}
          <div className="breakup-svg-container flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-rose-500/40 fill-none stroke-[0.6] filter drop-shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              {/* Broken heart SVG drawing path */}
              <path className="breakup-heart-path" d="M 50,30 C 35,10 0,15 0,50 C 0,80 35,95 50,100 M 50,30 C 65,10 100,15 100,50 C 100,80 65,95 50,100" />
              {/* Crack overlay in the middle */}
              <path className="breakup-heart-path" d="M 50,30 L 48,45 L 53,58 L 47,72 L 52,88 L 50,100" />
            </svg>
          </div>

          {/* Fading polaroid representing Letting Go */}
          <div className="scroll-sunset-frame flex flex-col items-center">
            <div className={`w-72 h-80 md:w-80 md:h-96 border p-4 pb-10 shadow-2xl rotate-[-2deg] relative ${isLight ? "bg-white border-slate-200" : "bg-[#18181b] border-slate-800"}`}>
              <div className={`w-full h-[85%] overflow-hidden relative border ${isLight ? "bg-slate-50 border-slate-100" : "bg-slate-900 border-slate-800"}`}>
                {sunsetImg ? (
                  <img src={sunsetImg} alt="Sunset Memory" className="w-full h-full object-cover filter grayscale" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center text-center p-4 ${isLight ? "bg-gradient-to-tr from-slate-100 via-slate-50 to-slate-200" : "bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950"}`}>
                    <Sunset className={`w-12 h-12 mb-2 animate-pulse ${isLight ? "text-slate-650" : "text-rose-500/60"}`} />
                    <span className={`font-luxury-serif font-semibold text-lg ${isLight ? "text-slate-850" : "text-slate-400"}`}>Peace &amp; Acceptance</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">THE FINAL CHAPTER</span>
                  </div>
                )}
              </div>
              <div className={`h-[15%] flex items-center justify-center font-luxury-serif text-sm md:text-base italic ${isLight ? "text-slate-800" : "text-slate-400"}`}>
                Wishing you the best, always.
              </div>
            </div>
          </div>

          {/* Cinematic scroll text */}
          <div className="absolute bottom-16 text-center opacity-0 translate-y-8 breakup-scroll-title-text z-20">
            <h2 className={`font-luxury-serif text-4xl md:text-6xl font-normal mb-2 tracking-wide ${textTitle}`}>Paths Diverge. Memories Stay.</h2>
            <p className={`font-luxury-serif italic text-lg md:text-2xl font-light ${textMuted}`}>Accepting the ending, and moving forward in peace.</p>
          </div>

        </div>
      </div>

      {/* FINAL FAREWELL INTERACTIVE NOTE */}
      <section id="breakup-envelope-section" className="py-24 md:py-32 px-4 relative z-20 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <span className={`font-luxury-serif italic text-2xl tracking-wider mb-2 block ${isLight ? "text-slate-600" : "text-slate-450"}`}>A Private Message</span>
            <h2 className={`font-luxury-serif text-4xl md:text-6xl font-normal tracking-wide ${textTitle}`}>A Final Farewell Note</h2>
            <div className={`w-24 h-[1px] mx-auto mt-6 ${isLight ? "bg-slate-300" : "bg-slate-800"}`}></div>
          </div>

          {/* Interactive Envelope layout */}
          <div className="flex flex-col items-center justify-center py-12 relative">
            {!envelopeOpen && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none z-30">
                <span className="text-[10px] md:text-xs bg-slate-800 dark:bg-slate-700 text-white font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-slate-900/30 border border-slate-650">Click to Open</span>
                <span className="text-2xl">👇</span>
              </div>
            )}
            <div 
              className={`breakup-envelope-wrapper hover-target ${envelopeOpen ? 'open' : ''}`}
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
            >
              <div className="breakup-envelope">
                <div className="breakup-envelope-flap"></div>
                <div className="breakup-envelope-front"></div>
                <div className="breakup-envelope-sides"></div>
                <div className="breakup-envelope-sides-right"></div>
                
                <div 
                  className="breakup-letter-paper font-luxury-serif italic flex flex-col justify-between"
                  onClick={(e) => {
                    if (envelopeOpen) e.stopPropagation();
                  }}
                >
                  <div className={`text-xs tracking-wider border-b pb-2 mb-2 flex justify-between font-poppins not-italic ${isLight ? "border-slate-200 text-slate-500" : "border-slate-700/15 text-slate-400"}`}>
                    <span>A Peaceful Release</span>
                    <span>{new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p className={`text-sm md:text-base leading-relaxed line-clamp-6 md:line-clamp-none font-medium overflow-y-auto ${isLight ? "text-slate-750" : "text-slate-300"}`}>
                    {message}
                  </p>
                  <div className={`text-right text-xs font-poppins not-italic border-t pt-2 mt-2 ${isLight ? "border-slate-200 text-slate-500" : "border-slate-700/15 text-slate-400"}`}>
                    <span>With peace, {yourName}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-8 text-center">
              {envelopeOpen ? "Click envelope to close letter" : "Click envelope to open letter"}
            </p>
            {/* Send Reply Button */}
            <div className="mt-6 flex justify-center">
              <a 
                href={`/create?category=breakup&yourName=${encodeURIComponent(partnerName)}&partnerName=${encodeURIComponent(yourName)}&relationshipDate=${encodeURIComponent(relationshipDate || "")}&isReply=true`}
                className="hover-target px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-650 text-white font-poppins text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300 shadow-md flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Reply
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE CHAPTERS */}
      <section className="py-24 md:py-32 px-4 relative z-20 max-w-3xl mx-auto">
        <div className="text-center mb-20">
          <span className={`font-luxury-serif italic text-2xl tracking-wider mb-2 block ${isLight ? "text-slate-600" : "text-slate-450"}`}>Our Chronicle</span>
          <h2 className={`font-luxury-serif text-4xl md:text-6xl font-normal tracking-wide ${textTitle}`}>The Timeline</h2>
          <div className={`w-24 h-[1px] mx-auto mt-6 ${isLight ? "bg-slate-300" : "bg-slate-800"}`}></div>
        </div>

        <div className="space-y-12">
          {[
            {
              chapter: "Chapter I: The Spark",
              title: "Where It All Began",
              desc: "A brief meeting, a shared glance, and the sudden warmth of realizing someone new had entered the story.",
            },
            {
              chapter: "Chapter II: The Glow",
              title: "Under the Sun",
              desc: "Days filled with infinite conversation, building a foundation of shared laughter, hopes, and promises.",
            },
            {
              chapter: "Chapter III: The Drift",
              title: "Quiet Spaces",
              desc: "The slow realization that paths diverge, and sometimes holding on tightly does not change the direction of the wind.",
            },
            {
              chapter: "Chapter IV: The Acceptance",
              title: "Letting Go",
              desc: "Recognizing that some people enter our lives as beautiful chapters, not the whole book. Wishing peace to both journeys.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="p-8 breakup-glass-card rounded-2xl border flex flex-col md:flex-row md:items-start gap-4 hover-target breakup-glass-hover"
            >
              <div className={`text-xs font-mono uppercase tracking-widest w-36 shrink-0 mt-1 ${isLight ? "text-slate-600" : "text-slate-500"}`}>
                {item.chapter}
              </div>
              <div className="space-y-2">
                <h3 className={`text-lg font-bold font-luxury-serif uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                  {item.title}
                </h3>
                <p className={`font-luxury-serif text-xs md:text-sm leading-relaxed italic ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ENDING STATEMENT */}
      <section className="py-24 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="max-w-xl mx-auto space-y-6"
        >
          <BookOpen className="w-5 h-5 mx-auto text-slate-500" />
          <h2 className={`font-luxury-serif text-xl md:text-2xl leading-relaxed italic ${isLight ? "text-slate-800" : "text-slate-400"}`}>
            "Some things are beautiful precisely because they are temporary."
          </h2>
          <div className="pt-6 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
            End of Record
          </div>
        </motion.div>
      </section>

      {/* Dynamic Custom Fields */}
      {customFields && customFields.length > 0 && (
        <section className={`py-20 px-4 relative z-20 border-t ${isLight ? "border-slate-200" : "border-slate-900/40"}`}>
          <div className="max-w-xl mx-auto text-center">
            <span className={`font-luxury-serif italic text-xl tracking-wider mb-2 block ${isLight ? "text-slate-650" : "text-slate-500"}`}>Details</span>
            <h2 className={`font-luxury-serif text-3xl md:text-4xl font-normal tracking-wide mb-10 ${isLight ? "text-slate-900" : "text-white"}`}>Additional Records</h2>
            
            <div className="space-y-6">
              {customFields.map((field, idx) => {
                const link = getLinkUrl(field.value);
                return (
                  <div 
                    key={idx} 
                    className="breakup-glass-card rounded-2xl p-6 border shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <h4 className="font-poppins font-semibold text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      {field.label}
                    </h4>
                    {link ? (
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center gap-1.5 font-luxury-serif italic text-lg hover:text-slate-500 underline underline-offset-4 decoration-slate-500/40 hover:decoration-slate-500 transition-all duration-300 break-all ${isLight ? "text-slate-800" : "text-slate-250"}`}
                      >
                        {field.value.length > 35 ? "Click to view details" : field.value} ↗
                      </a>
                    ) : (
                      <p className={`font-luxury-serif text-base md:text-lg leading-relaxed whitespace-pre-line ${isLight ? "text-slate-750" : "text-slate-350"}`}>
                        {field.value}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Gallery Section */}
      {images && images.length > 0 && (
        <section className={`py-24 md:py-32 px-4 relative z-20 border-t ${isLight ? "border-slate-200" : "border-slate-900/40"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className={`font-luxury-serif italic text-2xl tracking-wider mb-2 block ${isLight ? "text-slate-650" : "text-slate-500"}`}>Echoes of Yesterday</span>
              <h2 className={`font-luxury-serif text-4xl md:text-6xl font-normal tracking-wide ${textTitle}`}>Our Gallery</h2>
              <p className={`font-sans text-[10px] tracking-widest uppercase mt-2 ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                Moments recorded in the pages of our time
              </p>
              <div className={`w-24 h-[1px] mx-auto mt-6 ${isLight ? "bg-slate-200" : "bg-slate-800"}`}></div>
            </div>

            <div className={`grid gap-6 ${
              images.length === 1 
                ? "grid-cols-1 max-w-xl mx-auto" 
                : images.length === 2 
                ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto" 
                : images.length === 3 
                ? "grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto" 
                : "grid-cols-2 md:grid-cols-4"
            }`}>
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="breakup-glass-card overflow-hidden rounded-2xl border aspect-[4/5] relative group"
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 filter grayscale-[30%]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="font-luxury-serif text-white italic text-lg">Record #0{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className={`py-12 relative z-20 border-t ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950/10 border-slate-900"}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`font-luxury-serif text-lg tracking-[0.2em] ${isLight ? "text-slate-800" : "text-slate-400"}`}>{yourName ? yourName.charAt(0).toUpperCase() : 'R'}</span>
            <Sunset className="w-4 h-4 text-slate-500" />
            <span className={`font-luxury-serif text-lg tracking-[0.2em] ${isLight ? "text-slate-800" : "text-slate-400"}`}>{partnerName ? partnerName.charAt(0).toUpperCase() : 'C'}</span>
          </div>
          <div className="my-5">
            <a 
              href="/create"
              className={`hover-target inline-flex items-center gap-2 px-5 py-2 border rounded-full font-mono text-[10px] tracking-wider uppercase transition-all duration-300 shadow-sm ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-800 hover:text-white" : "border-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
            >
              <span>Create Your Own Special Page ✨</span>
            </a>
          </div>
          <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
            Logged via HeartPage &middot; 7D TTL Active
          </p>
        </div>
      </footer>

      {/* AMBIENT AUDIO PLAYER WIDGET */}
      <div id="breakup-ambient-player" className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-white/10 dark:bg-slate-950/20 backdrop-blur-md border border-white/20 p-2.5 rounded-full shadow-2xl hover:bg-white/20 dark:hover:bg-slate-950/30 transition-all duration-300 hover-target">
        <div className={`w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center relative overflow-hidden border border-slate-700 shadow-lg ${isPlaying ? 'vinyl-spinning' : ''}`}>
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-rose-500"></div>
          </div>
        </div>
        <div className="player-meta flex flex-col pr-4 select-none max-w-0 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
          <span className="font-poppins text-[9px] text-slate-400 tracking-wider uppercase font-medium">Ambient Music</span>
          <span className="font-luxury-serif text-xs text-white italic font-semibold">Melancholic piano theme</span>
        </div>
        <button 
          onClick={toggleAudio}
          className="w-8 h-8 rounded-full bg-slate-500/10 hover:bg-slate-500/20 flex items-center justify-center text-slate-400 transition-all duration-300 cursor-pointer"
        >
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-slate-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {/* Acoustic audio theme source */}
        <audio ref={audioRef} loop preload="auto">
          <source src="https://assets.mixkit.co/music/preview/mixkit-sad-piano-theme-1655.mp3" type="audio/mp3" />
        </audio>
      </div>

    </div>
  );
}
