"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CoupleWebsite() {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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

  // Load external scripts helper
  const loadScript = (src) => {
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
      const startDate = new Date('2021-10-12T18:30:00');
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
        years: String(years).padStart(2, '0'),
        months: String(months).padStart(2, '0'),
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
    };

    updateLoveCounter();
    const loveInterval = setInterval(updateLoveCounter, 1000);

    const updateAnniversaryCountdown = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      let anniversaryDate = new Date(targetYear, 9, 12, 18, 30, 0); // October (month 9)

      if (now > anniversaryDate) {
        targetYear++;
        anniversaryDate = new Date(targetYear, 9, 12, 18, 30, 0);
      }

      const diff = anniversaryDate - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setAnniversaryCount({
        days: String(days).padStart(3, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0')
      });
    };

    updateAnniversaryCountdown();
    const annInterval = setInterval(updateAnniversaryCountdown, 1000);

    return () => {
      clearInterval(loveInterval);
      clearInterval(annInterval);
    };
  }, []);

  // Main interactive scripts (GSAP, Lenis, Petals, Dust Particles)
  useEffect(() => {
    let active = true;
    let lenisInstance = null;
    let mmContext = null;
    let petalsFrameId = null;
    let particlesFrameId = null;

    let resizePetals = null;
    let resizeParticles = null;
    let mouseMoveCursor = null;
    let mouseOverRoot = null;
    let mouseOutRoot = null;

    const init = async () => {
      // Load GSAP, ScrollTrigger, and Lenis sequentially from CDN
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js");

      if (!active) return;

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      const Lenis = window.Lenis;

      if (!gsap || !ScrollTrigger || !Lenis) return;

      gsap.registerPlugin(ScrollTrigger);

      // 1. Lenis Smooth Scroll Configuration
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        infinite: false
      });

      lenisInstance.on('scroll', ScrollTrigger.update);

      const tickerCallback = (time) => {
        lenisInstance.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      // 2. Custom Cursor Follower Engine
      const cursor = document.getElementById('cursor');
      const follower = document.getElementById('cursor-follower');

      let cursorX, cursorY, followerX, followerY;
      if (cursor && follower) {
        cursorX = gsap.quickTo(cursor, "left", { duration: 0.08, ease: "power3.out" });
        cursorY = gsap.quickTo(cursor, "top", { duration: 0.08, ease: "power3.out" });
        followerX = gsap.quickTo(follower, "left", { duration: 0.25, ease: "power3.out" });
        followerY = gsap.quickTo(follower, "top", { duration: 0.25, ease: "power3.out" });

        gsap.set([cursor, follower], { left: "-100px", top: "-100px" });

        mouseMoveCursor = (e) => {
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

      // Event delegation for cursor hover effects
      const mainContainer = document.getElementById('couple-website-root');
      mouseOverRoot = (e) => {
        const target = e.target.closest('.hover-target');
        if (target && cursor && follower) {
          gsap.to(cursor, { width: 12, height: 12, backgroundColor: "#E8A7B5", duration: 0.2 });
          gsap.to(follower, { width: 60, height: 60, borderColor: "#E8A7B5", backgroundColor: "rgba(255, 183, 197, 0.08)", duration: 0.2 });
        }
      };
      mouseOutRoot = (e) => {
        const target = e.target.closest('.hover-target');
        if (target && cursor && follower) {
          gsap.to(cursor, { width: 8, height: 8, backgroundColor: "#AA7C11", duration: 0.2 });
          gsap.to(follower, { width: 40, height: 40, borderColor: "rgba(212, 175, 55, 0.4)", backgroundColor: "transparent", duration: 0.2 });
        }
      };
      if (mainContainer) {
        mainContainer.addEventListener('mouseover', mouseOverRoot);
        mainContainer.addEventListener('mouseout', mouseOutRoot);
      }

      // 3. Hero Parallax
      const heroImg = document.getElementById('hero-img');
      if (heroImg) {
        gsap.to(heroImg, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Preloader Engine
      const preloader = document.getElementById("preloader");
      const progress = document.getElementById("preloader-progress");

      if (preloader && progress) {
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
      const petalsCanvas = document.getElementById("petals-canvas");
      if (petalsCanvas) {
        const pCtx = petalsCanvas.getContext("2d");
        let petals = [];
        const maxPetals = 45;

        resizePetals = () => {
          petalsCanvas.width = window.innerWidth;
          petalsCanvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resizePetals);
        resizePetals();

        class Petal {
          constructor() {
            this.reset();
            this.y = Math.random() * petalsCanvas.height;
          }

          reset() {
            this.x = Math.random() * petalsCanvas.width;
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

            if (this.y > petalsCanvas.height + 20 || this.x < -20 || this.x > petalsCanvas.width + 20) {
              this.reset();
            }
          }

          draw() {
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
          pCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
          petals.forEach(p => {
            p.update();
            p.draw();
          });
          petalsFrameId = requestAnimationFrame(animatePetals);
        };
        animatePetals();
      }

      // 5. Pinned Scroll Animation Section (GSAP)
      const particlesCanvas = document.getElementById("particles-canvas");
      if (particlesCanvas) {
        const ptCtx = particlesCanvas.getContext("2d");
        let scrollParticles = [];
        let baseParticlesCount = 50;
        let particleIntensity = 0;
        let exploded = false;

        resizeParticles = () => {
          particlesCanvas.width = particlesCanvas.parentElement.clientWidth;
          particlesCanvas.height = particlesCanvas.parentElement.clientHeight;
        };
        window.addEventListener("resize", resizeParticles);
        resizeParticles();

        class GoldenDustParticle {
          constructor(isBurst = false) {
            this.isBurst = isBurst;
            this.reset();
            if (!isBurst) {
              this.y = Math.random() * particlesCanvas.height;
            }
          }

          reset() {
            if (this.isBurst) {
              this.x = particlesCanvas.width / 2;
              this.y = particlesCanvas.height / 2;
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 8 + 3;
              this.speedX = Math.cos(angle) * speed;
              this.speedY = Math.sin(angle) * speed;
              this.size = Math.random() * 4 + 2;
              this.decay = Math.random() * 0.015 + 0.005;
              this.color = Math.random() > 0.5 ? "#D4AF37" : "#FFB7C5";
            } else {
              this.x = Math.random() * particlesCanvas.width;
              this.y = particlesCanvas.height + 10;
              this.speedY = -(Math.random() * 1.5 + 0.5);
              this.speedX = Math.random() * 1.0 - 0.5;
              this.size = Math.random() * 3 + 1;
              this.decay = 0;
              this.color = "#D4AF37";
            }
            this.opacity = Math.random() * 0.8 + 0.2;
          }

          update() {
            if (this.isBurst) {
              this.x += this.speedX;
              this.y += this.speedY;
              this.speedX *= 0.96;
              this.speedY *= 0.96;
              this.opacity -= this.decay;
            } else {
              const currentSpeedY = this.speedY * (1 + particleIntensity * 4);
              this.y += currentSpeedY;
              this.x += this.speedX;

              if (this.y < -10) {
                this.reset();
              }
            }
          }

          draw() {
            if (this.opacity <= 0) return;
            ptCtx.save();
            ptCtx.globalAlpha = this.opacity;
            ptCtx.fillStyle = this.color;
            ptCtx.shadowBlur = this.isBurst ? 10 : 4;
            ptCtx.shadowColor = this.color;
            ptCtx.beginPath();
            ptCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ptCtx.fill();
            ptCtx.restore();
          }
        }

        for (let i = 0; i < baseParticlesCount; i++) {
          scrollParticles.push(new GoldenDustParticle(false));
        }

        const triggerSparkBurst = () => {
          for (let i = 0; i < 120; i++) {
            scrollParticles.push(new GoldenDustParticle(true));
          }
        };

        const animateParticles = () => {
          ptCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
          scrollParticles = scrollParticles.filter(p => !p.isBurst || p.opacity > 0);
          scrollParticles.forEach(p => {
            p.update();
            p.draw();
          });
          particlesFrameId = requestAnimationFrame(animateParticles);
        };
        animateParticles();

        const updateScrollParticles = (progress) => {
          particleIntensity = progress;
          if (progress >= 0.74 && progress <= 0.78) {
            if (!exploded) {
              triggerSparkBurst();
              exploded = true;
            }
          } else if (progress < 0.65 || progress > 0.85) {
            exploded = false;
          }
        };

        // GSAP Responsive Pinned Scroll Timeline Design
        mmContext = gsap.matchMedia();

        gsap.set(".heart-path", { strokeDashoffset: 1000 });
        gsap.set(".heart-svg-container", { xPercent: -50, yPercent: -50, scale: 0.8 });
        gsap.set(".scroll-couple-img", { xPercent: -50, yPercent: -50, scale: 0.9 });

        mmContext.add({
          isDesktop: "(min-width: 769px)",
          isMobile: "(max-width: 768px)"
        }, (context) => {
          const { isDesktop } = context.conditions;

          const initBoyX = isDesktop ? "-16vw" : "-35vw";
          const initGirlX = isDesktop ? "16vw" : "35vw";
          const targetBoyX = isDesktop ? "22vw" : "15vw";
          const targetGirlX = isDesktop ? "-22vw" : "-15vw";

          gsap.set(".scroll-character-boy", { x: initBoyX, scale: 0.95 });
          gsap.set(".scroll-character-girl", { x: initGirlX, scale: 0.95 });

          const scrollTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: "#scroll-animation-container",
              start: "top top",
              end: "+=360%",
              scrub: 1.2,
              pin: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                updateScrollParticles(self.progress);
              }
            }
          });

          scrollTimeline
            .to(".scroll-character-boy", { x: targetBoyX, scale: 1.05, ease: "power1.inOut" }, 0)
            .to(".scroll-character-girl", { x: targetGirlX, scale: 1.05, ease: "power1.inOut" }, 0)
            .to(".scroll-glow", { opacity: 0.8, scale: 1.25, ease: "power1.inOut" }, 0)
            .to(".scroll-bg-overlay", { opacity: 0.0, ease: "power1.inOut" }, 0)
            .to(".scroll-character-boy, .scroll-character-girl", {
              opacity: 0,
              filter: "blur(12px)",
              scale: 1.1,
              ease: "power1.in"
            }, 0.5)
            .to(".heart-svg-container", { opacity: 1, scale: 1, ease: "power1.out" }, 0.52)
            .to(".heart-path", { strokeDashoffset: 0, ease: "power1.inOut" }, 0.52)
            .to(".heart-svg-container", { scale: 1.2, filter: "blur(8px)", opacity: 0, ease: "power1.in" }, 0.72)
            .to(".scroll-couple-img", { opacity: 1, scale: 1, ease: "power2.out" }, 0.74)
            .to(".scroll-title-text", { opacity: 1, y: 0, ease: "power2.out" }, 0.80)
            .to({}, { duration: 0.1 });
        });
      }
    };

    init();

    return () => {
      active = false;
      if (window.gsap) {
        window.gsap.ticker.remove((time) => {
          if (lenisInstance) lenisInstance.raf(time * 1000);
        });
      }
      if (mmContext) {
        mmContext.revert();
      }
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
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
  }, []);

  // Audio Control Toggle
  const togglePlay = (e) => {
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

  return (
    <div id="couple-website-root" className="bg-beige-light selection:bg-pink-light selection:text-dark min-h-screen w-full relative overflow-x-hidden font-poppins">
      
      {/* Premium Monogram Preloader */}
      <div id="preloader" className="fixed inset-0 bg-[#2C2A29] z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out">
        <div className="text-center flex flex-col items-center px-4">
          {/* Monogram Calligraphy */}
          <div className="w-20 h-20 border border-gold/30 rounded-full flex items-center justify-center mb-6 bg-white/5 backdrop-blur-sm animate-pulse">
            <span className="font-cormorant text-3xl text-gold-light tracking-widest">A&I</span>
          </div>
          <h2 className="font-playfair text-xl md:text-2xl text-white tracking-[0.2em] uppercase font-light">Alexander & Isabella</h2>
          <p className="font-cormorant italic text-gold/60 text-base mt-2">Loading Our Story...</p>
          {/* Thin progress bar */}
          <div className="w-48 h-[1px] bg-white/10 mt-8 relative overflow-hidden">
            <div id="preloader-progress" className="absolute left-0 top-0 h-full w-0 bg-gold transition-all duration-500 ease-out"></div>
          </div>
        </div>
      </div>

      {/* Grain Overlay for Film Aesthetic */}
      <div className="grain-overlay"></div>

      {/* Custom Cinematic Mouse Cursor Follower */}
      <div className="custom-cursor hidden md:block" id="cursor"></div>
      <div className="custom-cursor-follower hidden md:block" id="cursor-follower"></div>

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
            <source srcSet="/mobile hero section.png" media="(max-width: 768px)" />
            <img src="/hero section background.png" alt="Hero Background" className="w-full h-full object-cover scale-105 filter blur-[2px] brightness-[0.85] saturate-[0.95]" id="hero-img" />
          </picture>
          {/* Soft romantic overlay & lights */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-beige-light"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-4 mt-12 flex flex-col items-center">
          {/* Couple Monogram */}
          <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center mb-8 backdrop-blur-md bg-white/5 opacity-0 translate-y-8 animate-init hover-target transition-all duration-500 hover:border-gold">
            <span className="font-cormorant text-2xl text-white font-light tracking-widest">A&I</span>
          </div>

          {/* Main Names */}
          <h1 className="serif-title text-5xl md:text-8xl text-white font-normal mb-6 tracking-wide leading-tight opacity-0 translate-y-8 animate-init delay-1">
            Alexander <span className="serif-subtitle italic text-pink/80 font-light">&</span> Isabella
          </h1>

          {/* Romantic Quote */}
          <p className="font-cormorant italic text-xl md:text-2xl text-white/90 font-light max-w-2xl mb-10 tracking-wide leading-relaxed opacity-0 translate-y-8 animate-init delay-2">
            "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."
          </p>

          {/* CTA Button */}
          <a href="#scroll-animation-container" className="btn-premium hover-target px-8 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white font-poppins text-xs tracking-[0.25em] uppercase rounded-full hover:bg-gold hover:border-gold hover:text-dark transition-all duration-500 mb-16 opacity-0 translate-y-8 animate-init delay-3">
            Begin Our Journey
          </a>

          {/* Glass Relationship Details Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-3xl border border-white/20 shadow-2xl opacity-0 translate-y-8 animate-init delay-4 hover-target">
            <div className="grid grid-cols-3 divide-x divide-gold/20">
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase mb-2">Together Since</h3>
                <p className="font-playfair text-base md:text-xl text-dark font-medium">October 12, 2021</p>
              </div>
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase mb-2">First Met</h3>
                <p className="font-playfair text-base md:text-xl text-dark font-medium">Paris, France</p>
              </div>
              <div className="px-4 text-center">
                <h3 className="font-poppins text-[10px] md:text-xs text-muted tracking-widest uppercase mb-2">Anniversary</h3>
                <p className="font-playfair text-base md:text-xl text-dark font-medium">October 12</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Scroll Animation Section (GSAP) */}
      <div id="scroll-animation-container" className="scroll-container hover-target">
        {/* Subtle glow behind the images */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full aurora-glow-1 opacity-0 scroll-glow pointer-events-none"></div>
        <div className="absolute inset-0 bg-beige-light opacity-30 scroll-bg-overlay pointer-events-none"></div>

        {/* Spark Particles Canvas specifically for scroll interactive effects */}
        <canvas id="particles-canvas"></canvas>

        <div className="scroll-pin-section">
          {/* Boy on the left */}
          <img src="/boy.png" alt="Boy" className="scroll-character scroll-character-boy" />

          {/* Girl on the right */}
          <img src="/girl.png" alt="Girl" className="scroll-character scroll-character-girl" />

          {/* Heart outline SVG path */}
          <div className="heart-svg-container flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-gold fill-none stroke-[0.5] filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <path className="heart-path" d="M 50,30 C 35,10 0,15 0,50 C 0,80 35,95 50,100 C 65,95 100,80 100,50 C 100,15 65,10 50,30 Z" />
            </svg>
          </div>

          {/* Couple fading in at center */}
          <img src="/couple.png" alt="Couple" className="scroll-couple-img" />

          {/* Romantic Cinematic Text */}
          <div className="absolute bottom-16 text-center opacity-0 translate-y-8 scroll-title-text z-20">
            <h2 className="serif-title text-4xl md:text-6xl text-gold-gradient font-normal mb-2 tracking-wide">Two Hearts. One Journey.</h2>
            <p className="font-cormorant italic text-lg md:text-2xl text-muted font-light">Where time stands still, and love begins.</p>
          </div>
        </div>
      </div>

      {/* Love Counter & Anniversary Countdown Section */}
      <section className="py-24 md:py-32 px-4 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span class="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">Our Time Together</span>
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
            <span class="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">A Private Note</span>
            <h2 className="serif-title text-4xl md:text-6xl text-dark font-normal tracking-wide">A Letter to My Love</h2>
            <div className="w-24 h-[1px] bg-gold/30 mx-auto mt-6"></div>
          </div>

          {/* Interactive Envelope Container */}
          <div className="flex flex-col items-center justify-center py-12">
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
                    <span>June 29, 2026</span>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-muted line-clamp-6 md:line-clamp-none font-medium">
                    My love, finding you was like finding a quiet harbor in a beautiful storm. Every day spent next to you is a page in our magical fairytale. You make the world brighter, warmer, and endlessly beautiful. Thank you for your kindness, your endless support, and for simply being you. I love you, now and forever.
                  </p>
                  <div className="text-right text-xs font-poppins not-italic border-t border-gold/15 pt-2 mt-2">
                    <span>Yours always, Alexander</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted font-poppins tracking-widest uppercase mt-8 text-center" id="letter-prompt">
              {envelopeOpen ? "Click to close envelope" : "Click the envelope to read the letter"}
            </p>
          </div>
        </div>
      </section>

      {/* Reasons I Love You Section */}
      <section className="py-24 md:py-32 px-4 relative z-20 bg-beige/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span class="font-cormorant italic text-2xl text-gold tracking-wider mb-2 block">Whispered Truths</span>
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

      {/* Footer */}
      <footer className="py-12 bg-beige-dark/20 relative z-20 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 hover-target">
            <span className="font-playfair text-2xl text-dark tracking-[0.2em]">A</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-dark fill-pink-dark animate-pulse"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
            <span className="font-playfair text-2xl text-dark tracking-[0.2em]">I</span>
          </div>
          <p className="font-cormorant italic text-base text-muted mb-4 max-w-sm mx-auto">
            "Two souls with but a single thought, two hearts that beat as one."
          </p>
          <div className="w-12 h-[1px] bg-gold/20 mx-auto my-4"></div>
          <p className="font-poppins text-[10px] text-muted/80 tracking-widest uppercase">
            Made with Love • © 2026 Alexander & Isabella
          </p>
        </div>
      </footer>

      {/* Floating Cinematic Music Player */}
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
        
        {/* Audio element with premium Mixkit acoustic piano background music */}
        <audio id="bg-audio" ref={audioRef} loop preload="auto">
          <source src="https://assets.mixkit.co/music/preview/mixkit-serene-piano-1678.mp3" type="audio/mp3" />
        </audio>
      </div>

      {/* Premium Cinematic Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Premium Typography & Fonts Import */
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Poppins:wght@300;400;500;600&display=swap');

        /* Root Variable Settings */
        :root {
          --color-luxury: #FAF9F6;
          --color-beige-light: #FAF8F5;
          --color-beige: #F5F2EB;
          --color-beige-dark: #E6DFD3;
          --color-gold: #D4AF37;
          --color-gold-light: #F3E5AB;
          --color-gold-dark: #AA7C11;
          --color-pink: #FFB7C5;
          --color-pink-light: #FFE4E1;
          --color-pink-dark: #E8A7B5;
          --color-text-dark: #2C2A29;
          --color-text-muted: #6B6661;
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
          transition: transform 0.08s ease-out, width 0.3s, height 0.3s, border-color 0.3s;
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
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 12px 40px 0 rgba(142, 130, 115, 0.07);
        }

        .glass-card-hover {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-card-hover:hover {
          background: rgba(255, 255, 255, 0.65);
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
          background: radial-gradient(circle, rgba(255, 228, 225, 0.55) 0%, rgba(255, 255, 255, 0) 70%);
          filter: blur(40px);
        }

        .aurora-glow-2 {
          background: radial-gradient(circle, rgba(243, 229, 171, 0.45) 0%, rgba(255, 255, 255, 0) 70%);
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
        }

        .scroll-character-girl {
          right: 0;
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
          border-bottom: 110px solid #E3D9C9;
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
          border-left: 160px solid #DFD5C2;
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
          border-right: 160px solid #DFD5C2;
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
          border-top: 110px solid #D4C7B1;
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
          background: #FCFBF9;
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
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
        .bg-beige-light { background-color: #FAF8F5 !important; }
        .bg-beige { background-color: #F5F2EB !important; }
        .bg-beige-dark\/20 { background-color: rgba(230, 223, 211, 0.2) !important; }
        .bg-beige\/30 { background-color: rgba(245, 242, 235, 0.3) !important; }

        .text-gold-light { color: #F3E5AB !important; }
        .text-gold-dark { color: #AA7C11 !important; }
        .text-pink-dark { color: #E8A7B5 !important; }
        .text-gold { color: #D4AF37 !important; }
        .text-dark { color: #2C2A29 !important; }
        .text-muted { color: #6B6661 !important; }
        .text-pink\/80 { color: rgba(255, 183, 197, 0.8) !important; }

        .bg-gold { background-color: #D4AF37 !important; }
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
          background-color: #FFE4E1 !important;
          color: #2C2A29 !important;
        }
        #couple-website-root *::selection {
          background-color: #FFE4E1 !important;
          color: #2C2A29 !important;
        }
      ` }} />
    </div>
  );
}
