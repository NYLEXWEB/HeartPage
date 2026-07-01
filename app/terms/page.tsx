"use client";

import Link from "next/link";
import { Heart, ArrowLeft, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/actions/admin-dashboard";

export default function TermsPage() {
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
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-3.5xl font-luxury-serif font-extrabold text-slate-900 tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Last updated: July 1, 2026
            </p>
          </div>

          <div className="prose prose-slate prose-sm max-w-none space-y-6 text-sm md:text-base leading-relaxed text-slate-650">
            <p>
              Welcome to <strong>{siteTitle}</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions of use. Please read them carefully.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating a web space or using any services provided by {siteTitle}, you confirm that you accept these Terms of Service in full. If you do not agree with any part of these terms, you must not use this website.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                2. User Content &amp; Conduct
              </h2>
              <p>
                You are solely responsible for all details, messages, names, and images uploaded to your shared page. You agree not to upload content that:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                <li>Is unlawful, harmful, threatening, abusive, defamatory, or hateful.</li>
                <li>Infringes upon any trademark, copyright, or personal privacy.</li>
                <li>Contains unauthorized advertisements, promotional material, or spam.</li>
                <li>Features explicit, vulgar, or sexually inappropriate material.</li>
              </ul>
              <p>
                We reserve the right to delete any web page immediately and without notice if it violates these rules.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                3. Temporary Data Policy (TTL)
              </h2>
              <p>
                {siteTitle} is designed strictly for sharing temporary spaces. All created web pages and associated images, names, and messages are automatically and permanently deleted from our servers <strong>7 days (168 hours)</strong> after creation. 
              </p>
              <p className="text-sm italic bg-sky-50/50 p-3.5 rounded-xl border border-sky-100/50">
                Please note that deleted pages cannot be recovered or restored under any circumstances.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                4. Fees &amp; Payments
              </h2>
              <p>
                Certain features, such as publishing a page to a custom public URL, may require a one-time payment. All payments are processed securely via third-party integrations (e.g., Razorpay). By initiating a transaction, you authorize payment for the specified service. Once processed, payments are final and non-refundable due to the immediate resource allocation and hosting configuration.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                5. Disclaimer of Warranties
              </h2>
              <p>
                Our services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no representations or warranties of any kind, express or implied, regarding the availability, safety, accuracy, or uptime of the hosted URLs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                6. Contact Information
              </h2>
              <p>
                For questions regarding these Terms, please contact us at: <span className="font-semibold text-[#4ba3f7]">{settings?.contactEmail || "hello@heartpage.com"}</span>.
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
