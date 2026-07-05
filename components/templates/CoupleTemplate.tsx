"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Mail } from "lucide-react";

interface CoupleTemplateProps {
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

export default function CoupleTemplate({
  yourName = "Alex",
  partnerName = "Jordan",
  relationshipDate = "2021-10-12",
  message = "Every single day with you is a gift. From the quiet mornings to the wild adventures, you are my home. Here's to us, our past, and our beautiful future.",
  images = [],
  theme = "light",
  customFields = [],
  isPreview = false,
  musicEnabled = true,
  hideMusicPlayer = false,
  isFullPreview = false,
  selectedMusic,
}: CoupleTemplateProps) {
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

  // States for counters
  const [loveCount, setLoveCount] = useState({
    years: "00",
    months: "00",
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  const [anniversaryCount, setAnniversaryCount] = useState({
    days: "000",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  // Calculate parsed start date from props
  const startDate = useMemo(() => {
    let parsedDate = new Date('2021-10-12T18:30:00');
    if (relationshipDate) {
      const d = new Date(relationshipDate);
      if (!isNaN(d.getTime())) {
        // If relationshipDate has no time, default to 18:30:00 local time
        if (!relationshipDate.includes("T")) {
          d.setHours(18, 30, 0, 0);
        }
        parsedDate = d;
      }
    }
    return parsedDate;
  }, [relationshipDate]);

  // Generate initials
  const initials = `${yourName ? yourName.charAt(0).toUpperCase() : 'A'}&${partnerName ? partnerName.charAt(0).toUpperCase() : 'I'}`;

  // Map images with fallbacks - Uploaded images will only render in the bottom gallery section
  const heroMobileImg = "/mobile_hero_section.webp";
  const heroDesktopImg = "/hero_section_background.webp";
  const boyImg = "/boy.webp";
  const girlImg = "/girl.webp";
  const coupleImg = "/couple.webp";

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

  // Love Counter & Anniversary Countdown logic
  useEffect(() => {
    const updateLoveCounter = () => {
      const now = new Date();

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

      setLoveCount({
        years: String(Math.max(0, years)).padStart(2, '0'),
        months: String(Math.max(0, months)).padStart(2, '0'),
        days: String(Math.max(0, days)).padStart(2, '0'),
        hours: String(Math.max(0, hours)).padStart(2, '0'),
        minutes: String(Math.max(0, minutes)).padStart(2, '0'),
        seconds: String(Math.max(0, seconds)).padStart(2, '0')
      });
    };

    updateLoveCounter();
    const loveInterval = setInterval(updateLoveCounter, 1000);

    const updateAnniversaryCountdown = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      
      const annMonth = startDate.getMonth();
      const annDay = startDate.getDate();
      const annHours = startDate.getHours();
      const annMinutes = startDate.getMinutes();

      let anniversaryDate = new Date(targetYear, annMonth, annDay, annHours, annMinutes, 0);

      if (now > anniversaryDate) {
        targetYear++;
        anniversaryDate = new Date(targetYear, annMonth, annDay, annHours, annMinutes, 0);
      }

      const diff = anniversaryDate.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setAnniversaryCount({
        days: String(Math.max(0, days)).padStart(3, '0'),
        hours: String(Math.max(0, hours)).padStart(2, '0'),
        minutes: String(Math.max(0, mins)).padStart(2, '0'),
        seconds: String(Math.max(0, secs)).padStart(2, '0')
      });
    };

    updateAnniversaryCountdown();
    const annInterval = setInterval(updateAnniversaryCountdown, 1000);

    return () => {
      clearInterval(loveInterval);
      clearInterval(annInterval);
    };
  }, [startDate]);

  // Dynamically load Google Fonts on mount to avoid re-renders reloading the fonts and causing page flickering/layout shifts
  useEffect(() => {
    const linkId = "google-fonts-couple";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Poppins:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Main interactive scripts (GSAP, Lenis, Petals, Dust Particles)
  useEffect(() => {
    let active = true;
    let lenisInstance: any = null;
    let mmContext: any = null;
    let petalsFrameId: number | null = null;
    let particlesFrameId: number | null = null;

    let resizePetals: (() => void) | null = null;
    let resizeParticles: (() => void) | null = null;
    let mouseMoveCursor: ((e: MouseEvent) => void) | null = null;
    let mouseOverRoot: ((e: MouseEvent) => void) | null = null;
    let mouseOutRoot: ((e: MouseEvent) => void) | null = null;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const mainContainer = document.getElementById('couple-website-root');

    const init = async () => {
      // Load GSAP, ScrollTrigger, and Lenis sequentially from CDN
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js");

      if (!active) return;

      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      const Lenis = (window as any).Lenis;

      if (!gsap || !ScrollTrigger || !Lenis) return;

      gsap.registerPlugin(ScrollTrigger);



      // 2. Custom Cursor Follower Engine (Only on desktop)
      const cursor = document.getElementById('cursor');
      const follower = document.getElementById('cursor-follower');

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

      // Event delegation for cursor hover effects (Only on desktop)
      if (mainContainer && !isPreview && !isMobile) {
        mouseOverRoot = (e: MouseEvent) => {
          const target = (e.target as HTMLElement).closest('.hover-target');
          if (target && cursor && follower) {
            gsap.to(cursor, { width: 12, height: 12, backgroundColor: "#E8A7B5", duration: 0.2 });
            gsap.to(follower, { width: 60, height: 60, borderColor: "#E8A7B5", backgroundColor: "rgba(255, 183, 197, 0.08)", duration: 0.2 });
          }
        };
        mouseOutRoot = (e: MouseEvent) => {
          const target = (e.target as HTMLElement).closest('.hover-target');
          if (target && cursor && follower) {
            gsap.to(cursor, { width: 8, height: 8, backgroundColor: "#AA7C11", duration: 0.2 });
            gsap.to(follower, { width: 40, height: 40, borderColor: "rgba(212, 175, 55, 0.4)", backgroundColor: "transparent", duration: 0.2 });
          }
        };
        mainContainer.addEventListener('mouseover', mouseOverRoot);
        mainContainer.addEventListener('mouseout', mouseOutRoot);
      }



      // Preloader Engine
      const preloader = document.getElementById("preloader");
      const progress = document.getElementById("preloader-progress");

      if (preloader && progress && !isPreview) {
        setTimeout(() => { if (progress) progress.style.width = "40%"; }, 150);
        setTimeout(() => { if (progress) progress.style.width = "75%"; }, 500);
        setTimeout(() => { if (progress) progress.style.width = "100%"; }, 1000);
        setTimeout(() => {
          if (preloader) preloader.classList.add("opacity-0", "pointer-events-none");
          gsap.fromTo('.animate-init',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
          );
        }, 1600);
      } else {
        gsap.fromTo('.animate-init',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
        );
      }

      // 4. Global Canvas Falling Petals Engine
      const petalsCanvas = document.getElementById("petals-canvas") as HTMLCanvasElement | null;
      if (petalsCanvas) {
        const pCtx = petalsCanvas.getContext("2d");
        if (pCtx) {
          let petals: Petal[] = [];
          const maxPetals = isMobile ? 12 : 45;

          resizePetals = () => {
            petalsCanvas.width = window.innerWidth;
            petalsCanvas.height = window.innerHeight;
          };
          window.addEventListener("resize", resizePetals);
          resizePetals();

          class Petal {
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
              this.y = Math.random() * (petalsCanvas ? petalsCanvas.height : window.innerHeight);
            }

            reset() {
              this.x = Math.random() * (petalsCanvas ? petalsCanvas.width : window.innerWidth);
              this.y = -20;
              this.size = Math.random() * 8 + 6;
              this.speedY = Math.random() * 1.2 + 0.8;
              this.speedX = Math.random() * 1.5 - 0.75;
              this.angle = Math.random() * Math.PI * 2;
              this.spin = Math.random() * 0.02 - 0.01;
              this.opacity = Math.random() * 0.5 + 0.3;
              this.color = Math.random() > 0.35 ? "#FFB7C5" : "#FFE4E1";
            }

            update() {
              this.y += this.speedY;
              this.x += this.speedX + Math.sin(this.angle) * 0.5;
              this.angle += this.spin;

              if (petalsCanvas && (this.y > petalsCanvas.height + 20 || this.x < -20 || this.x > petalsCanvas.width + 20)) {
                this.reset();
              }
            }

            draw() {
              if (!pCtx) return;
              pCtx.save();
              pCtx.translate(this.x, this.y);
              pCtx.rotate(this.angle);
              pCtx.globalAlpha = this.opacity;
              pCtx.fillStyle = this.color;
              pCtx.beginPath();
              pCtx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
              pCtx.fill();
              pCtx.restore();
            }
          }

          for (let i = 0; i < maxPetals; i++) {
            petals.push(new Petal());
          }

          const animatePetals = () => {
            if (petalsCanvas) {
              pCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
              petals.forEach(p => {
                p.update();
                p.draw();
              });
              petalsFrameId = requestAnimationFrame(animatePetals);
            }
          };
          animatePetals();
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
      if (mmContext) {
        mmContext.revert();
      }
      const ScrollTrigger = (window as any).ScrollTrigger;
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((t: any) => t.kill());
      }
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      if (resizePetals) window.removeEventListener("resize", resizePetals);
      if (resizeParticles) window.removeEventListener("resize", resizeParticles);
      if (mouseMoveCursor) window.removeEventListener("mousemove", mouseMoveCursor);
      if (mouseOverRoot && mainContainer) mainContainer.removeEventListener("mouseover", mouseOverRoot);
      if (mouseOutRoot && mainContainer) mainContainer.removeEventListener("mouseout", mouseOutRoot);
      if (petalsFrameId) cancelAnimationFrame(petalsFrameId);
      if (particlesFrameId) cancelAnimationFrame(particlesFrameId);
    };
  }, [startDate, images, isPreview]);

  // Autoplay handler on first user interaction
  useEffect(() => {
    if (!musicEnabled || hideMusicPlayer) return;
    
    let hasInteracted = false;
    const handleInteraction = () => {
      const audio = audioRef.current;
      if (!hasInteracted && audio) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            hasInteracted = true;
          })
          .catch((err) => {
            console.log("Autoplay blocked by browser policy:", err);
          });
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("scroll", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, [musicEnabled]);

  // Audio Control Toggle
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => console.log("Autoplay blocked or audio failed:", err));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Reload audio on selectedMusic change (essential for dynamic preview updates)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => console.log("Audio failed to auto-resume on song switch:", err));
      }
    }
  }, [selectedMusic]);


  return (
    <div id="couple-website-root" className="bg-beige-light selection:bg-pink-light selection:text-dark min-h-screen w-full relative overflow-x-hidden font-poppins">
      
      {/* Live Preview Banner */}
      {isPreview && (
        <div className={`sticky ${isFullPreview ? "top-16" : "top-0"} z-[10000] w-full bg-amber-500 text-white text-center py-1.5 text-xs font-semibold uppercase tracking-widest shadow-md`}>
          Live Preview Mode
        </div>
      )}

      {/* Premium Monogram Preloader */}
      {!isPreview && (
        <div id="preloader" className="fixed inset-0 bg-[#2C2A29] z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out">
          <div className="text-center flex flex-col items-center px-4">
            {/* Monogram Calligraphy */}
            <div className="w-20 h-20 border border-gold/30 rounded-full flex items-center justify-center mb-6 bg-white/5 backdrop-blur-sm animate-pulse">
              <span className="font-cormorant text-3xl text-gold-light tracking-widest">{initials}</span>
            </div>
            <h2 className="font-playfair text-xl md:text-2xl text-white tracking-[0.2em] uppercase font-light">{yourName} &amp; {partnerName}</h2>
            <p className="font-cormorant italic text-gold/60 text-base mt-2">Loading Our Story...</p>
            {/* Thin progress bar */}
            <div className="w-48 h-[1px] bg-white/10 mt-8 relative overflow-hidden">
              <div id="preloader-progress" className="absolute left-0 top-0 h-full w-0 bg-gold transition-all duration-500 ease-out"></div>
            </div>
          </div>
        </div>
      )}

      {/* Grain Overlay for Film Aesthetic */}
      <div className="grain-overlay"></div>

      {/* Custom Cinematic Mouse Cursor Follower (Disabled in preview mode to avoid global pointer leakage) */}
      {!isPreview && (
        <>
          <div className="custom-cursor hidden md:block" id="cursor"></div>
          <div className="custom-cursor-follower hidden md:block" id="cursor-follower"></div>
        </>
      )}

      {/* Ambient background glow layers */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full aurora-glow-1 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full aurora-glow-2 pointer-events-none z-0"></div>

      {/* Global Floating Petals Canvas */}
      <canvas id="petals-canvas"></canvas>

      {/* Hero Section */}
      <section id="hero" className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Hero Background Image with subtle zoom & parallax */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet={heroMobileImg} media="(max-width: 768px)" />
            <img 
              src={heroDesktopImg} 
              alt="Hero Background" 
              className="w-full h-full object-cover scale-105 filter blur-[2px] brightness-[0.85] saturate-[0.95]" 
              id="hero-img" 
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          {/* Soft romantic overlay & lights */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-beige-light"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-4 mt-12 flex flex-col items-center">
          {/* Couple Monogram */}
          <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center mb-8 backdrop-blur-md bg-white/5 opacity-0 translate-y-8 animate-init hover-target transition-hover-border hover:border-gold">
            <span className="font-cormorant text-2xl text-white font-light tracking-widest">{initials}</span>
          </div>

          {/* Main Names */}
          <h1 className="serif-title text-5xl md:text-8xl text-white font-normal mb-6 tracking-wide leading-tight opacity-0 translate-y-8 animate-init delay-1">
            {yourName} <span className="serif-subtitle italic text-pink/80 font-light">&amp;</span> {partnerName}
          </h1>

          {/* Romantic Quote / Message */}
          <p className="font-cormorant italic text-xl md:text-2xl text-white/90 font-light max-w-2xl mb-10 tracking-wide leading-relaxed opacity-0 translate-y-8 animate-init delay-2">
            "{message || "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."}"
          </p>

          {/* CTA Button */}
          <a href="#journey" className="btn-premium hover-target px-8 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white font-poppins text-xs tracking-[0.25em] uppercase rounded-full hover:bg-gold hover:border-gold hover:text-dark transition-all duration-500 mb-16 opacity-0 translate-y-8 animate-init delay-3">
            Begin Our Journey
          </a>

          {/* Glass Relationship Details Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-3xl border border-white/20 shadow-2xl opacity-0 translate-y-8 animate-init delay-4 hover-target">
            <div className="grid grid-cols-3 divide-x divide-gold/20">
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase mb-2">Together Since</h3>
                <p className="font-playfair text-base md:text-xl text-dark font-medium">
                  {startDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase mb-2">First Met</h3>
                <p className="font-playfair text-base md:text-xl text-dark font-medium">Our Special Place</p>
              </div>
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase mb-2">Anniversary</h3>
                <p className="font-playfair text-base md:text-xl text-dark font-medium">
                  {startDate.toLocaleDateString("en-US", { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Couple Journey Section (Replaces Scroll Animation) */}
      <section id="journey" className="py-24 px-4 relative z-20 overflow-hidden flex flex-col items-center justify-center border-t border-b border-gold/10 bg-beige-light/10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Couple Image */}
          <div className="max-w-md md:max-w-xl w-full mb-8 overflow-hidden rounded-2xl border-4 border-white shadow-2xl bg-white/5 backdrop-blur-sm p-1">
            <img 
              src="/couple.png" 
              alt="Couple" 
              className="w-full h-auto object-cover rounded-xl"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Quote Title */}
          <h2 className="serif-title text-4xl md:text-6xl text-gold font-normal mb-4 tracking-wide leading-tight">
            Two Hearts. One Journey.
          </h2>

          {/* Quote Subtitle */}
          <p className="font-cormorant italic text-xl md:text-3.5xl text-dark font-light max-w-2xl tracking-wide leading-relaxed">
            "Where time stands still, and love begins."
          </p>

          <div className="w-24 h-[1px] bg-gold/30 mt-8"></div>
        </div>
      </section>

      {/* Love Counter & Anniversary Countdown Section */}
      <section className="py-24 md:py-32 px-4 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">Our Time Together</span>
            <h2 className="serif-title text-4xl md:text-6xl text-dark font-normal tracking-wide">Every Single Second</h2>
            <div className="w-24 h-[1px] bg-gold/30 mx-auto mt-6"></div>
          </div>

          {/* Love Counter Glass Card */}
          <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl mb-16 relative overflow-hidden hover-target">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink via-gold to-pink-light"></div>
            <p className="font-cormorant text-xl text-center text-muted italic mb-8">Counting our love journey in real-time...</p>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center" id="love-counter">
              {/* Years */}
              <div className="glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/40 shadow-inner">
                <span className="block font-playfair text-4xl md:text-6xl text-gold font-normal mb-2" id="count-years">{loveCount.years}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase">Years</span>
              </div>
              {/* Months */}
              <div className="glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/40 shadow-inner">
                <span className="block font-playfair text-4xl md:text-6xl text-gold font-normal mb-2" id="count-months">{loveCount.months}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase">Months</span>
              </div>
              {/* Days */}
              <div className="glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/40 shadow-inner">
                <span className="block font-playfair text-4xl md:text-6xl text-gold font-normal mb-2" id="count-days">{loveCount.days}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase">Days</span>
              </div>
              {/* Hours */}
              <div className="glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/40 shadow-inner">
                <span className="block font-playfair text-4xl md:text-6xl text-gold font-normal mb-2" id="count-hours">{loveCount.hours}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase">Hours</span>
              </div>
              {/* Minutes */}
              <div className="glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/40 shadow-inner">
                <span className="block font-playfair text-4xl md:text-6xl text-gold font-normal mb-2" id="count-minutes">{loveCount.minutes}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase">Minutes</span>
              </div>
              {/* Seconds */}
              <div className="glass-card bg-white/20 rounded-2xl p-4 md:p-6 border border-white/40 shadow-inner">
                <span className="block font-playfair text-4xl md:text-6xl text-pink-dark font-normal mb-2" id="count-seconds">{loveCount.seconds}</span>
                <span className="block font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase">Seconds</span>
              </div>
            </div>
          </div>

          {/* Anniversary Countdown Sub-Card */}
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl hover-target">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-playfair text-xl md:text-2xl text-dark font-normal mb-1">Next Anniversary Countdown</h3>
                <p className="font-cormorant text-muted italic text-base">Until we celebrate another milestone of our vows.</p>
              </div>
              <div className="flex gap-4 text-center" id="anniversary-countdown">
                <div>
                  <span className="block font-playfair text-2xl md:text-3xl text-gold font-normal" id="ann-days">{anniversaryCount.days}</span>
                  <span className="block font-poppins text-[9px] text-muted tracking-wider uppercase">Days</span>
                </div>
                <span className="text-gold font-light text-xl">:</span>
                <div>
                  <span className="block font-playfair text-2xl md:text-3xl text-gold font-normal" id="ann-hours">{anniversaryCount.hours}</span>
                  <span className="block font-poppins text-[9px] text-muted tracking-wider uppercase">Hours</span>
                </div>
                <span className="text-gold font-light text-xl">:</span>
                <div>
                  <span className="block font-playfair text-2xl md:text-3xl text-gold font-normal" id="ann-mins">{anniversaryCount.minutes}</span>
                  <span className="block font-poppins text-[9px] text-muted tracking-wider uppercase">Mins</span>
                </div>
                <span className="text-gold font-light text-xl">:</span>
                <div>
                  <span className="block font-playfair text-2xl md:text-3xl text-pink-dark font-normal" id="ann-secs">{anniversaryCount.seconds}</span>
                  <span className="block font-poppins text-[9px] text-muted tracking-wider uppercase">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Love Letter Section */}
      <section id="letter" className="py-24 md:py-32 px-4 relative z-20 overflow-hidden bg-beige-light">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <span className="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">A Private Note</span>
            <h2 className="serif-title text-4xl md:text-6xl text-dark font-normal tracking-wide">A Letter to My Love</h2>
            <div className="w-24 h-[1px] bg-gold/30 mx-auto mt-6"></div>
          </div>

          {/* Interactive Envelope Container */}
          <div className="flex flex-col items-center justify-center py-12 relative">
            {!envelopeOpen && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none z-30">
                <span className="text-[10px] md:text-xs bg-rose-500 text-white font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-rose-500/30 border border-rose-450">Click to Open</span>
                <span className="text-2xl">👇</span>
              </div>
            )}
            <div 
              className={`envelope-wrapper hover-target ${envelopeOpen ? 'open' : ''}`} 
              id="envelope-wrapper"
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
            >
              <div className="envelope">
                <div className="envelope-flap"></div>
                <div className="envelope-front"></div>
                <div className="envelope-sides"></div>
                <div className="envelope-sides-right"></div>
                <div 
                  className="letter-paper font-cormorant text-dark italic flex flex-col justify-between"
                  onClick={(e) => {
                    if (envelopeOpen) e.stopPropagation();
                  }}
                >
                  <div className="text-xs tracking-wider border-b border-gold/15 pb-2 mb-2 flex justify-between font-poppins not-italic">
                    <span>To My Forever</span>
                    <span>{new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-muted line-clamp-6 md:line-clamp-none font-medium overflow-y-auto">
                    {message}
                  </p>
                  <div className="text-right text-xs font-poppins not-italic border-t border-gold/15 pt-2 mt-2">
                    <span>Yours always, {yourName}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted font-poppins tracking-widest uppercase mt-8 text-center" id="letter-prompt">
              {envelopeOpen ? "Click to close envelope" : "Click the envelope to read the letter"}
            </p>
            {/* Send Reply Button */}
            <div className="mt-6 flex justify-center">
              <a 
                href={`/create?category=couples&yourName=${encodeURIComponent(partnerName)}&partnerName=${encodeURIComponent(yourName)}&relationshipDate=${encodeURIComponent(relationshipDate || "")}&isReply=true`}
                className="hover-target px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-poppins text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300 shadow-md shadow-rose-500/25 flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Reply
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Custom Fields Section */}
      {customFields && customFields.length > 0 && (
        <section className="py-20 px-4 relative z-20 bg-beige-light border-t border-gold/10">
          <div className="max-w-xl mx-auto text-center">
            <span className="font-cormorant italic text-xl text-gold tracking-wider mb-2 block">Additional Details</span>
            <h2 className="serif-title text-3xl md:text-4xl text-dark font-normal tracking-wide mb-10">Useful Information</h2>
            
            <div className="space-y-6">
              {customFields.map((field, idx) => {
                const link = getLinkUrl(field.value);
                return (
                  <div 
                    key={idx} 
                    className="glass-card rounded-2xl p-6 border border-white/40 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <h4 className="font-poppins text-[10px] md:text-xs text-gold-dark tracking-widest uppercase mb-2">
                      {field.label}
                    </h4>
                    {link ? (
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 font-cormorant italic text-lg text-dark hover:text-gold-dark underline underline-offset-4 decoration-gold/45 hover:decoration-gold transition-all duration-300 break-all"
                      >
                        {field.value.length > 35 ? "Click to view link" : field.value} ↗
                      </a>
                    ) : (
                      <p className="font-cormorant text-base md:text-lg text-dark leading-relaxed whitespace-pre-line">
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

      {/* Reasons I Love You Section */}
      <section className="py-24 md:py-32 px-4 relative z-20 bg-beige/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">Whispered Truths</span>
            <h2 className="serif-title text-4xl md:text-6xl text-dark font-normal tracking-wide">Why I Love You</h2>
            <div className="w-24 h-[1px] bg-gold/30 mx-auto mt-6"></div>
          </div>

          {/* Editorial Grid of Reasons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Reason 1 */}
            <div className="glass-card glass-card-hover rounded-2xl p-8 border border-white/40 shadow-xl flex flex-col justify-between hover-target">
              <div>
                <div className="w-12 h-12 rounded-full bg-pink-light/60 flex items-center justify-center mb-6 text-pink-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                </div>
                <h3 className="font-playfair text-2xl text-dark font-normal mb-4">Your Laugh</h3>
                <p className="font-cormorant text-muted italic text-lg leading-relaxed">
                  Your genuine, pure laugh is my favorite melody in the world. It has the power to instantly chase away any clouds on my worst days and make the entire universe feel calm.
                </p>
              </div>
              <span className="text-gold/30 font-playfair text-6xl font-light text-right block select-none mt-6">01</span>
            </div>

            {/* Reason 2 */}
            <div className="glass-card glass-card-hover rounded-2xl p-8 border border-white/40 shadow-xl flex flex-col justify-between hover-target mt-0 md:mt-8">
              <div>
                <div className="w-12 h-12 rounded-full bg-gold-light/60 flex items-center justify-center mb-6 text-gold-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"></path><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"></path><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"></path></svg>
                </div>
                <h3 className="font-playfair text-2xl text-dark font-normal mb-4">Your Kind Heart</h3>
                <p className="font-cormorant text-muted italic text-lg leading-relaxed">
                  The gentle way you look at the world, how you care for strangers, and your limitless empathy. You inspire me to be a better person every single day.
                </p>
              </div>
              <span className="text-gold/30 font-playfair text-6xl font-light text-right block select-none mt-6">02</span>
            </div>

            {/* Reason 3 */}
            <div className="glass-card glass-card-hover rounded-2xl p-8 border border-white/40 shadow-xl flex flex-col justify-between hover-target">
              <div>
                <div className="w-12 h-12 rounded-full bg-pink-light/60 flex items-center justify-center mb-6 text-pink-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                </div>
                <h3 className="font-playfair text-2xl text-dark font-normal mb-4">Our Adventures</h3>
                <p className="font-cormorant text-muted italic text-lg leading-relaxed">
                  How even a simple walk in the park or a grocery store trip turns into an adventure full of smiles and jokes. There is never a dull moment when I am next to you.
                </p>
              </div>
              <span className="text-gold/30 font-playfair text-6xl font-light text-right block select-none mt-6">03</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Gallery Section */}
      {images && images.length > 0 && (
        <section className="py-24 md:py-32 px-4 relative z-20 bg-beige/10 border-t border-gold/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">Captured Moments</span>
              <h2 className="serif-title text-4xl md:text-6xl text-dark font-normal tracking-wide">Our Gallery</h2>
              <p className="font-poppins text-[10px] text-muted tracking-widest uppercase mt-2">
                A collection of our favorite photos together
              </p>
              <div className="w-24 h-[1px] bg-gold/30 mx-auto mt-6"></div>
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
                  className="glass-card overflow-hidden rounded-2xl border border-white/40 shadow-xl aspect-[4/5] relative group"
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="font-cormorant text-white italic text-lg">Moments #0{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-beige-dark/20 relative z-20 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 hover-target">
            <span className="font-playfair text-2xl text-dark tracking-[0.2em]">{yourName ? yourName.charAt(0).toUpperCase() : 'A'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-dark fill-pink-dark animate-pulse"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
            <span className="font-playfair text-2xl text-dark tracking-[0.2em]">{partnerName ? partnerName.charAt(0).toUpperCase() : 'I'}</span>
          </div>
          <p className="font-cormorant italic text-base text-muted mb-4 max-w-sm mx-auto">
            "Two souls with but a single thought, two hearts that beat as one."
          </p>
          <div className="my-6">
            <a 
              href="/create"
              className="hover-target inline-flex items-center gap-2 px-5 py-2 border border-gold/40 text-gold-dark hover:bg-gold hover:text-white font-poppins text-[11px] tracking-wider uppercase rounded-full transition-all duration-300 shadow-sm"
            >
              <span>Create Your Own Special Page ✨</span>
            </a>
          </div>
          <div className="w-12 h-[1px] bg-gold/20 mx-auto my-4"></div>
          <p className="font-poppins text-[10px] text-muted/80 tracking-widest uppercase">
            Made with Love • © 2026 {yourName} &amp; {partnerName}
          </p>
        </div>
      </footer>

      {/* Floating Cinematic Music Player */}
      {musicEnabled && !hideMusicPlayer && (
        <div id="ambient-player" className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 p-2.5 rounded-full shadow-2xl hover:bg-white/25 transition-all duration-300 hover-target">
          {/* Vinyl Disc Graphic */}
          <div className={`vinyl-disc w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center relative overflow-hidden border border-gold/20 shadow-lg ${isPlaying ? 'playing' : ''}`}>
            <div className="w-3.5 h-3.5 rounded-full bg-beige-light border border-gold/20 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-dark"></div>
            </div>
          </div>
          {/* Play Control Info */}
          <div className="player-info flex flex-col pr-4 select-none max-w-0 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
            <span className="font-poppins text-[9px] text-muted tracking-wider uppercase font-medium">Ambient Music</span>
            <span className="font-cormorant text-xs text-dark italic font-semibold">Love Story - Acoustic</span>
          </div>
          {/* Play/Pause Button */}
          <button 
            id="player-toggle" 
            className="w-8 h-8 rounded-full bg-gold/15 hover:bg-gold/25 flex items-center justify-center text-gold-dark transition-all duration-300"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" id="player-icon"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" id="player-icon"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            )}
          </button>
          
          {/* Audio element with local mp3 background music */}
          <audio id="bg-audio" ref={audioRef} loop preload="auto">
            <source src={selectedMusic ? `/Website Music/${encodeURIComponent(selectedMusic)}` : "/Website Music/Couple.mp3"} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {/* Premium Cinematic Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Root Variable Settings based on Theme selection */
        :root {
          --color-luxury: ${theme === "dark" ? "#1E1B18" : "#FAF9F6"};
          --color-beige-light: ${theme === "dark" ? "#161413" : "#FAF8F5"};
          --color-beige: ${theme === "dark" ? "#211E1D" : "#F5F2EB"};
          --color-beige-dark: ${theme === "dark" ? "#2E2A27" : "#E6DFD3"};
          --color-gold: #D4AF37;
          --color-gold-light: #F3E5AB;
          --color-gold-dark: #AA7C11;
          --color-pink: #FFB7C5;
          --color-pink-light: ${theme === "dark" ? "#4D3136" : "#FFE4E1"};
          --color-pink-dark: ${theme === "dark" ? "#FFC5D0" : "#E8A7B5"};
          --color-text-dark: ${theme === "dark" ? "#FAF9F6" : "#2C2A29"};
          --color-text-muted: ${theme === "dark" ? "#A8A39D" : "#6B6661"};
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: var(--color-beige-light);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--color-gold-dark);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-gold);
        }

        /* Custom Cursor */
        .custom-cursor {
          width: 8px;
          height: 8px;
          background-color: var(--color-gold-dark);
          border-radius: 50%;
          position: fixed;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9999;
          transition: width 0.2s, height 0.2s, background-color 0.2s;
        }

        .custom-cursor-follower {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 50%;
          position: fixed;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9998;
          /* Avoid CSS transition conflicts on properties animated by GSAP */
          transition: transform 0.08s ease-out;
        }

        /* Grain Overlay Effect for Editorial Feel */
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9990;
        }

        /* Glassmorphism Styles */
        .glass-card {
          background: ${theme === "dark" ? "rgba(33, 30, 29, 0.6)" : "rgba(255, 255, 255, 0.45)"};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.4)"};
          box-shadow: 0 12px 40px 0 rgba(142, 130, 115, 0.07);
        }

        .glass-card-hover {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-card-hover:hover {
          background: ${theme === "dark" ? "rgba(33, 30, 29, 0.8)" : "rgba(255, 255, 255, 0.65)"};
          transform: translateY(-8px);
          box-shadow: 0 20px 50px 0 rgba(142, 130, 115, 0.12);
          border-color: rgba(212, 175, 55, 0.3);
        }

        /* Premium Gold Text Gradient */
        .text-gold-gradient {
          background: linear-gradient(135deg, #AA7C11 0%, #D4AF37 50%, #F3E5AB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Aurora Lights */
        .aurora-glow-1 {
          background: radial-gradient(circle, rgba(255, 228, 225, ${theme === "dark" ? "0.15" : "0.55"}) 0%, rgba(255, 255, 255, 0) 70%);
          filter: blur(40px);
        }

        .aurora-glow-2 {
          background: radial-gradient(circle, rgba(243, 229, 171, ${theme === "dark" ? "0.1" : "0.45"}) 0%, rgba(255, 255, 255, 0) 70%);
          filter: blur(40px);
        }

        /* Scroll Animation Section Styling */
        .scroll-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-beige-light);
        }

        .scroll-pin-section {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
          position: relative;
        }

        .scroll-character {
          position: absolute;
          height: 75vh;
          max-height: 600px;
          object-fit: contain;
          z-index: 10;
          filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.08));
        }

        .scroll-character-boy {
          left: 0;
          transform: translateX(-35vw) scale(0.95);
        }

        .scroll-character-girl {
          right: 0;
          transform: translateX(35vw) scale(0.95);
        }

        @media (min-width: 769px) {
          .scroll-character-boy {
            transform: translateX(-16vw) scale(0.95);
          }
          .scroll-character-girl {
            transform: translateX(16vw) scale(0.95);
          }
        }

        .scroll-couple-img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          height: 80vh;
          max-height: 650px;
          object-fit: contain;
          z-index: 12;
          opacity: 0;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.12));
        }

        .heart-svg-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          z-index: 11;
          width: 400px;
          height: 400px;
          opacity: 0;
          pointer-events: none;
        }

        /* Interactive Love Letter / Envelope Styling */
        .envelope-wrapper {
          position: relative;
          width: 320px;
          height: 220px;
          background-color: var(--color-beige);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          cursor: pointer;
          perspective: 1000px;
          transition: transform 0.5s ease;
        }

        .envelope {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: var(--color-beige-dark);
          border-radius: 4px;
          transform-style: preserve-3d;
        }

        .envelope-front {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-bottom: 110px solid ${theme === "dark" ? "#2B2825" : "#E3D9C9"};
          bottom: 0;
          left: 0;
          transform: translateZ(3px);
        }

        .envelope-sides {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 110px solid transparent;
          border-bottom: 110px solid transparent;
          border-left: 160px solid ${theme === "dark" ? "#282522" : "#DFD5C2"};
          top: 0;
          left: 0;
          transform: translateZ(2px);
        }

        .envelope-sides-right {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 110px solid transparent;
          border-bottom: 110px solid transparent;
          border-right: 160px solid ${theme === "dark" ? "#282522" : "#DFD5C2"};
          top: 0;
          right: 0;
          transform: translateZ(2px);
        }

        .envelope-flap {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-top: 110px solid ${theme === "dark" ? "#23201E" : "#D4C7B1"};
          top: 0;
          left: 0;
          transform-origin: top;
          transform: translateZ(4px) rotateX(0deg);
          transition: transform 0.4s ease 0s;
        }

        .letter-paper {
          position: absolute;
          width: 290px;
          height: 180px;
          background: ${theme === "dark" ? "#2C2926" : "#FCFBF9"};
          left: 15px;
          bottom: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          padding: 24px;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.25);
          transform: translateZ(1px);
          transition: transform 0.4s ease 0s, height 0.4s ease 0s;
        }

        /* Open Envelope States */
        .envelope-wrapper.open .envelope-flap {
          transform: translateZ(0px) rotateX(180deg);
          transition: transform 0.4s ease 0s;
        }

        .envelope-wrapper.open .letter-paper {
          transform: translateZ(5px) translateY(-135px) scale(1.05);
          height: 260px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.35);
          transition: transform 0.4s ease 0.3s, height 0.4s ease 0.3s;
        }

        .envelope-wrapper:not(.open) .envelope-flap {
          transition: transform 0.4s ease 0.4s;
        }

        /* Custom Particle Canvas */
        #particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        /* Custom Petal Canvas */
        #petals-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 8;
        }

