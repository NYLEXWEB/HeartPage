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
              At <strong>{siteTitle}</strong>, we value your privacy and are committed to protecting your personal information.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                1. Information We Collect
              </h2>
              <p>We may collect:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Uploaded images</li>
                <li>User-generated content</li>
                <li>Payment information (processed through third-party payment providers)</li>
                <li>Device information</li>
                <li>Browser information</li>
                <li>IP address</li>
                <li>Usage analytics</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                2. How We Use Information
              </h2>
              <p>We use collected information to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Create personalized websites.</li>
                <li>Process payments.</li>
                <li>Deliver purchased services.</li>
                <li>Improve platform performance.</li>
                <li>Provide customer support.</li>
                <li>Prevent fraud and abuse.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                3. User Content
              </h2>
              <p>
                Users retain ownership of all uploaded content. However, users grant us permission to process, display, and store such content for providing our services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                4. Payment Information
              </h2>
              <p>
                Payment transactions are processed through third-party payment providers. We do not store complete payment card information on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                5. Data Security
              </h2>
              <p>
                We implement commercially reasonable security measures to protect user information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                6. Cookies and Tracking
              </h2>
              <p>We may use cookies and analytics technologies to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Improve user experience.</li>
                <li>Analyze website traffic.</li>
                <li>Monitor platform performance.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                7. Data Retention
              </h2>
              <p>
                We retain user information only as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                8. Third-Party Services
              </h2>
              <p>We may share information with trusted third-party providers including:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Payment processors.</li>
                <li>Hosting providers.</li>
                <li>Analytics providers.</li>
                <li>Cloud storage services.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                9. Children&apos;s Privacy
              </h2>
              <p>
                Our services are not intended for children under 13 years of age.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                10. Limitation of Liability
              </h2>
              <p>
                We shall not be liable for unauthorized access, cyber-attacks, data breaches, service interruptions, or losses beyond our reasonable control.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                11. User Rights
              </h2>
              <p>Users may request:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Access to their information.</li>
                <li>Correction of information.</li>
                <li>Deletion of information.</li>
                <li>Withdrawal of consent where applicable.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                12. Changes to this Policy
              </h2>
              <p>
                We reserve the right to update this Privacy Policy at any time. Continued use of the platform constitutes acceptance of any revised policy.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                13. Contact Us
              </h2>
              <p>If you have any questions regarding this Privacy Policy, please contact:</p>
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100/50 text-sm space-y-1">
                <p><strong>Email:</strong> <a href="mailto:buildwithnylex@gmail.com" className="text-sky-600 hover:underline">buildwithnylex@gmail.com</a></p>
                <p><strong>Company:</strong> Nylex</p>
                <p><strong>Location:</strong> Kerala, India</p>
              </div>
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
