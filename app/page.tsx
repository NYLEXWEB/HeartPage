"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Trash2,
  Sparkles,
  ArrowRight,
  Clock,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  Lock,
  Star
} from "lucide-react";
import { getActiveAnnouncement, getSettings } from "@/actions/admin-dashboard";

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-sky-100 py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2 font-luxury font-bold text-slate-900 hover:text-sky-600 transition-colors duration-200"
      >
        <span className="text-base md:text-lg">{isOpen ? "•" : ""} {question}</span>
        <ChevronDown className={`w-5 h-5 text-sky-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-sky-600" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden text-sm md:text-base text-slate-500 leading-relaxed"
      >
        <p className="pb-4 pt-2">{answer}</p>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    async function loadPublicData() {
      try {
        const annRes = await getActiveAnnouncement();
        if (annRes.success && annRes.announcement) {
          setAnnouncement(annRes.announcement);
        }
        const setRes = await getSettings();
        if (setRes.success && setRes.settings) {
          setSettings(setRes.settings);
        }
      } catch (err) {
        console.error("Failed to load public data:", err);
      }
    }
    loadPublicData();

    // Generate floating hearts outline asynchronously
    const timer = setTimeout(() => {
      const generated = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 16 + 8,
        delay: Math.random() * 5,
        duration: Math.random() * 8 + 6,
      }));
      setHearts(generated);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const siteTitle = settings?.siteName || "HeartPage";

  return (
    <div className="bg-[#FAFDFE] text-slate-700 min-h-screen relative overflow-x-hidden">

      {/* Announcement Banner */}
      {announcement && announcement.isActive && (
        <div
          style={{ backgroundColor: announcement.backgroundColor }}
          className="text-white text-xs md:text-sm font-semibold py-3 px-4 flex items-center justify-center gap-3 relative z-50 text-center shadow-md bg-gradient-to-r from-sky-500 to-sky-600"
        >
          <span>{announcement.title}: {announcement.description}</span>
          {announcement.buttonText && announcement.buttonLink && (
            <Link
              href={announcement.buttonLink}
              className="bg-white text-sky-600 px-2.5 py-0.5 rounded text-[10px] md:text-xs font-extrabold uppercase tracking-wider hover:bg-sky-50 transition-colors shrink-0"
            >
              {announcement.buttonText}
            </Link>
          )}
        </div>
      )}

      <div className="relative">
        {/* HEADER / NAVIGATION */}
        <header className="absolute top-0 left-0 right-0 z-45 bg-transparent">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[#4ba3f7] flex items-center justify-center shadow-md shadow-sky-400/20 group-hover:scale-105 transition-transform duration-200">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-luxury font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-[#4ba3f7] transition-colors duration-200">
                Heart<span className="text-[#4ba3f7]">Page</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-500">
              <Link href="/" className="relative text-[#4ba3f7] font-bold py-1">
                Features
                <span className="absolute bottom-0 left-0 w-8 h-[2.5px] bg-[#4ba3f7] rounded-full" />
              </Link>
              <Link href="#examples" className="hover:text-[#4ba3f7] transition-colors">Examples</Link>
              <Link href="#how-it-works" className="hover:text-[#4ba3f7] transition-colors">How It Works</Link>
              <Link href="#faq" className="hover:text-[#4ba3f7] transition-colors">FAQ</Link>
            </nav>

            <Link
              href="/create"
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#4ba3f7] hover:bg-[#357abd] text-white transition-all duration-200 shadow-md shadow-sky-500/10 flex items-center gap-1.5 group hover:scale-[1.01]"
            >
              Create Your Website <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* HERO SECTION (100% Identical Background & Look) */}
        <section className="relative w-full min-h-[90vh] flex flex-col justify-between overflow-hidden">

          {/* Full-bleed Beach Couple Background Image */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img
              src="/romantic_beach_couple_raw.jpg"
              alt="Romantic couple standing near beach during golden hour wearing white outfits"
              className="w-full h-full object-cover object-[center_35%] filter brightness-[1.01] contrast-[0.99]"
            />
            {/* Subtle frosted overlays to blend readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent lg:block hidden w-[55%]" />
            <div className="absolute inset-0 bg-white/70 lg:hidden block" />
          </div>

          {/* Floating Heart & Curved Line Overlays from Screenshot */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Floating curve outline in top right */}
            <svg className="absolute top-[10%] right-[5%] w-[350px] h-[250px] text-sky-400/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
              <path d="M10,80 Q50,20 90,60" />
              <path d="M10,90 Q60,30 90,80" strokeWidth="0.5" />
            </svg>

            {/* Floating Heart Icon 1 (Solid heart top-middle) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] right-[32%] text-sky-400/50"
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>

            {/* Floating Heart Icon 2 (Subtle outline right-side) */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[38%] right-[10%] text-sky-400/40"
            >
              <Heart className="w-4 h-4 fill-none stroke-[2px]" />
            </motion.div>

            {/* Drifting subtle heart outline loops */}
            <AnimatePresence>
              {hearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  className="absolute text-sky-400/15"
                  style={{
                    left: `${heart.x}%`,
                    fontSize: `${heart.size}px`,
                  }}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{
                    y: "-10%",
                    opacity: [0, 0.5, 0.5, 0],
                  }}
                  transition={{
                    duration: heart.duration,
                    delay: heart.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="w-6 h-6 stroke-[1px] fill-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* HERO CONTENT CONTAINER */}
          <div className="container mx-auto px-6 sm:px-12 lg:px-20 pt-28 md:pt-32 pb-24 relative z-20 max-w-7xl flex-1 flex flex-col justify-center items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-xl space-y-6 text-left"
            >
              {/* Small Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sky-100/80 text-sky-650 text-xs font-semibold tracking-wide shadow-sm shadow-sky-100/10">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" fill="currentColor" /> Create beautifully personalized mini websites in seconds
              </div>

            {/* Main Heading & Script Subtitle */}
            <h1 className="text-5xl sm:text-6.5xl leading-[1.08] tracking-tight text-[#0B1220] font-luxury-serif font-medium">
              Create web spaces for <br />
              <span className="font-luxury-serif italic font-normal text-[#8FB7F7] text-5xl sm:text-7xl lg:text-[5rem] inline-block relative mt-2 tracking-normal">
                your most precious links

                {/* Underline Curved Swoosh */}
                <svg className="absolute left-0 bottom-[-8px] w-full h-[12px] text-[#8FB7F7]/80" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2,2 Q50,9 98,2" />
                </svg>

                {/* Cursive Heart outline adjacent */}
                <span className="absolute right-[-24px] top-1/2 -translate-y-1/2 text-[#8FB7F7] transform rotate-[12deg]">
                  <Heart className="w-5 h-5 fill-none stroke-[1.5px]" />
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-550 text-sm sm:text-base leading-relaxed pt-2 font-medium">
              Choose a relationship category, type your message, upload photos, and share a premium, bespoke mini website. No login, no complexity. Deletes automatically in 7 days.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/create"
                className="px-8 py-3.5 rounded-full text-base font-bold bg-[#4ba3f7] hover:bg-[#357abd] text-white transition-all duration-200 shadow-md shadow-sky-500/15 flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                Start Building Now <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#examples"
                className="px-8 py-3.5 rounded-full text-base font-semibold bg-[#eaf4ff]/40 hover:bg-[#eaf4ff]/70 text-[#4ba3f7] border border-[#e3eefd] transition-colors duration-200 flex items-center justify-center rounded-full shadow-sm"
              >
                View Examples
              </a>
            </div>

          </motion.div>
        </div>

        {/* FEATURES ROW (Frosted container at the bottom) */}
        <div className="w-full max-w-7xl mx-auto px-6 mb-12 relative z-25">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-[32px] border border-sky-100/50 p-6 sm:p-8 shadow-[0_12px_42px_rgba(14,165,233,0.04)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#eaf4ff]/70 flex items-center justify-center text-[#4ba3f7] shrink-0 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Active for 7 Days</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-normal">Your page stays live for a whole week.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 lg:border-l lg:border-sky-100/60 lg:pl-6">
                <div className="w-11 h-11 rounded-2xl bg-[#eaf4ff]/70 flex items-center justify-center text-[#4ba3f7] shrink-0 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">No Account Required</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-normal">Create and share instantly.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 lg:border-l lg:border-sky-100/60 lg:pl-6">
                <div className="w-11 h-11 rounded-2xl bg-[#eaf4ff]/70 flex items-center justify-center text-[#4ba3f7] shrink-0 shadow-sm">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Premium & Bespoke</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-normal">Beautiful, personalized and unique.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4 lg:border-l lg:border-sky-100/60 lg:pl-6">
                <div className="w-11 h-11 rounded-2xl bg-[#eaf4ff]/70 flex items-center justify-center text-[#4ba3f7] shrink-0 shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Safe Auto-Delete</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-normal">Your page is deleted automatically.</p>
                </div>
              </div>
            </div>

            {/* Trusted Footnote */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#4ba3f7]/85 mt-6 border-t border-sky-100/30 pt-4">
              <Heart className="w-3.5 h-3.5 fill-[#4ba3f7]" />
              <span>Trusted by people who value meaningful connections</span>
            </div>
          </motion.div>
        </div>

      </section>
      </div>

      {/* CATEGORIES SECTION */}
      <section className="border-t border-sky-100/50 bg-[#F8FAFC] py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-luxury-serif font-bold text-slate-900 tracking-tight">
              Three Completely Different Experiences
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base">
              These are not just simple color themes. Every template has its own unique animation logic, layout sequence, custom typography, and atmospheric flow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Couples */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm transition-all duration-300 flex flex-col justify-between h-full hover:shadow-md hover:shadow-sky-500/5"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6">
                  <Heart className="w-6 h-6 fill-sky-500/10" />
                </div>
                <h3 className="text-2xl font-luxury-serif font-bold text-slate-900 mb-3">Couples ❤️</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Soft blush pinks, gold overlays, and luxury serif typography. Features floating hearts, relationship length counters (down to the day), and romantic story timelines.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 border-t border-slate-100 pt-4 font-semibold">
                <li>• Floating Heart Particles</li>
                <li>• Live Years/Months/Days Counter</li>
                <li>• Gold Glow Glassmorphism</li>
              </ul>
            </motion.div>

            {/* Best Friends */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm transition-all duration-300 flex flex-col justify-between h-full hover:shadow-md hover:shadow-sky-500/5"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-luxury-serif font-bold text-slate-900 mb-3">Best Friends 🤝</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Energetic neo-brutalism layout, playful typography, and poppy stickers. Features interactive emojis, Polaroid photo cards, and a certified bestie badge with confetti triggers.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 border-t border-slate-100 pt-4 font-semibold">
                <li>• Particle Emojis &amp; Confetti</li>
                <li>• Polaroid Mockups</li>
                <li>• Neo-brutalist Thick Borders</li>
              </ul>
            </motion.div>

            {/* Breakup */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm transition-all duration-300 flex flex-col justify-between h-full hover:shadow-md hover:shadow-sky-500/5"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-luxury-serif font-bold text-slate-900 mb-3">Breakup Memories 💔</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Deep slate hues, monospace typography, and quiet spacing. Features a falling rain particle background, monochrome galleries, and structured chapter blocks for acceptance.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 border-t border-slate-100 pt-4 font-semibold">
                <li>• Fall Rain Particles</li>
                <li>• Monochromatic Grayscale Filter</li>
                <li>• Cinematic Quiet Chapters</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EXAMPLES SECTION */}
      <section id="examples" className="py-24 border-t border-sky-100/50 bg-white relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-luxury-serif font-bold text-slate-900 tracking-tight">
              Curated Masterpieces
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base">
              No generic cards or oversized shadow blobs. We build our design system around the elite visual structures of Vercel, Stripe, and Apple.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold inline-block">
                Couples Vibe Preview
              </div>
              <h3 className="text-3xl md:text-4xl font-luxury-serif font-bold text-slate-900 leading-tight">
                Celebrate Love in its Purest Form
              </h3>
              <p className="text-slate-550 leading-relaxed text-sm md:text-base font-medium">
                Our Couple template features floating hearts, clean glass containers, and a live relationship ticker that displays exactly how long you have walked this earth together. The perfect anniversary present or spontaneous surprise.
              </p>
              <div className="flex gap-6 text-sm font-semibold text-sky-500">
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Hearts Particle</span>
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 fill-currentColor" /> Time Ticker</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-[#FAFDFE] border border-sky-100 rounded-3xl p-6 md:p-10 aspect-video flex items-center justify-center relative overflow-hidden shadow-sm"
            >
              <div className="w-full h-full bg-white border border-sky-100/60 rounded-2xl flex flex-col justify-center items-center text-center p-6 space-y-4 shadow-sm">
                <Heart className="w-12 h-12 text-sky-500 fill-sky-500/10 animate-pulse" />
                <h4 className="font-luxury-serif font-bold text-2xl text-slate-900">Liam &amp; Sophia</h4>
                <div className="bg-sky-50 border border-sky-100 text-sky-650 text-xs px-3 py-1 rounded-full tracking-wider font-mono font-bold">
                  SINCE 2021
                </div>
                <p className="text-slate-400 text-xs italic font-serif">
                  &ldquo;1,634 Days of laughter, travel, and quiet mornings...&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 border-t border-sky-100/50 bg-[#F8FAFC] relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-luxury-serif font-bold text-slate-900 tracking-tight">
              Create in Under Two Minutes
            </h2>
            <p className="text-slate-500 text-base">Simple, straight-to-the-point creation process.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {[
              { step: "01", title: "Select Category", desc: "Choose Couples, Best Friends, or Breakup memories." },
              { step: "02", title: "Enter Details", desc: "Fill in names, dates, custom letter, and upload photos." },
              { step: "03", title: "Pick Style", desc: "Select from beautifully designed Light or Dark themes." },
              { step: "04", title: "Generate & Share", desc: "Instantly launch your link. Keep it active for 7 days." },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col space-y-4 p-6 bg-white border border-sky-100 rounded-2xl shadow-sm">
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 border border-sky-100 w-8 h-8 rounded-full flex items-center justify-center">
                  {item.step}
                </span>
                <h3 className="text-lg font-luxury-serif font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-t border-sky-100/50 relative z-10 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-luxury-serif font-bold text-slate-900 tracking-tight">
              Loved by Thousands
            </h2>
            <p className="text-slate-500">Read about actual user experiences sharing their HeartPages.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I created a couples page for our anniversary in literally 3 minutes. Storing it as a temporary site was perfect. Sophie was so emotional she cried!",
                author: "Marcus K.",
                relation: "Created Couples Site"
              },
              {
                quote: "The best friends theme looks absolutely incredible! We shared a link inside our group chat with polaroid memories and everyone was laughing.",
                author: "Sarah L.",
                relation: "Created Friends Site"
              },
              {
                quote: "After our final conversation, we needed a place to archive the good times and let go respectfully. The Breakup template's dark rain design felt very quiet and cinematic.",
                author: "Toby A.",
                relation: "Created Breakup Site"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 md:p-8 rounded-2xl bg-[#FAFDFE] border border-sky-100/60 flex flex-col justify-between shadow-sm">
                <p className="text-slate-500 text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-sm text-sky-500 border border-sky-100 shadow-sm">
                    {t.author.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 font-luxury">{t.author}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">{t.relation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 border-t border-sky-100/50 bg-[#F8FAFC] relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-luxury-serif font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-sky-500" /> Frequently Asked Questions
            </h2>
            <p className="text-slate-500">Everything you need to know about HeartPage.</p>
          </div>

          <div className="space-y-2 bg-white rounded-3xl p-6 md:p-10 border border-sky-100 shadow-sm">
            <FAQItem
              question="Is HeartPage completely free?"
              answer="Yes, creating and sharing pages is 100% free. There are no premium lockouts, subscription models, or hidden costs. We built this as a dedicated sandbox for sharing quick, memorable spaces."
            />
            <FAQItem
              question="Why do pages delete after 7 days?"
              answer="HeartPage is built to host temporary memories without clutter. Using MongoDB TTL (Time to Live) indexes, your pages are automatically cleared from our servers after exactly 168 hours (7 days) from creation. This keeps our database lightweight and respects privacy."
            />
            <FAQItem
              question="Do I need to sign up or log in?"
              answer="No, there are no passwords, emails, or user accounts. You jump straight into the builder, create the page, save it, and receive a secure unique slug. You don't have to manage any profiles."
            />
            <FAQItem
              question="How does image upload work?"
              answer="We compress your images client-side down to lightweight files (typically under 100KB each) and encode them as Base64 strings. They are stored directly inside our secure database, meaning they require zero third-party hosting setup and render instantly."
            />
            <FAQItem
              question="Can I edit a page after generating it?"
              answer="Since we do not require signups or store passwords, generated pages cannot be modified once they are saved. If you made a typo or want to update something, you can easily create a new page in a few seconds!"
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="container mx-auto px-6 py-20 relative z-10 max-w-5xl">
        <div className="rounded-[40px] p-8 md:p-16 bg-gradient-to-r from-sky-400 to-sky-550 text-center space-y-6 relative overflow-hidden shadow-xl shadow-sky-500/10 border border-sky-400/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-luxury-serif font-extrabold text-white tracking-tight">
            Ready to Build Your Space?
          </h2>
          <p className="text-white/85 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Create a custom, dynamic website for someone special right now. No signup required. Active online for 7 days.
          </p>
          <div className="pt-4">
            <Link
              href="/create"
              className="px-8 py-4 rounded-full text-base font-bold bg-white text-sky-650 hover:bg-slate-50 transition-all duration-200 shadow-lg shadow-sky-700/10 inline-flex items-center gap-2 hover:scale-[1.02] group"
            >
              Create Your HeartPage
              <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-sky-100/50 bg-[#F8FAFC] py-12 text-center text-xs text-slate-500 relative z-10">
        <div className="container mx-auto px-6 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <Heart className="w-4 h-4 text-sky-500 fill-sky-500" />
            <span className="font-bold text-slate-900 font-luxury-serif">{siteTitle}</span>
          </div>
          <p>{settings?.footerText || `© ${new Date().getFullYear()} HeartPage. Built for sharing special moments.`}</p>
          <p className="text-[10px] text-slate-400 font-medium">All data automatically deletes after 7 days via TTL indexing.</p>
        </div>
      </footer>

    </div>
  );
}
