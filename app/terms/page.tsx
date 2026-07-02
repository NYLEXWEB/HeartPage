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
              Welcome to <strong>{siteTitle}</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By accessing or using our website and services, you agree to comply with and be bound by the following Terms and Conditions.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, purchasing, or using our services, you agree to these Terms and Conditions. If you do not agree, please do not use our platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                2. Description of Services
              </h2>
              <p>
                Our platform provides users with the ability to create personalized digital invitation and memory websites, including but not limited to:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Wedding Invitation Websites</li>
                <li>Couple Memory Websites</li>
                <li>Best Friend Dedication Websites</li>
                <li>Breakup Memory Websites</li>
                <li>Other personalized digital templates</li>
              </ul>
              <p>
                Users may create, customize, and purchase these digital websites through our platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                3. User Responsibilities
              </h2>
              <p>Users are solely responsible for:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Providing accurate information.</li>
                <li>Uploading lawful content, including images, text, and media.</li>
                <li>Ensuring that all uploaded content belongs to them or that they have obtained proper permission.</li>
                <li>Maintaining the confidentiality of their account information.</li>
              </ul>
              <p>Users agree not to upload:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Illegal, harmful, abusive, defamatory, or offensive content.</li>
                <li>Copyrighted material without authorization.</li>
                <li>Content that violates any applicable laws or regulations.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                4. Payments and Purchases
              </h2>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>All payments made through the platform are final and non-refundable unless otherwise required by applicable law.</li>
                <li>Prices may change at any time without prior notice.</li>
                <li>Successful payment grants access to the purchased digital website according to the selected package.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                5. Intellectual Property
              </h2>
              <p>
                All templates, designs, source code, graphics, branding, and platform features remain the exclusive property of <strong>Nylex</strong>.
              </p>
              <p>
                Users retain ownership of the content they upload but grant us a limited license to process and display such content for the purpose of providing our services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                6. Service Availability
              </h2>
              <p>We strive to maintain uninterrupted service. However, we do not guarantee:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>Continuous availability,</li>
                <li>Error-free operation,</li>
                <li>Permanent storage of user data,</li>
                <li>Uninterrupted access to purchased websites.</li>
              </ul>
              <p>
                We reserve the right to suspend, modify, or discontinue services at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                7. Limitation of Liability
              </h2>
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>We shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages.</li>
                <li>We do not guarantee that the platform will be free from bugs, interruptions, cyber-attacks, data loss, or technical failures.</li>
                <li>Users acknowledge that they use the platform entirely at their own risk.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                8. User Content and Indemnification
              </h2>
              <p>
                Users agree to indemnify and hold harmless <strong>Nylex</strong>, its owners, employees, and affiliates from any claims, damages, losses, liabilities, costs, or legal expenses arising from:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li>User-generated content,</li>
                <li>Copyright violations,</li>
                <li>Defamation claims,</li>
                <li>Privacy violations,</li>
                <li>Illegal or unauthorized use of the platform.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                9. Third-Party Services
              </h2>
              <p>
                Our platform may integrate with third-party services, payment gateways, hosting providers, and analytics services. We are not responsible for their services, actions, or policies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                10. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate user access without notice if users violate these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                11. Disclaimer
              </h2>
              <p>
                The services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                12. Governing Law
              </h2>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-luxury-serif border-b border-sky-50 pb-1">
                13. Contact Information
              </h2>
              <p>For any questions regarding these Terms and Conditions, please contact:</p>
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
