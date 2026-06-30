"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, MessageCircle, Heart, Star, Compass, Music, Volume2, VolumeX, Share2, Award, Smile, Mail } from "lucide-react";
import confetti from "canvas-confetti";

interface FriendTemplateProps {
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  theme: "light" | "dark";
  isPreview?: boolean;
}

export default function FriendTemplate({
  yourName = "Sam",
  partnerName = "Taylor",
  relationshipDate = "2020-09-15",
  message = "You are the cheese to my macaroni, the partner in crime for all my terrible ideas. Thanks for always being there!",
  images = [],
  theme = "light",
  isPreview = false,
}: FriendTemplateProps) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Friendship time counter state
  const [friendTime, setFriendTime] = useState({
    years: "00",
    months: "00",
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  const [nextAnniversary, setNextAnniversary] = useState({
    days: "000",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  // Calculate parsed start date from props
  const startDate = useMemo(() => {
    let parsedDate = new Date('2020-09-15T00:00:00');
    if (relationshipDate) {
      const d = new Date(relationshipDate);
      if (!isNaN(d.getTime())) {
        if (!relationshipDate.includes("T")) {
          d.setHours(0, 0, 0, 0);
        }
        parsedDate = d;
      }
    }
    return parsedDate;
  }, [relationshipDate]);

  // Initials configuration
  const initials = `${yourName ? yourName.charAt(0).toUpperCase() : 'S'}&${partnerName ? partnerName.charAt(0).toUpperCase() : 'T'}`;

  // Image assets mapping
  const heroBg = images && images.length > 0 ? images[0] : null;
  const friend1Img = images && images.length > 1 ? images[1] : null;
  const friend2Img = images && images.length > 2 ? images[2] : null;
  const collageImg = images && images.length > 3 ? images[3] : null;

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

  // Friendship counter & Anniversary timer
  useEffect(() => {
    const updateCounters = () => {
      const now = new Date();

      // Time since friendship started
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();
      let hours = now.getHours() - startDate.getHours();
      let minutes = now.getMinutes() - startDate.getMinutes();
      let seconds = now.getSeconds() - startDate.getSeconds();

      if (seconds < 0) {
        minutes--;
        seconds += 60;
      }
      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      if (hours < 0) {
        days--;
        hours += 24;
      }
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      setFriendTime({
        years: String(Math.max(0, years)).padStart(2, '0'),
        months: String(Math.max(0, months)).padStart(2, '0'),
        days: String(Math.max(0, days)).padStart(2, '0'),
        hours: String(Math.max(0, hours)).padStart(2, '0'),
        minutes: String(Math.max(0, minutes)).padStart(2, '0'),
        seconds: String(Math.max(0, seconds)).padStart(2, '0')
      });

      // Next Anniversary Countdown
      let targetYear = now.getFullYear();
      const annMonth = startDate.getMonth();
      const annDay = startDate.getDate();

      let annDate = new Date(targetYear, annMonth, annDay, 0, 0, 0);
      if (now > annDate) {
        targetYear++;
        annDate = new Date(targetYear, annMonth, annDay, 0, 0, 0);
      }

      const diff = annDate.getTime() - now.getTime();
      const annDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const annHours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const annMins = Math.floor((diff / (1000 * 60)) % 60);
      const annSecs = Math.floor((diff / 1000) % 60);

      setNextAnniversary({
        days: String(Math.max(0, annDays)).padStart(3, '0'),
        hours: String(Math.max(0, annHours)).padStart(2, '0'),
        minutes: String(Math.max(0, annMins)).padStart(2, '0'),
        seconds: String(Math.max(0, annSecs)).padStart(2, '0')
      });
    };

    updateCounters();
    const interval = setInterval(updateCounters, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // Main scroll, cursor, particles & GSAP engine
  useEffect(() => {
    let active = true;
    let lenisInstance: any = null;
    let mmContext: any = null;
    let starsFrameId: number | null = null;
    let particlesFrameId: number | null = null;

    let resizeStars: (() => void) | null = null;
    let resizeParticles: (() => void) | null = null;
    let mouseMoveCursor: ((e: MouseEvent) => void) | null = null;
    let mouseOverRoot: ((e: MouseEvent) => void) | null = null;
    let mouseOutRoot: ((e: MouseEvent) => void) | null = null;

    const mainContainer = document.getElementById('friend-website-root');

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

      // Smooth scroll engine setup
      if (!isPreview) {
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
      const cursor = document.getElementById('friend-cursor');
      const follower = document.getElementById('friend-cursor-follower');

      let cursorX: any, cursorY: any, followerX: any, followerY: any;
      if (cursor && follower && !isPreview) {
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

      // Event delegation for cursor hover state
      if (mainContainer && !isPreview) {
        mouseOverRoot = (e: MouseEvent) => {
          const target = (e.target as HTMLElement).closest('.hover-target');
          if (target && cursor && follower) {
            gsap.to(cursor, { width: 12, height: 12, backgroundColor: "#38bdf8", duration: 0.2 });
            gsap.to(follower, { width: 55, height: 55, borderColor: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.08)", duration: 0.2 });
          }
        };
        mouseOutRoot = (e: MouseEvent) => {
          const target = (e.target as HTMLElement).closest('.hover-target');
          if (target && cursor && follower) {
            gsap.to(cursor, { width: 8, height: 8, backgroundColor: "#0ea5e9", duration: 0.2 });
            gsap.to(follower, { width: 40, height: 40, borderColor: "rgba(14, 165, 233, 0.3)", backgroundColor: "transparent", duration: 0.2 });
          }
        };
        mainContainer.addEventListener('mouseover', mouseOverRoot);
        mainContainer.addEventListener('mouseout', mouseOutRoot);
      }

      // Parallax for hero backdrop
      const parallaxImg = document.getElementById('friend-hero-img');
      if (parallaxImg) {
        gsap.to(parallaxImg, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: "#friend-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Preloader animation
      const preloader = document.getElementById("friend-preloader");
      const progress = document.getElementById("friend-preloader-progress");

      if (preloader && progress && !isPreview) {
        setTimeout(() => { if (progress) progress.style.width = "40%"; }, 150);
        setTimeout(() => { if (progress) progress.style.width = "75%"; }, 500);
        setTimeout(() => { if (progress) progress.style.width = "100%"; }, 1000);
        setTimeout(() => {
          if (preloader) preloader.classList.add("opacity-0", "pointer-events-none");
          gsap.fromTo('.animate-friend-init',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
          );
        }, 1600);
      } else {
        gsap.fromTo('.animate-friend-init',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
        );
      }

      // Floating Stars Background Canvas
      const starsCanvas = document.getElementById("stars-canvas") as HTMLCanvasElement | null;
      if (starsCanvas) {
        const sCtx = starsCanvas.getContext("2d");
        if (sCtx) {
          let stars: StarParticle[] = [];
          const maxStars = 40;

          resizeStars = () => {
            starsCanvas.width = window.innerWidth;
            starsCanvas.height = window.innerHeight;
          };
          window.addEventListener("resize", resizeStars);
          resizeStars();

          class StarParticle {
            x!: number;
            y!: number;
            size!: number;
            speedY!: number;
            speedX!: number;
            angle!: number;
            spin!: number;
            opacity!: number;
            color!: string;

            constructor() {
              this.reset();
              this.y = Math.random() * starsCanvas!.height;
            }

            reset() {
              this.x = Math.random() * starsCanvas!.width;
              this.y = -20;
              this.size = Math.random() * 5 + 3;
              this.speedY = Math.random() * 0.8 + 0.4;
              this.speedX = Math.random() * 0.8 - 0.4;
              this.angle = Math.random() * Math.PI * 2;
              this.spin = Math.random() * 0.03 - 0.015;
              this.opacity = Math.random() * 0.5 + 0.2;
              this.color = Math.random() > 0.5 ? "rgba(56, 189, 248, 0.45)" : "rgba(251, 191, 36, 0.45)"; // Blue / gold
            }

            update() {
              this.y += this.speedY;
              this.x += this.speedX;
              this.angle += this.spin;

              if (this.y > starsCanvas!.height + 20 || this.x < -20 || this.x > starsCanvas!.width + 20) {
                this.reset();
              }
            }

            draw() {
              if (!sCtx) return;
              sCtx.save();
              sCtx.translate(this.x, this.y);
              sCtx.rotate(this.angle);
              sCtx.globalAlpha = this.opacity;
              sCtx.fillStyle = this.color;
              sCtx.beginPath();
              for (let i = 0; i < 5; i++) {
                sCtx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
                sCtx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size * 0.4), -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size * 0.4));
              }
              sCtx.closePath();
              sCtx.fill();
              sCtx.restore();
            }
          }

          for (let i = 0; i < maxStars; i++) {
            stars.push(new StarParticle());
          }

          const animateStars = () => {
            sCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
            stars.forEach(s => {
              s.update();
              s.draw();
            });
            starsFrameId = requestAnimationFrame(animateStars);
          };
          animateStars();
        }
      }

      // GSAP Pinned Scroll Animation configuration
      const friendParticlesCanvas = document.getElementById("friend-particles-canvas") as HTMLCanvasElement | null;
      if (friendParticlesCanvas) {
        const ptCtx = friendParticlesCanvas.getContext("2d");
        if (ptCtx) {
          let particles: SparkDust[] = [];
          let baseCount = 45;
          let burstActivated = false;

          resizeParticles = () => {
            if (friendParticlesCanvas.parentElement) {
              friendParticlesCanvas.width = friendParticlesCanvas.parentElement.clientWidth;
              friendParticlesCanvas.height = friendParticlesCanvas.parentElement.clientHeight;
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
              if (!isBurst && friendParticlesCanvas) {
                this.y = Math.random() * friendParticlesCanvas.height;
              }
            }

            reset() {
              if (friendParticlesCanvas) {
                if (this.isBurst) {
                  this.x = friendParticlesCanvas.width / 2;
                  this.y = friendParticlesCanvas.height / 2;
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 7 + 2.5;
                  this.speedX = Math.cos(angle) * speed;
                  this.speedY = Math.sin(angle) * speed;
                  this.size = Math.random() * 4 + 1.5;
                  this.decay = Math.random() * 0.016 + 0.006;
                  this.color = Math.random() > 0.5 ? "#38bdf8" : "#fbbf24";
                } else {
                  this.x = Math.random() * friendParticlesCanvas.width;
                  this.y = friendParticlesCanvas.height + 10;
                  this.speedY = -(Math.random() * 1.2 + 0.4);
                  this.speedX = Math.random() * 0.8 - 0.4;
                  this.size = Math.random() * 2.5 + 0.8;
                  this.decay = 0;
                  this.color = "#38bdf8";
                }
              }
              this.opacity = Math.random() * 0.8 + 0.2;
            }

            update() {
              if (this.isBurst) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.speedX *= 0.95;
                this.speedY *= 0.95;
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
            for (let i = 0; i < 100; i++) {
              particles.push(new SparkDust(true));
            }
          };

          const animateParticles = () => {
            ptCtx.clearRect(0, 0, friendParticlesCanvas.width, friendParticlesCanvas.height);
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
          gsap.set(".friend-star-path", { strokeDashoffset: 1000 });
          gsap.set(".friend-svg-container", { xPercent: -50, yPercent: -50, scale: 0.8 });
          gsap.set(".scroll-collage-frame", { xPercent: -50, yPercent: -50, scale: 0.9 });

          mmContext.add({
            isDesktop: "(min-width: 769px)",
            isMobile: "(max-width: 768px)"
          }, (context: any) => {
            const { isDesktop } = context.conditions;

            const startX1 = isDesktop ? "-16vw" : "-35vw";
            const startX2 = isDesktop ? "16vw" : "35vw";
            const targetX1 = isDesktop ? "20vw" : "14vw";
            const targetX2 = isDesktop ? "-20vw" : "-14vw";

            gsap.set(".scroll-friend-left", { x: startX1, scale: 0.95 });
            gsap.set(".scroll-friend-right", { x: startX2, scale: 0.95 });

            const scrollTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: "#friend-scroll-container",
                start: "top top",
                end: "+=360%",
                scrub: 1.2,
                pin: true,
                anticipatePin: 1,
                scroller: isPreview ? ".simulated-scrollable-container" : window,
                onUpdate: (self: any) => {
                  handleScrollBurst(self.progress);
                }
              }
            });

            scrollTimeline
              .to(".scroll-friend-left", { x: targetX1, scale: 1.05, ease: "power1.inOut" }, 0)
              .to(".scroll-friend-right", { x: targetX2, scale: 1.05, ease: "power1.inOut" }, 0)
              .to(".friend-scroll-glow", { opacity: 0.8, scale: 1.25, ease: "power1.inOut" }, 0)
              .to(".friend-scroll-bg-overlay", { opacity: 0, ease: "power1.inOut" }, 0)
              .to(".scroll-friend-left, .scroll-friend-right", {
                opacity: 0,
                filter: "blur(12px)",
                scale: 1.1,
                ease: "power1.in"
              }, 0.5)
              .to(".friend-svg-container", { opacity: 1, scale: 1, ease: "power1.out" }, 0.52)
              .to(".friend-star-path", { strokeDashoffset: 0, ease: "power1.inOut" }, 0.52)
              .to(".friend-svg-container", { scale: 1.2, filter: "blur(8px)", opacity: 0, ease: "power1.in" }, 0.72)
              .to(".scroll-collage-frame", { opacity: 1, scale: 1, ease: "power2.out" }, 0.74)
              .to(".friend-scroll-title-text", { opacity: 1, y: 0, ease: "power2.out" }, 0.80)
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
      if (resizeStars) window.removeEventListener("resize", resizeStars);
      if (resizeParticles) window.removeEventListener("resize", resizeParticles);
      if (mouseMoveCursor) window.removeEventListener("mousemove", mouseMoveCursor);
      if (mouseOverRoot && mainContainer) mainContainer.removeEventListener("mouseover", mouseOverRoot);
      if (mouseOutRoot && mainContainer) mainContainer.removeEventListener("mouseout", mouseOutRoot);
      if (starsFrameId) cancelAnimationFrame(starsFrameId);
      if (particlesFrameId) cancelAnimationFrame(particlesFrameId);
    };
  }, [startDate, images, isPreview]);

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

  const handleBadgeCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#38bdf8", "#0ea5e9", "#fbbf24", "#f43f5e"]
    });
  };

  return (
    <div id="friend-website-root" className="bg-[#FAFDFE] selection:bg-sky-100 selection:text-slate-900 min-h-screen w-full relative overflow-x-hidden font-poppins">
      
      {/* Dynamic Style tags for scoped styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-bg-base: ${theme === "dark" ? "#0a0f1d" : "#FAFDFE"};
          --color-text-main: ${theme === "dark" ? "#f8fafc" : "#0f172a"};
          --color-text-sub: ${theme === "dark" ? "#94a3b8" : "#475569"};
          --color-glass-card: ${theme === "dark" ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.55)"};
          --color-glass-border: ${theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(56, 189, 248, 0.15)"};
        }

        #friend-website-root {
          background-color: var(--color-bg-base) !important;
          color: var(--color-text-main) !important;
        }

        /* Custom cursor styling */
        .friend-cursor {
          width: 8px;
          height: 8px;
          background-color: #0ea5e9;
          border-radius: 50%;
          position: fixed;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9999;
          transition: width 0.2s, height 0.2s, background-color 0.2s;
        }

        .friend-cursor-follower {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 50%;
          position: fixed;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9998;
          transition: transform 0.08s ease-out;
        }

        /* Particle / canvas layouts */
        #stars-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 5;
        }

        #friend-particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        /* Glassmorphic card custom designs */
        .friend-glass-card {
          background: var(--color-glass-card);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--color-glass-border);
          box-shadow: 0 12px 35px 0 rgba(56, 189, 248, 0.04);
        }

        .friend-glass-hover {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .friend-glass-hover:hover {
          background: ${theme === "dark" ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.7)"};
          transform: translateY(-6px);
          box-shadow: 0 20px 45px 0 rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.35);
        }

        /* Custom Scroll anim layouts */
        #friend-scroll-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-bg-base);
        }

        .scroll-pin-section {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
          position: relative;
        }

        .scroll-friend-avatar {
          position: absolute;
          z-index: 10;
          transition: transform 0.1s ease;
        }

        .friend-svg-container {
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

        .friend-star-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        .scroll-collage-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          z-index: 12;
          opacity: 0;
        }

        /* Ambient vinyl disk animation */
        .vinyl-playing {
          animation: spin-vinyl 12s linear infinite;
        }
        @keyframes spin-vinyl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        #friend-ambient-player:hover .player-meta {
          max-w: 160px;
        }

        /* Letter Envelope animation styling */
        .friend-envelope-wrapper {
          position: relative;
          width: 320px;
          height: 220px;
          background-color: ${theme === "dark" ? "#1e293b" : "#e2e8f0"};
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          border-radius: 6px;
          cursor: pointer;
          perspective: 1000px;
          transition: transform 0.5s ease;
        }

        .friend-envelope {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: ${theme === "dark" ? "#0f172a" : "#cbd5e1"};
          border-radius: 6px;
          transform-style: preserve-3d;
        }

        .friend-envelope-front {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-bottom: 110px solid ${theme === "dark" ? "#1e293b" : "#f1f5f9"};
          bottom: 0;
          left: 0;
          transform: translateZ(3px);
        }

        .friend-envelope-sides {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 110px solid transparent;
          border-bottom: 110px solid transparent;
          border-left: 160px solid ${theme === "dark" ? "#1b2436" : "#e2e8f0"};
          top: 0;
          left: 0;
          transform: translateZ(2px);
        }

        .friend-envelope-sides-right {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 110px solid transparent;
          border-bottom: 110px solid transparent;
          border-right: 160px solid ${theme === "dark" ? "#1b2436" : "#e2e8f0"};
          top: 0;
          right: 0;
          transform: translateZ(2px);
        }

        .friend-envelope-flap {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-top: 110px solid ${theme === "dark" ? "#334155" : "#94a3b8"};
          top: 0;
          left: 0;
          transform-origin: top;
          transform: translateZ(4px) rotateX(0deg);
          transition: transform 0.4s ease 0s;
        }

        .friend-letter-paper {
          position: absolute;
          width: 290px;
          height: 185px;
          background: ${theme === "dark" ? "#0f172a" : "#ffffff"};
          left: 15px;
          bottom: 10px;
          padding: 22px;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid rgba(14, 165, 233, 0.2);
          transform: translateZ(1px);
          transition: transform 0.4s ease 0s, height 0.4s ease 0s;
        }

        /* Open states */
        .friend-envelope-wrapper.open .friend-envelope-flap {
          transform: translateZ(0px) rotateX(180deg);
        }

        .friend-envelope-wrapper.open .friend-letter-paper {
          transform: translateZ(5px) translateY(-135px) scale(1.04);
          height: 250px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.35);
          transition: transform 0.4s ease 0.3s, height 0.4s ease 0.3s;
        }

        /* Film grain */
        .friend-grain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9990;
        }
      ` }} />

      {/* Live Preview Mode header banner */}
      {isPreview && (
        <div className="sticky top-0 z-[10000] w-full bg-sky-500 text-white text-center py-1.5 text-xs font-semibold uppercase tracking-widest shadow-md">
          Live Preview Mode
        </div>
      )}

      {/* Film Grain overlay */}
      <div className="friend-grain"></div>

      {/* Custom Cursor Followers (Hidden in preview mode) */}
      {!isPreview && (
        <>
          <div className="friend-cursor hidden md:block" id="friend-cursor"></div>
          <div className="friend-cursor-follower hidden md:block" id="friend-cursor-follower"></div>
        </>
      )}

      {/* Floating Canvas Stars background */}
      <canvas id="stars-canvas"></canvas>

      {/* Premium Calligraphy Monogram Preloader */}
      {!isPreview && (
        <div id="friend-preloader" className="fixed inset-0 bg-[#090D1A] z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out">
          <div className="text-center flex flex-col items-center px-4">
            <div className="w-20 h-20 border border-sky-500/30 rounded-full flex items-center justify-center mb-6 bg-white/5 backdrop-blur-sm animate-pulse">
              <span className="font-luxury-serif text-3xl text-sky-400 tracking-widest">{initials}</span>
            </div>
            <h2 className="font-sans text-xl md:text-2xl text-white tracking-[0.2em] uppercase font-bold">{yourName} &amp; {partnerName}</h2>
            <p className="font-luxury-serif italic text-sky-300/60 text-base mt-2">Loading Our Memories...</p>
            <div className="w-48 h-[1px] bg-white/10 mt-8 relative overflow-hidden">
              <div id="friend-preloader-progress" className="absolute left-0 top-0 h-full w-0 bg-sky-500 transition-all duration-500 ease-out"></div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="friend-hero" className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Parallax Hero Background */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {heroBg ? (
            <img src={heroBg} alt="Hero Backdrop" className="w-full h-full object-cover scale-105 filter blur-[2px] brightness-[0.80] saturate-[0.90]" id="friend-hero-img" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-sky-950 via-slate-900 to-indigo-950 scale-105" id="friend-hero-img" />
          )}
          {/* Radial overlays for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#090f1d_100%)] opacity-85"></div>
        </div>

        {/* Ambient Radial Lights */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl px-4 mt-8 flex flex-col items-center">
          
          {/* Monogram Badge */}
          <div className="w-16 h-16 border border-sky-400/30 rounded-full flex items-center justify-center mb-8 backdrop-blur-md bg-white/5 opacity-0 translate-y-8 animate-friend-init hover-target transition-all hover:border-sky-400">
            <span className="font-luxury-serif text-2xl text-white font-medium tracking-widest">{initials}</span>
          </div>

          {/* Heading title */}
          <h1 className="font-luxury-serif text-5xl md:text-8xl text-white font-normal mb-6 tracking-wide leading-tight opacity-0 translate-y-8 animate-friend-init delay-1">
            {yourName} <span className="italic text-sky-400 font-light">&amp;</span> {partnerName}
          </h1>

          {/* Custom letters/text */}
          <p className="font-luxury-serif italic text-xl md:text-2xl text-sky-100/90 font-light max-w-2xl mb-10 tracking-wide leading-relaxed opacity-0 translate-y-8 animate-friend-init delay-2">
            "{message || "Real friendship is when you walk into their house and your WiFi connects automatically."}"
          </p>

          {/* CTA Trigger */}
          <a href="#friend-scroll-container" className="hover-target px-8 py-4 bg-sky-500/10 hover:bg-sky-500 hover:text-white backdrop-blur-md border border-sky-400/40 text-sky-300 font-poppins text-xs tracking-[0.25em] uppercase rounded-full transition-all duration-500 mb-16 opacity-0 translate-y-8 animate-friend-init delay-3 shadow-lg shadow-sky-500/5">
            Begin the Shenanigans
          </a>

          {/* Friendship statistics card */}
          <div className="friend-glass-card rounded-2xl p-6 md:p-8 w-full max-w-3xl border border-white/10 shadow-2xl opacity-0 translate-y-8 animate-friend-init delay-4 hover-target">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-sky-500/20">
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase mb-2">Besties Since</h3>
                <p className="font-luxury-serif text-base md:text-xl text-white font-medium">
                  {startDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="px-4 text-center border-t border-b border-sky-500/10 py-4 md:py-0 md:border-none">
                <h3 className="font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase mb-2">Shenanigans</h3>
                <p className="font-luxury-serif text-base md:text-xl text-white font-medium">Infinite Memories</p>
              </div>
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase mb-2">Anniversary</h3>
                <p className="font-luxury-serif text-base md:text-xl text-white font-medium">
                  {startDate.toLocaleDateString("en-US", { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PINNED SCROLL ANIMATION ROW */}
      <div id="friend-scroll-container" className="scroll-container hover-target">
        {/* Radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full aurora-glow-1 opacity-0 friend-scroll-glow pointer-events-none"></div>
        <div className="absolute inset-0 bg-slate-950/40 friend-scroll-bg-overlay pointer-events-none"></div>

        {/* Custom Canvas sparkler engine */}
        <canvas id="friend-particles-canvas"></canvas>

        <div className="scroll-pin-section">
          
          {/* Left Avatar profile */}
          <div className="scroll-friend-avatar scroll-friend-left flex flex-col items-center">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-full border-4 border-sky-400/80 p-1.5 bg-slate-900/60 shadow-2xl relative overflow-hidden flex items-center justify-center">
              {friend1Img ? (
                <img src={friend1Img} alt={yourName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center">
                  <span className="font-luxury-serif text-5xl md:text-7xl text-white font-semibold">{yourName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <span className="mt-4 font-luxury-serif text-lg md:text-2xl text-white font-bold tracking-wider">{yourName}</span>
          </div>

          {/* Right Avatar profile */}
          <div className="scroll-friend-avatar scroll-friend-right flex flex-col items-center">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-full border-4 border-sky-400/80 p-1.5 bg-slate-900/60 shadow-2xl relative overflow-hidden flex items-center justify-center">
              {friend2Img ? (
                <img src={friend2Img} alt={partnerName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="font-luxury-serif text-5xl md:text-7xl text-white font-semibold">{partnerName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <span className="mt-4 font-luxury-serif text-lg md:text-2xl text-white font-bold tracking-wider">{partnerName}</span>
          </div>

          {/* Golden/Skyblue Star connectors in SVG */}
          <div className="friend-svg-container flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-sky-400 fill-none stroke-[0.6] filter drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]">
              {/* Star Drawing Path */}
              <path className="friend-star-path" d="M 50,5 L 63,38 L 98,38 L 70,58 L 81,93 L 50,72 L 19,93 L 30,58 L 2,38 L 37,38 Z" />
            </svg>
          </div>

          {/* Fading collage frame in the center */}
          <div className="scroll-collage-frame flex flex-col items-center">
            <div className="w-72 h-80 md:w-80 md:h-96 bg-white border border-slate-200 p-4 pb-10 shadow-2xl rotate-2 relative">
              <div className="w-full h-[85%] bg-slate-100 overflow-hidden relative border border-slate-100">
                {collageImg ? (
                  <img src={collageImg} alt="Friend Collage" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-amber-300 flex flex-col items-center justify-center text-center p-4">
                    <Award className="w-12 h-12 text-white mb-2 animate-bounce" />
                    <span className="font-luxury-serif text-white font-semibold text-lg">Partner in Crime Badge</span>
                    <span className="text-[10px] text-white/80 font-mono tracking-widest mt-1">CERTIFIED 100% BESTIES</span>
                  </div>
                )}
              </div>
              <div className="h-[15%] flex items-center justify-center font-luxury-serif text-slate-800 text-base md:text-lg italic font-bold">
                {yourName} &amp; {partnerName}
              </div>
            </div>
          </div>

          {/* Cinematic Title text */}
          <div className="absolute bottom-16 text-center opacity-0 translate-y-8 friend-scroll-title-text z-20">
            <h2 className="font-luxury-serif text-4xl md:text-6xl text-white font-normal mb-2 tracking-wide">Two Braincells. One Story.</h2>
            <p className="font-luxury-serif italic text-lg md:text-2xl text-sky-200/80 font-light">Separated by distance, connected by absolute chaos.</p>
          </div>

        </div>
      </div>

      {/* FRIENDSHIP REAL-TIME COUNTERS */}
      <section className="py-24 md:py-32 px-4 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="font-luxury-serif italic text-2xl text-sky-500 tracking-wider mb-2 block">Our Friendship Timeline</span>
            <h2 className="font-luxury-serif text-4xl md:text-6xl text-slate-900 dark:text-white font-normal tracking-wide">Days of Adventure</h2>
            <div className="w-24 h-[1px] bg-sky-500/30 mx-auto mt-6"></div>
          </div>

          {/* Main timer display */}
          <div className="friend-glass-card rounded-3xl p-8 md:p-12 border shadow-2xl mb-16 relative overflow-hidden hover-target">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-300"></div>
            <p className="font-luxury-serif text-xl text-center text-slate-500 dark:text-slate-400 italic mb-8">Counting our bestie adventures in real-time...</p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
              {/* Years */}
              <div className="friend-glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-inner">
                <span className="block font-luxury-serif text-4xl md:text-6xl text-sky-500 font-semibold mb-2">{friendTime.years}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase">Years</span>
              </div>
              {/* Months */}
              <div className="friend-glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-inner">
                <span className="block font-luxury-serif text-4xl md:text-6xl text-sky-500 font-semibold mb-2">{friendTime.months}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase">Months</span>
              </div>
              {/* Days */}
              <div className="friend-glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-inner">
                <span className="block font-luxury-serif text-4xl md:text-6xl text-sky-500 font-semibold mb-2">{friendTime.days}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase">Days</span>
              </div>
              {/* Hours */}
              <div className="friend-glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-inner">
                <span className="block font-luxury-serif text-4xl md:text-6xl text-sky-500 font-semibold mb-2">{friendTime.hours}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase">Hours</span>
              </div>
              {/* Minutes */}
              <div className="friend-glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-inner">
                <span className="block font-luxury-serif text-4xl md:text-6xl text-sky-500 font-semibold mb-2">{friendTime.minutes}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase">Minutes</span>
              </div>
              {/* Seconds */}
              <div className="friend-glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/30 shadow-inner">
                <span className="block font-luxury-serif text-4xl md:text-6xl text-sky-500 font-semibold mb-2">{friendTime.seconds}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-sky-400 tracking-widest uppercase">Seconds</span>
              </div>
            </div>
          </div>

          {/* Subtimer: Anniversary card */}
          <div className="max-w-3xl mx-auto friend-glass-card rounded-2xl p-6 md:p-8 border shadow-xl hover-target">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-luxury-serif text-xl md:text-2xl text-slate-800 dark:text-white font-medium mb-1">Friendship Day Countdown</h3>
                <p className="font-luxury-serif text-slate-500 dark:text-slate-400 italic text-base">Until we celebrate another milestone of being together.</p>
              </div>
              <div className="flex gap-4 text-center items-center">
                <div>
                  <span className="block font-luxury-serif text-2xl md:text-3xl text-sky-500 font-bold">{nextAnniversary.days}</span>
                  <span className="block font-poppins text-[9px] text-slate-400 tracking-wider uppercase">Days</span>
                </div>
                <span className="text-sky-500 font-light text-xl">:</span>
                <div>
                  <span className="block font-luxury-serif text-2xl md:text-3xl text-sky-500 font-bold">{nextAnniversary.hours}</span>
                  <span className="block font-poppins text-[9px] text-slate-400 tracking-wider uppercase">Hours</span>
                </div>
                <span className="text-sky-500 font-light text-xl">:</span>
                <div>
                  <span className="block font-luxury-serif text-2xl md:text-3xl text-sky-500 font-bold">{nextAnniversary.minutes}</span>
                  <span className="block font-poppins text-[9px] text-slate-400 tracking-wider uppercase">Mins</span>
                </div>
                <span className="text-sky-500 font-light text-xl">:</span>
                <div>
                  <span className="block font-luxury-serif text-2xl md:text-3xl text-sky-500 font-bold">{nextAnniversary.seconds}</span>
                  <span className="block font-poppins text-[9px] text-slate-400 tracking-wider uppercase">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FRIEND ENVELOPE (INTERACTIVE LETTER) */}
      <section id="friend-letter-section" className="py-24 md:py-32 px-4 relative z-20 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <span className="font-luxury-serif italic text-2xl text-sky-500 tracking-wider mb-2 block">A Letter to My Bestie</span>
            <h2 className="font-luxury-serif text-4xl md:text-6xl text-slate-900 dark:text-white font-normal tracking-wide">From Me to You</h2>
            <div className="w-24 h-[1px] bg-sky-500/30 mx-auto mt-6"></div>
          </div>

          {/* Interactive envelope assembly */}
          <div className="flex flex-col items-center justify-center py-12 relative">
            {!envelopeOpen && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none z-30">
                <span className="text-[10px] md:text-xs bg-sky-500 text-white font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-sky-500/30 border border-sky-450">Click to Open</span>
                <span className="text-2xl">👇</span>
              </div>
            )}
            <div 
              className={`friend-envelope-wrapper hover-target ${envelopeOpen ? 'open' : ''}`}
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
            >
              <div className="friend-envelope">
                <div className="friend-envelope-flap"></div>
                <div className="friend-envelope-front"></div>
                <div className="friend-envelope-sides"></div>
                <div className="friend-envelope-sides-right"></div>
                
                <div 
                  className="friend-letter-paper font-luxury-serif text-slate-800 dark:text-slate-200 italic flex flex-col justify-between"
                  onClick={(e) => {
                    if (envelopeOpen) e.stopPropagation();
                  }}
                >
                  <div className="text-xs tracking-wider border-b border-sky-400/15 pb-2 mb-2 flex justify-between font-poppins not-italic text-sky-500">
                    <span>To My Partner In Crime</span>
                    <span>{new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-6 md:line-clamp-none font-medium overflow-y-auto">
                    {message}
                  </p>
                  <div className="text-right text-xs font-poppins not-italic border-t border-sky-400/15 pt-2 mt-2 text-sky-500">
                    <span>Your favorite chaos, {yourName}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-8 text-center">
              {envelopeOpen ? "Click envelope to close letter" : "Click envelope to read letter"}
            </p>
            {/* Send Reply Button */}
            <div className="mt-6 flex justify-center">
              <a 
                href={`/create?category=friends&yourName=${encodeURIComponent(partnerName)}&partnerName=${encodeURIComponent(yourName)}&relationshipDate=${encodeURIComponent(relationshipDate || "")}&isReply=true`}
                className="hover-target px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-poppins text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300 shadow-md shadow-sky-500/25 flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Reply
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SHENANIGANS BENTO GRID */}
      <section className="py-24 md:py-32 px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-luxury-serif italic text-2xl text-sky-500 tracking-wider mb-2 block">Memorable Chapters</span>
            <h2 className="font-luxury-serif text-4xl md:text-6xl text-slate-900 dark:text-white font-normal tracking-wide">Why You're Legendary</h2>
            <div className="w-24 h-[1px] bg-sky-500/30 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento card 1 */}
            <div className="friend-glass-card friend-glass-hover rounded-2xl p-8 border shadow-xl flex flex-col justify-between hover-target">
              <div>
                <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-slate-900 border border-sky-200 flex items-center justify-center mb-6 text-sky-500">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="font-luxury-serif text-2xl text-slate-800 dark:text-white font-normal mb-4">No Filter Needed</h3>
                <p className="font-luxury-serif text-slate-500 dark:text-slate-400 italic text-lg leading-relaxed">
                  With you, I can be my absolute weirdest self. We can spend hours debating completely useless topics or laughing at jokes that nobody else finds funny.
                </p>
              </div>
              <span className="text-sky-500/25 font-luxury-serif text-6xl font-light text-right block mt-6">01</span>
            </div>

            {/* Bento card 2 */}
            <div className="friend-glass-card friend-glass-hover rounded-2xl p-8 border shadow-xl flex flex-col justify-between hover-target mt-0 md:mt-8">
              <div>
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-slate-900 border border-amber-200 flex items-center justify-center mb-6 text-amber-550">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-luxury-serif text-2xl text-slate-800 dark:text-white font-normal mb-4">The Escape Route</h3>
                <p className="font-luxury-serif text-slate-500 dark:text-slate-400 italic text-lg leading-relaxed">
                  Every late-night road trip, grocery store run, or random cafe hang-out gets transformed into a memorable chapter. There is simply zero boredom when we walk together.
                </p>
              </div>
              <span className="text-sky-500/25 font-luxury-serif text-6xl font-light text-right block mt-6">02</span>
            </div>

            {/* Bento card 3 */}
            <div className="friend-glass-card friend-glass-hover rounded-2xl p-8 border shadow-xl flex flex-col justify-between hover-target">
              <div>
                <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-slate-900 border border-sky-200 flex items-center justify-center mb-6 text-sky-500">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-luxury-serif text-2xl text-slate-800 dark:text-white font-normal mb-4">Loyalty Unlocked</h3>
                <p className="font-luxury-serif text-slate-500 dark:text-slate-400 italic text-lg leading-relaxed">
                  No matter how chaotic things get, or how busy our schedules become, knowing I can dial your number at 3 AM and hear your voice is the ultimate reassurance in my life.
                </p>
              </div>
              <span className="text-sky-500/25 font-luxury-serif text-6xl font-light text-right block mt-6">03</span>
            </div>
          </div>
        </div>
      </section>

      {/* BEST FRIENDS INTERACTIVE BADGE */}
      <section className="container mx-auto px-4 py-16 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="relative inline-block">
            <button
              onClick={handleBadgeCelebration}
              className="px-10 py-10 rounded-full border border-sky-400/20 bg-sky-500/5 hover:bg-sky-500/10 text-slate-800 dark:text-white font-luxury-serif font-black text-xl md:text-3xl shadow-xl uppercase tracking-wider cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group hover:border-sky-400/50 transition-all duration-300"
            >
              <Trophy className="w-10 h-10 mb-2 text-sky-400 animate-bounce" />
              <span>Certified</span>
              <span className="text-sky-500 text-2xl md:text-4xl block group-hover:text-sky-400">BESTIES</span>
              <span className="text-[10px] uppercase tracking-widest mt-2 bg-sky-550 text-white px-3 py-1 rounded-full font-sans font-semibold">Click to Celebrate! 🎉</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-950/5 relative z-20 border-t border-sky-500/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 hover-target">
            <span className="font-luxury-serif text-2xl text-sky-500 tracking-[0.2em]">{yourName ? yourName.charAt(0).toUpperCase() : 'S'}</span>
            <Smile className="w-5 h-5 text-sky-500 animate-pulse" />
            <span className="font-luxury-serif text-2xl text-sky-500 tracking-[0.2em]">{partnerName ? partnerName.charAt(0).toUpperCase() : 'T'}</span>
          </div>
          <p className="font-luxury-serif italic text-base text-slate-500 max-w-sm mx-auto">
            "A single loyal friend is worth more than ten thousand relatives."
          </p>
          <div className="my-6">
            <a 
              href="/create"
              className="hover-target inline-flex items-center gap-2 px-5 py-2 border border-sky-400 text-sky-650 hover:bg-sky-500 hover:text-white font-sans text-[11px] tracking-wider uppercase rounded-full transition-all duration-300 shadow-sm"
            >
              <span>Create Your Own Special Page ✨</span>
            </a>
          </div>
          <div className="w-12 h-[1px] bg-sky-500/20 mx-auto my-4"></div>
          <p className="font-sans text-[10px] text-slate-400 tracking-widest uppercase">
            Made with Love • © 2026 {yourName} &amp; {partnerName}
          </p>
        </div>
      </footer>

      {/* AMBIENT AUDIO PLAYER WIDGET */}
      <div id="friend-ambient-player" className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-white/10 dark:bg-slate-950/20 backdrop-blur-md border border-white/20 p-2.5 rounded-full shadow-2xl hover:bg-white/20 dark:hover:bg-slate-950/30 transition-all duration-300 hover-target">
        <div className={`w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center relative overflow-hidden border border-sky-500/20 shadow-lg ${isPlaying ? 'vinyl-playing' : ''}`}>
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-sky-500/20 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-sky-400"></div>
          </div>
        </div>
        <div className="player-meta flex flex-col pr-4 select-none max-w-0 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
          <span className="font-poppins text-[9px] text-sky-400 tracking-wider uppercase font-medium">Ambient Music</span>
          <span className="font-luxury-serif text-xs text-white italic font-semibold">Joyful acoustic theme</span>
        </div>
        <button 
          onClick={toggleAudio}
          className="w-8 h-8 rounded-full bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center text-sky-400 transition-all duration-300 cursor-pointer"
        >
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-sky-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-sky-400" />
          )}
        </button>
        
        {/* Acoustic audio theme source */}
        <audio ref={audioRef} loop preload="auto">
          <source src="https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-interactive-acoustic-guitar-1583.mp3" type="audio/mp3" />
        </audio>
      </div>

    </div>
  );
}
