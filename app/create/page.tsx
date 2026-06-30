"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Users, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Upload, 
  Check, 
  Sparkles, 
  Clock, 
  Loader2,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { websiteFormSchema, WebsiteInput } from "@/lib/validation";
import { createWebsite } from "@/actions/website";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "template" | "preview">("details");
  const [activeCategory, setActiveCategory] = useState<"couples" | "friends" | "breakup">("couples");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<WebsiteInput>({
    resolver: zodResolver(websiteFormSchema),
    mode: "onChange",
    defaultValues: {
      category: "couples",
      theme: "dark",
      yourName: "",
      partnerName: "",
      relationshipDate: "",
      message: "",
    },
  });

  // Watch fields for live preview
  const formValues = watch();

  // Handle category change - Reset form with appropriate defaults
  const handleCategoryChange = (cat: "couples" | "friends" | "breakup") => {
    setActiveCategory(cat);
    setSubmitError(null);
    
    // Clear and reset form values based on category defaults
    reset({
      category: cat,
      theme: formValues.theme || "dark",
      yourName: "",
      partnerName: "",
      relationshipDate: cat === "breakup" ? "2021 - 2025" : "",
      message: "",
    });
  };

  // Sync form category with active tab state
  useEffect(() => {
    setValue("category", activeCategory, { shouldValidate: true });
  }, [activeCategory, setValue]);

  // Submit flow
  const onFormSubmit = async (data: WebsiteInput) => {
    // If we're at the details step, advance to templates
    if (step === "details") {
      setStep("template");
      return;
    }

    // If we're at the templates step, advance to full screen preview
    if (step === "template") {
      setStep("preview");
      return;
    }

    // If we are at the preview step, generate the website
    if (step === "preview") {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const response = await createWebsite(data);
        if (response.success) {
          router.push(`/success/${response.slug}`);
        } else {
          setSubmitError(response.error || "Failed to generate website.");
          setIsSubmitting(false);
        }
      } catch (err: any) {
        setSubmitError(err.message || "An unexpected error occurred.");
        setIsSubmitting(false);
      }
    }
  };

  // Helper validation for current step
  const canProceedToTemplates = 
    formValues.yourName?.trim().length >= 2 &&
    formValues.partnerName?.trim().length >= 2 &&
    formValues.message?.trim().length >= 5 &&
    (activeCategory !== "friends" || (formValues.relationshipDate && formValues.relationshipDate.trim().length >= 2));

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col">
      {/* Top wizard bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step === "details") router.push("/");
                if (step === "template") setStep("details");
                if (step === "preview") setStep("template");
              }}
              className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <span className="text-zinc-500 text-xs md:text-sm font-mono hidden sm:inline">
              Step {step === "details" ? "1" : step === "template" ? "2" : "3"} of 3: {
                step === "details" ? "Enter Details" : step === "template" ? "Select Theme" : "Verify Preview"
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">HeartPage Builder</span>
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {submitError && (
        <div className="bg-red-950/40 border-b border-red-900/50 text-red-200 px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* WIZARD CONTAINER */}
      <div className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: DETAILS & LIVE PREVIEW */}
          {step === "details" && (
            <motion.div
              key="details-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 grid lg:grid-cols-12 overflow-hidden min-h-[calc(100vh-64px)]"
            >
              {/* Form Column */}
              <div className="lg:col-span-5 border-r border-zinc-900 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
                
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold font-mono">
                    1. Select Experience Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "couples", label: "Couples", emoji: "❤️", color: "hover:border-rose-500/50 active:bg-rose-950/10 text-rose-400" },
                      { id: "friends", label: "Friends", emoji: "🤝", color: "hover:border-purple-500/50 active:bg-purple-950/10 text-purple-400" },
                      { id: "breakup", label: "Breakup", emoji: "💔", color: "hover:border-slate-500/50 active:bg-slate-950/10 text-slate-400" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleCategoryChange(tab.id as any)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                          activeCategory === tab.id
                            ? "bg-zinc-900 border-rose-500 shadow-md text-white scale-[1.02]"
                            : "bg-zinc-950/50 border-zinc-900 text-zinc-400 " + tab.color
                        }`}
                      >
                        <span className="text-2xl mb-1">{tab.emoji}</span>
                        <span className="text-xs font-bold font-mono tracking-wide">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold font-mono border-b border-zinc-900 pb-2">
                      2. Personalize Information
                    </h3>

                    {/* Name Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-400 font-medium">Your Name</label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          {...register("yourName")}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        />
                        {errors.yourName && (
                          <span className="text-xs text-rose-500 font-medium">{errors.yourName.message}</span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-400 font-medium">
                          {activeCategory === "couples"
                            ? "Partner's Name"
                            : activeCategory === "friends"
                            ? "Friend's Name"
                            : "Ex Partner's Name"}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            activeCategory === "couples"
                              ? "Partner's Name"
                              : activeCategory === "friends"
                              ? "Friend's Name"
                              : "Ex Partner's Name"
                          }
                          {...register("partnerName")}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        />
                        {errors.partnerName && (
                          <span className="text-xs text-rose-500 font-medium">{errors.partnerName.message}</span>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-medium">
                        {activeCategory === "couples"
                          ? "Relationship Start Date (Optional)"
                          : activeCategory === "friends"
                          ? "Friendship Date (e.g. When you met)"
                          : "Relationship Period (Optional, e.g. 2018 - 2024)"}
                      </label>
                      {activeCategory === "breakup" ? (
                        <input
                          type="text"
                          placeholder="e.g. 2018 - 2024"
                          {...register("relationshipDate")}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        />
                      ) : (
                        <input
                          type="date"
                          {...register("relationshipDate")}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-zinc-300"
                        />
                      )}
                      {errors.relationshipDate && (
                        <span className="text-xs text-rose-500 font-medium">{errors.relationshipDate.message}</span>
                      )}
                    </div>

                    {/* Love/Friendship/Final message */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-medium">
                        {activeCategory === "couples"
                          ? "Love Message"
                          : activeCategory === "friends"
                          ? "Friendship Message"
                          : "Final Message"}
                      </label>
                      <textarea
                        rows={4}
                        placeholder={
                          activeCategory === "couples"
                            ? "Share a beautiful note about your feelings..."
                            : activeCategory === "friends"
                            ? "Write a hilarious joke, memory, or sweet message..."
                            : "Write down your final thoughts, lessons learned, or peaceful closing note..."
                        }
                        {...register("message")}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none leading-relaxed"
                      />
                      {errors.message && (
                        <span className="text-xs text-rose-500 font-medium">{errors.message.message}</span>
                      )}
                    </div>


                  </div>

                  <button
                    type="submit"
                    disabled={!canProceedToTemplates}
                    className="w-full py-4 rounded-xl text-base font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 shadow-lg shadow-rose-500/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-800 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    Select Theme &amp; Style <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-7 bg-zinc-950 p-6 md:p-8 flex flex-col justify-center items-center relative overflow-hidden max-h-[calc(100vh-64px)]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

                <div className="w-full max-w-2xl h-full flex flex-col relative z-10">
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-500" /> Live Website Preview
                    </span>
                    <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 font-semibold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider animate-pulse">
                      Realtime Rendering
                    </span>
                  </div>

                  {/* Simulated Device Browser Frame */}
                  <div className="flex-1 rounded-2xl border border-zinc-800 bg-[#09090b] shadow-2xl flex flex-col overflow-hidden relative">
                    {/* Browser Address Bar */}
                    <div className="bg-zinc-900/60 border-b border-zinc-900 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1.5 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                      </div>
                      <div className="flex-1 bg-zinc-950/60 rounded-lg px-3 py-1 text-xs text-zinc-500 font-mono text-center flex items-center justify-center gap-1">
                        heartpage.com/s/preview
                      </div>
                    </div>

                    {/* Simulated Content */}
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)] relative">
                      <TemplateDispatcher
                        category={formValues.category}
                        theme={formValues.theme}
                        yourName={formValues.yourName}
                        partnerName={formValues.partnerName}
                        relationshipDate={formValues.relationshipDate}
                        message={formValues.message}
                        images={[]}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TEMPLATE / THEME SELECTION */}
          {step === "template" && (
            <motion.div
              key="template-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                  Select Visual Theme
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto text-base">
                  Every category has a carefully compiled color palette and layout for both Light and Dark aesthetics. Select the mood that fits best.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
                {/* Light Theme Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setValue("theme", "light")}
                  className={`border-3 rounded-3xl p-6 cursor-pointer flex flex-col justify-between h-[300px] transition-all relative overflow-hidden ${
                    formValues.theme === "light"
                      ? "border-rose-500 bg-zinc-900 shadow-lg"
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                  }`}
                >
                  {/* Decorative background visual matching category */}
                  <div className={`absolute inset-0 pointer-events-none opacity-10 ${
                    activeCategory === "couples" ? "bg-mesh-couples-light" : activeCategory === "friends" ? "bg-mesh-friends-light" : "bg-mesh-breakup-light"
                  }`} />

                  <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold">Theme Style</span>
                    {formValues.theme === "light" && (
                      <span className="bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase">Light Theme</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {activeCategory === "couples"
                        ? "Blush pink backgrounds, rose gold filters, and highly delicate romantic shadows."
                        : activeCategory === "friends"
                        ? "Bright neon yellow, turquoise, and violet sticker popups with deep drop shadows."
                        : "Clean slate-white grid backing, dark charcoal text, and quiet silver overlays."}
                    </p>
                  </div>

                  <div className="relative z-10 flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-white border border-zinc-700" />
                    <span className="w-4 h-4 rounded-full bg-pink-100" />
                    <span className="w-4 h-4 rounded-full bg-teal-100" />
                  </div>
                </motion.div>

                {/* Dark Theme Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setValue("theme", "dark")}
                  className={`border-3 rounded-3xl p-6 cursor-pointer flex flex-col justify-between h-[300px] transition-all relative overflow-hidden ${
                    formValues.theme === "dark"
                      ? "border-rose-500 bg-zinc-900 shadow-lg"
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                  }`}
                >
                  {/* Decorative background visual matching category */}
                  <div className={`absolute inset-0 pointer-events-none opacity-10 ${
                    activeCategory === "couples" ? "bg-mesh-couples-dark" : activeCategory === "friends" ? "bg-mesh-friends-dark" : "bg-mesh-breakup-dark"
                  }`} />

                  <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold">Theme Style</span>
                    {formValues.theme === "dark" && (
                      <span className="bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase">Dark Theme</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {activeCategory === "couples"
                        ? "Deep plum and black mesh gradients, glowing text shadows, and golden rose icons."
                        : activeCategory === "friends"
                        ? "Dark stone backdrop offset with vibrant purple, mustard yellow, and cyan stickers."
                        : "Cinematic midnight indigo mesh, slate grays, and blurred photographic filters."}
                    </p>
                  </div>

                  <div className="relative z-10 flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-black border border-zinc-700" />
                    <span className="w-4 h-4 rounded-full bg-rose-950" />
                    <span className="w-4 h-4 rounded-full bg-purple-950" />
                  </div>
                </motion.div>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-4 w-full max-w-md justify-center">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 py-4 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setStep("preview")}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-rose-500/10 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Verify Full Preview <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FULL SCREEN PREVIEW & PUBLISH */}
          {step === "preview" && (
            <motion.div
              key="preview-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-[calc(100vh-64px)] relative"
            >
              {/* Floating controls banner */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-950/80 border border-zinc-800 px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl backdrop-blur-md max-w-xl w-[90%] sm:w-auto">
                <span className="text-xs uppercase font-mono tracking-widest text-zinc-400 font-bold shrink-0 hidden md:inline">
                  Full Page Verification
                </span>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStep("template")}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    Edit Theme
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(onFormSubmit)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/15 flex items-center justify-center gap-1.5 disabled:bg-rose-700 cursor-pointer w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        Publish HeartPage <Sparkles className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RENDER THE ACTUAL TEMPLATE FULL SCREEN */}
              <div className="flex-1 relative">
                <TemplateDispatcher
                  category={formValues.category}
                  theme={formValues.theme}
                  yourName={formValues.yourName}
                  partnerName={formValues.partnerName}
                  relationshipDate={formValues.relationshipDate}
                  message={formValues.message}
                  images={[]}
                  isPreview={false}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
