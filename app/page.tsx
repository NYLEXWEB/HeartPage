"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Compass, 
  Gift, 
  CheckCircle,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { getActiveAnnouncement, getSettings } from "@/actions/admin-dashboard";

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2 font-medium text-zinc-100 hover:text-rose-400 transition-colors duration-200"
      >
        <span className="text-base md:text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-rose-400" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden text-sm md:text-base text-zinc-400 leading-relaxed"
      >
        <p className="pb-4 pt-1">{answer}</p>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);

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
        console.error("Failed to load public settings/announcement:", err);
      }
    }
    loadPublicData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const siteTitle = settings?.siteName || "HeartPage";

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen relative overflow-x-hidden">
      
      {/* Announcement Banner */}
      {announcement && announcement.isActive && (
        <div
          style={{ backgroundColor: announcement.backgroundColor }}
          className="text-white text-xs md:text-sm font-semibold py-3 px-4 flex items-center justify-center gap-3 relative z-50 text-center shadow-md"
        >
          <span>{announcement.title}: {announcement.description}</span>
          {announcement.buttonText && announcement.buttonLink && (
            <Link
              href={announcement.buttonLink}
              className="bg-white text-zinc-950 px-2.5 py-0.5 rounded text-[10px] md:text-xs font-extrabold uppercase tracking-wider hover:bg-zinc-100 transition-colors shrink-0"
            >
              {announcement.buttonText}
            </Link>
          )}
        </div>
      )}

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[5%] right-[20%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER / NAVIGATION */}
      <header className="border-b border-zinc-900/80 backdrop-blur-md sticky top-0 z-45">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-rose-400 transition-colors duration-200">
              {siteTitle}
            </span>
          </Link>
          <Link
            href="/create"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 flex items-center gap-1.5"
          >
            Create Your Website <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs md:text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Create beautifully personalized mini websites in seconds
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Create web spaces for <br />
            <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              your most precious links
            </span>
          </h1>

          <p className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Choose a relationship category, type your message, upload photos, and share a premium, bespoke mini website. No login, no complexity. Deletes automatically in 7 days.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 shadow-lg shadow-rose-500/20 hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              Start Building Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#examples"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors duration-200 flex items-center justify-center"
            >
              View Examples
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-zinc-500 text-xs md:text-sm font-medium">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-600" /> Active for 7 Days</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-zinc-600" /> No Account Required</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-1.5"><Trash2 className="w-4 h-4 text-zinc-600" /> Safe Auto-Delete</span>
          </div>
        </motion.div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="border-t border-zinc-900 bg-zinc-950/30 py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Three Completely Different Experiences
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base">
              These are not just simple color themes. Every template has its own unique animation logic, layout sequence, custom typography, and atmospheric flow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Couples */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-zinc-900/40 border border-rose-500/10 hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                  <Heart className="w-6 h-6 fill-rose-500/20" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Couples ❤️</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Soft blush pinks, gold overlays, and luxury serif typography. Features floating hearts, relationship length counters (down to the day), and romantic story timelines.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-zinc-500 border-t border-zinc-800/80 pt-4 font-medium">
                <li>• Floating Heart Particles</li>
                <li>• Live Years/Months/Days Counter</li>
                <li>• Gold Glow Glassmorphism</li>
              </ul>
            </motion.div>

            {/* Best Friends */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-zinc-900/40 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Best Friends 🤝</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Energetic neo-brutalism layout, playful typography, and poppy stickers. Features interactive emojis, Polaroid photo cards, and a certified bestie badge with confetti triggers.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-zinc-500 border-t border-zinc-800/80 pt-4 font-medium">
                <li>• Particle Emojis &amp; Confetti</li>
                <li>• Polaroid Mockups</li>
                <li>• Neo-brutalist Thick Boarders</li>
              </ul>
            </motion.div>

            {/* Breakup */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-zinc-900/40 border border-slate-500/10 hover:border-slate-500/30 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400 mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Breakup Memories 💔</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Deep slate hues, monospace typography, and quiet spacing. Features a falling rain particle background, monochrome galleries, and structured chapter blocks for acceptance.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-zinc-500 border-t border-zinc-800/80 pt-4 font-medium">
                <li>• Fall Rain Particles</li>
                <li>• Monochromatic Grayscale Filter</li>
                <li>• Cinematic Quiet Chapters</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EXAMPLES MOCKUP SECTION */}
      <section id="examples" className="py-24 border-t border-zinc-900 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Curated Masterpieces
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base">
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
              <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold inline-block">
                Couples Vibe Preview
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">
                Celebrate Love in its Purest Form
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Our Couple template features floating hearts, clean glass containers, and a live relationship ticker that displays exactly how long you have walked this earth together. The perfect anniversary present or spontaneous surprise.
              </p>
              <div className="flex gap-4 text-sm font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-rose-500" /> Hearts Particle</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-rose-500" /> Time Ticker</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 md:p-8 aspect-video flex items-center justify-center relative overflow-hidden"
            >
              <div className="w-full h-full bg-rose-950/20 border border-rose-900/30 rounded-2xl flex flex-col justify-center items-center text-center p-6 space-y-4">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-500/20 animate-pulse" />
                <h4 className="font-luxury text-2xl text-rose-200">Liam &amp; Sophia</h4>
                <div className="bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs px-3 py-1 rounded-full tracking-wider font-mono">
                  SINCE 2021
                </div>
                <p className="text-zinc-500 text-xs italic font-serif">
                  &ldquo;1,634 Days of laughter, travel, and quiet mornings...&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-zinc-900 bg-zinc-950/20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Create in Under Two Minutes
            </h2>
            <p className="text-zinc-400 mt-4 text-base">Simple, straight-to-the-point creation process.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: "01", title: "Select Category", desc: "Choose Couples, Best Friends, or Breakup memories." },
              { step: "02", title: "Enter Details", desc: "Fill in names, dates, custom letter, and upload photos." },
              { step: "03", title: "Pick Style", desc: "Select from beautifully designed Light or Dark themes." },
              { step: "04", title: "Generate & Share", desc: "Instantly launch your link. Keep it active for 7 days." },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col space-y-4 p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 w-8 h-8 rounded-full flex items-center justify-center">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-t border-zinc-900 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Loved by Thousands
            </h2>
            <p className="text-zinc-400 mt-4">Read about actual user experiences sharing their HeartPages.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
              <div key={idx} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
                <p className="text-zinc-300 text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-rose-400 border border-zinc-700">
                    {t.author.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.author}</h4>
                    <span className="text-xs text-zinc-500 font-medium">{t.relation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 border-t border-zinc-900 bg-zinc-950/20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-rose-500" /> Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 mt-2">Everything you need to know about HeartPage.</p>
          </div>

          <div className="space-y-2">
            <FAQItem
              question="Is HeartPage completely free?"
              answer="Yes, creating and sharing pages is 100% free. There are no premium lockouts, subscription models, or hidden costs. We built this as a dedicated sandbox for sharing quick, memorable spaces."
            />
            <FAQItem
              question="Why do pages delete after 7 days?"
              answer="HeartPage is built to host temporary memories without clutter. Using MongoDB TTL (Time to Live) indexes, your pages are automatically cleared from our servers after exactly 168 hours (7 days) from creation. This keeps our database lightweight and respect's privacy."
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
      <section className="container mx-auto px-4 py-20 relative z-10 max-w-5xl">
        <div className="rounded-3xl p-8 md:p-16 bg-gradient-to-br from-rose-950/20 via-zinc-900 to-zinc-950 border border-zinc-800 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Ready to Build Your Space?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Create a custom, dynamic website for someone special right now. No signup required. Active online for 7 days.
          </p>
          <div className="pt-4">
            <Link
              href="/create"
              className="px-8 py-4 rounded-xl text-base font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 shadow-lg shadow-rose-500/20 inline-flex items-center gap-2 hover:scale-[1.02] group"
            >
              Create Your HeartPage
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-center text-xs text-zinc-600 relative z-10">
        <div className="container mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="font-bold text-zinc-400">{siteTitle}</span>
          </div>
          <p>{settings?.footerText || `© ${new Date().getFullYear()} HeartPage. Built for sharing special moments.`}</p>
          <p className="text-[10px] text-zinc-700">All data automatically deletes after 7 days via TTL indexing.</p>
        </div>
      </footer>

    </div>
  );
}