        /* Heart Outline Animation path */
        .heart-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        /* Button Premium Effects */
        .btn-premium {
          position: relative;
          overflow: hidden;
          /* Avoid CSS transition conflicts on transform/opacity properties animated by GSAP */
          transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .transition-hover-border {
          transition: border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-premium::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s ease-out, height 0.6s ease-out;
        }

        .btn-premium:hover::after {
          width: 300px;
          height: 300px;
        }

        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
        }

        /* Text styles */
        .serif-title {
          font-family: 'Playfair Display', serif;
        }

        .serif-subtitle {
          font-family: 'Cormorant Garamond', serif;
        }

        /* Ambient Player & Vinyl Rotation */
        .vinyl-disc.playing {
          animation: spin-vinyl 10s linear infinite;
        }

        @keyframes spin-vinyl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        #ambient-player:hover .player-info {
          max-w: 160px;
        }

        /* Color overrides to match Tailwind Play CDN config */
        .bg-beige-light { background-color: var(--color-beige-light) !important; }
        .bg-beige { background-color: var(--color-beige) !important; }
        .bg-beige-dark\/20 { background-color: rgba(${theme === "dark" ? "46, 42, 39" : "230, 223, 211"}, 0.2) !important; }
        .bg-beige\/30 { background-color: rgba(${theme === "dark" ? "33, 30, 29" : "245, 242, 235"}, 0.3) !important; }

        .text-gold-light { color: var(--color-gold-light) !important; }
        .text-gold-dark { color: var(--color-gold-dark) !important; }
        .text-pink-dark { color: var(--color-pink-dark) !important; }
        .text-gold { color: var(--color-gold) !important; }
        .text-dark { color: var(--color-text-dark) !important; }
        .text-muted { color: var(--color-text-muted) !important; }
        .text-pink\/80 { color: rgba(255, 183, 197, 0.8) !important; }

        .bg-gold { background-color: var(--color-gold) !important; }
        .bg-gold\/15 { background-color: rgba(212, 175, 55, 0.15) !important; }
        .bg-gold\/25 { background-color: rgba(212, 175, 55, 0.25) !important; }
        .bg-gold-light\/60 { background-color: rgba(243, 229, 171, 0.6) !important; }
        .bg-pink-light\/60 { background-color: rgba(255, 228, 225, 0.6) !important; }

        .border-gold\/30 { border-color: rgba(212, 175, 55, 0.3) !important; }
        .border-gold\/20 { border-color: rgba(212, 175, 55, 0.2) !important; }
        .border-gold\/10 { border-color: rgba(212, 175, 55, 0.1) !important; }
        .border-gold\/15 { border-color: rgba(212, 175, 55, 0.15) !important; }

        .font-playfair { font-family: 'Playfair Display', serif !important; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif !important; }
        .font-poppins { font-family: 'Poppins', sans-serif !important; }

        .bg-gradient-to-r.from-pink.via-gold.to-pink-light {
          background-image: linear-gradient(to right, #FFB7C5, #D4AF37, #FFE4E1) !important;
        }

        /* Selection highlights */
        #couple-website-root::selection {
          background-color: var(--color-pink-light) !important;
          color: var(--color-text-dark) !important;
        }
        #couple-website-root *::selection {
          background-color: var(--color-pink-light) !important;
          color: var(--color-text-dark) !important;
        }
      ` }} />
    </div>
  );
}
