"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSettings, updateSettings } from "@/actions/admin-dashboard";
import { motion } from "framer-motion";
import {
  Settings,
  Mail,
  ShieldAlert,
  Save,
  Loader2,
  CheckCircle,
  FileText
} from "lucide-react";

// Form validation schema
const settingsFormSchema = z.object({
  siteName: z.string().min(2, "Site Name must be at least 2 characters"),
  logo: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
  socialLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
  }),
  defaultExpiryDays: z.number().min(1, "Minimum expiry is 1 day").max(365, "Maximum expiry is 365 days"),
  maintenanceMode: z.boolean(),
  paymentEnabled: z.boolean(),
  footerText: z.string().min(5, "Footer text must be at least 5 characters"),
});

type SettingsFormInput = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsFormSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await getSettings();
        if (res.success && res.settings) {
          reset({
            siteName: res.settings.siteName,
            logo: res.settings.logo || "",
            contactEmail: res.settings.contactEmail,
            socialLinks: {
              instagram: res.settings.socialLinks?.instagram || "",
              twitter: res.settings.socialLinks?.twitter || "",
              facebook: res.settings.socialLinks?.facebook || "",
            },
            defaultExpiryDays: res.settings.defaultExpiryDays || 7,
            maintenanceMode: res.settings.maintenanceMode || false,
            paymentEnabled: res.settings.paymentEnabled ?? true,
            footerText: res.settings.footerText,
          });
        } else {
          setError(res.error || "Failed to retrieve configuration data.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load preferences.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsFormInput) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await updateSettings(data);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to save configuration settings.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-zinc-900 rounded" />
        <div className="h-10 w-64 bg-zinc-900 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="h-64 bg-zinc-900 rounded-3xl" />
          <div className="h-64 bg-zinc-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">System Configuration</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Platform Settings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        
        {/* Status Messages */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-200"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Global settings updated successfully in MongoDB Atlas.</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center gap-2.5 text-xs text-red-200"
          >
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* SETTINGS CARD WRAPPER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Core Configuration */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Settings className="w-4 h-4 text-rose-500" /> Platform Details
            </h3>

            {/* Site Name */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-400 font-bold uppercase tracking-wider font-mono">Website Name</label>
              <input
                type="text"
                {...register("siteName")}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-white"
              />
              {errors.siteName && (
                <span className="text-[10px] text-red-500">{errors.siteName.message}</span>
              )}
            </div>

            {/* Site Logo string URL/Base64 */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-400 font-bold uppercase tracking-wider font-mono">Logo Image URL / Base64</label>
              <input
                type="text"
                placeholder="e.g. data:image/png;base64,..."
                {...register("logo")}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>

            {/* Default Expiry Days */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-400 font-bold uppercase tracking-wider font-mono">Default TTL Expiry (Days)</label>
              <input
                type="number"
                {...register("defaultExpiryDays", { valueAsNumber: true })}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-white font-mono"
              />
              {errors.defaultExpiryDays && (
                <span className="text-[10px] text-red-500">{errors.defaultExpiryDays.message}</span>
              )}
              <span className="text-[10px] text-zinc-500 leading-normal block">
                Number of days a newly created relationship mini site remains active before expiring and getting purged.
              </span>
            </div>
          </div>

          {/* Card 2: Contact & Social Settings */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Mail className="w-4 h-4 text-purple-500" /> Communications &amp; Links
            </h3>

            {/* Contact Email */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-400 font-bold uppercase tracking-wider font-mono">Support Contact Email</label>
              <input
                type="email"
                {...register("contactEmail")}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-white"
              />
              {errors.contactEmail && (
                <span className="text-[10px] text-red-500">{errors.contactEmail.message}</span>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2">
              <label className="text-zinc-400 font-bold uppercase tracking-wider font-mono text-xs">Social Network Paths</label>

              {/* Instagram */}
              <div className="relative text-xs">
                <span className="absolute left-3 top-3.5 text-zinc-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="https://instagram.com/handle"
                  {...register("socialLinks.instagram")}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs font-mono"
                />
              </div>

              {/* Twitter */}
              <div className="relative text-xs">
                <span className="absolute left-3 top-3.5 text-zinc-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="https://twitter.com/handle"
                  {...register("socialLinks.twitter")}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs font-mono"
                />
              </div>

              {/* Facebook */}
              <div className="relative text-xs">
                <span className="absolute left-3 top-3.5 text-zinc-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="https://facebook.com/handle"
                  {...register("socialLinks.facebook")}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 3: System Status & Footer */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl md:col-span-2">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2 pb-3 border-b border-zinc-900">
              <FileText className="w-4 h-4 text-cyan-400" /> System Banner &amp; Footer Layout
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Footer text */}
              <div className="space-y-1.5 text-xs">
                <label className="text-zinc-400 font-bold uppercase tracking-wider font-mono">Footer Copyright Text</label>
                <input
                  type="text"
                  {...register("footerText")}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-white"
                />
                {errors.footerText && (
                  <span className="text-[10px] text-red-500">{errors.footerText.message}</span>
                )}
              </div>

              {/* Maintenance Mode */}
              <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-white font-mono block">MAINTENANCE MODE</span>
                  <span className="text-[9px] text-zinc-500 font-mono leading-normal block">
                    Blocks creator wizard and serves a clean placeholder maintenance template.
                  </span>
                </div>
                
                {/* Custom toggle slider */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("maintenanceMode")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 peer-checked:after:bg-white" />
                </label>
              </div>

              {/* Payment Status (Razorpay Toggle) */}
              <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-white font-mono block">PAYMENT REQUIREMENT</span>
                  <span className="text-[9px] text-zinc-500 font-mono leading-normal block">
                    If enabled, users must pay via Razorpay to generate links. If disabled, links are generated for free.
                  </span>
                </div>
                
                {/* Custom toggle slider */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("paymentEnabled")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white" />
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* Form Actions Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save System Settings
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
