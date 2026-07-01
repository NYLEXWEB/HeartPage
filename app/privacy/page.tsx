"use client";

import Link from "next/link";
import { Heart, ArrowLeft, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/actions/admin-dashboard";

export default function PrivacyPage() {
  const [settings, setSettings] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const setRes = await getSettings();
        if (setRes.success && setRes.settings) {
          setSettings(setRes.settings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadData();
  }, []);

  const siteTitle = settings?.siteName || "HeartPage";

  return (
    <div className="bg-[#FAFDFE] text-slate-700 min-h-screen relative overflow-x-hidden py-12 px-6">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0f2fe_1px,transparent_1px),linear-gradient(to_bottom,#e0f2fe_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#4ba3f7] flex items-center justify-center shadow-md shadow-sky-400/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-luxury font-extrabold text-xl tracking-tight text-slate-900">
              {siteTitle}
            </span>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-slate-500 hover:text-sky-650 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Link>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-sky-100 rounded-3xl p-8 md:p-12 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-3.5xl font-luxury-serif font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Last updated: July 1, 2026
            </p>
          </div>

          <div className="prose prose-slate prose-sm max-w-none space-y-6 text-sm md:text-base leading-relaxed text-slate-650">
            <p>
              Your privacy is extremely important to us. This Privacy Policy details the types of information we collect, how we process it, and our strict data deletion policies.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                1. No Account Creation
              </h2>
              <p>
                {siteTitle} does not require you to create an account, register an email address, or set a password. We do not ask for any personal identifiers beyond the names and messages you voluntarily submit to generate a customized web page.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                2. Information We Collect
              </h2>
              <p>
                We only collect and store data that is explicitly entered into our website creation forms:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                <li><strong>Creator Name &amp; Partner/Celebrant Name</strong>: To customize titles and headings.</li>
                <li><strong>Personal Messages</strong>: The text you write to customize the digital letter or card.</li>
                <li><strong>Dates</strong>: Relationship milestones, birthdays, or wedding event dates to run timers and countdowns.</li>
                <li><strong>Images</strong>: Base64 compressed image strings uploaded to customize your layout.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                3. Strict 7-Day Auto-Deletion (TTL)
              </h2>
              <p>
                To maintain a secure and lightweight environment, we use a automated database TTL (Time-to-Live) index. <strong>Every single record, including names, dates, text, and images, is completely and permanently wiped from our server database exactly 7 days after it is created.</strong>
              </p>
              <p>
                Once a record is deleted, it is unrecoverable and the public slug will return a 404 Not Found error.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                4. Payment Processing
              </h2>
              <p>
                When you perform a transaction on {siteTitle}, your payment credentials are submitted directly to our secure third-party gateway (e.g., Razorpay). We do not store, process, or view credit/debit card details, bank information, or other billing secrets on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                5. Third-Party Links
              </h2>
              <p>
                Some generated templates may include buttons that redirect users to external apps (like WhatsApp) to send RSVP replies. This Privacy Policy only governs {siteTitle}. We do not control or take responsibility for the privacy practices of external platforms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                6. Contact Information
              </h2>
              <p>
                If you have any questions or concern regarding the privacy of your details, please reach out to us at: <span className="font-semibold text-[#4ba3f7]">{settings?.contactEmail || "hello@heartpage.com"}</span>.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 font-mono">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`}</p>
        </footer>
      </div>
    </div>
  );
}
