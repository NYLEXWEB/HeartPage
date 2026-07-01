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
  AlertCircle,
  Plus
} from "lucide-react";
import { websiteFormSchema, WebsiteInput } from "@/lib/validation";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "template" | "preview">("details");
  const [activeCategory, setActiveCategory] = useState<"couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding">("couples");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "creating_order" | "processing" | "verifying" | "publishing"
  >("idle");
  const [uploading, setUploading] = useState(false);

  // Load Razorpay Checkout SDK dynamically on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      theme: "light",
      yourName: "",
      partnerName: "",
      relationshipDate: "",
      message: "",
      images: [],
    },
  });

  // Watch fields for live preview
  const formValues = watch();

  // Handle category change - Reset form with appropriate defaults
  const handleCategoryChange = (cat: "couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding") => {
    setActiveCategory(cat);
    setSubmitError(null);
    
    // Clear and reset form values based on category defaults
    reset({
      category: cat,
      theme: formValues.theme || "light",
      yourName: "",
      partnerName: "",
      relationshipDate: cat === "breakup" ? "2021 - 2025" : "",
      message: "",
      images: [],
    });
  };

  // Prefill reply fields from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isReply = params.get("isReply") === "true";
      if (isReply) {
        const cat = (params.get("category") || "couples") as "couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding";
        const yName = params.get("yourName") || "";
        const pName = params.get("partnerName") || "";
        const rDate = params.get("relationshipDate") || "";
        
        setActiveCategory(cat);
        setValue("category", cat, { shouldValidate: true });
        setValue("yourName", yName, { shouldValidate: true });
        setValue("partnerName", pName, { shouldValidate: true });
        if (rDate) {
          setValue("relationshipDate", rDate, { shouldValidate: true });
        }
        setValue("message", `Replying to ${pName}: `, { shouldValidate: true });
      }
    }
  }, [setValue]);

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

    // If we are at the preview step, initiate the secure payment flow
    if (step === "preview") {
      setIsSubmitting(true);
      setSubmitError(null);
      setPaymentStatus("creating_order");
      
      try {
        // 1. Create Pending Payment Order internally
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData: data,
            images: data.images || [],
          }),
        });

        const orderData = await orderRes.json();
        if (!orderData.success) {
          throw new Error(orderData.error || "Failed to create secure payment order.");
        }

        // 2. Open Razorpay Checkout
        setPaymentStatus("processing");
        if (!window.Razorpay) {
          throw new Error("Razorpay payment gateway failed to load. Please verify your connection.");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "HeartPage",
          description: "Publish HeartPage Webspace",
          image: "/favicon.ico",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // 3. Verify Payment Signature
              setPaymentStatus("verifying");
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyData.success) {
                throw new Error(verifyData.error || "Verification failed.");
              }

              // 4. Publish website
              setPaymentStatus("publishing");
              
              // Success! Redirect to Success Page with payment details
              setTimeout(() => {
                router.push(`/success/${verifyData.slug}?paymentId=${verifyData.paymentId}`);
              }, 1200);
            } catch (err: any) {
              setSubmitError(err.message || "Payment verification failed. Please contact support.");
              setPaymentStatus("idle");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: data.yourName,
          },
          theme: {
            color: "#0ea5e9", // Theme matching Sky Blue design
          },
          modal: {
            ondismiss: function () {
              setSubmitError("Payment checkout cancelled.");
              setPaymentStatus("idle");
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on("payment.failed", function (resp: any) {
          setSubmitError(resp.error.description || "Transaction failed. Please try again.");
          setPaymentStatus("idle");
          setIsSubmitting(false);
        });
        
        rzp.open();
      } catch (err: any) {
        setSubmitError(err.message || "An unexpected error occurred during checkout setup.");
        setPaymentStatus("idle");
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
    <div className="bg-[#FAFDFE] text-slate-800 min-h-screen flex flex-col">
      {/* Top wizard bar */}
      <header className="border-b border-sky-100 bg-[#FAFDFE]/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step === "details") router.push("/");
                if (step === "template") setStep("details");
                if (step === "preview") setStep("template");
              }}
              className="p-2 hover:bg-sky-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-4 w-px bg-sky-100 hidden sm:block" />
            <span className="text-slate-400 text-xs md:text-sm font-mono hidden sm:inline">
              Step {step === "details" ? "1" : step === "template" ? "2" : "3"} of 3: {
                step === "details" ? "Enter Details" : step === "template" ? "Select Theme" : "Verify Preview"
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">HeartPage Builder</span>
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Premium Notification Banner */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[150] w-[90%] max-w-md bg-rose-950/95 border border-rose-900/50 text-rose-250 p-4 rounded-2xl shadow-2xl flex items-start gap-3 text-xs font-mono backdrop-blur-md"
          >
            <AlertCircle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-[10px] text-rose-400">Notice</span>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-rose-500 hover:text-rose-300 transition-colors uppercase text-[9px] font-bold tracking-widest cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="mt-1 leading-relaxed text-rose-200">{submitError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="lg:col-span-5 border-r border-sky-100 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)] bg-[#FCFAF7]">
                
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono">
                    1. Select Experience Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "couples", label: "Couples", emoji: "❤️", color: "hover:border-sky-350 text-sky-600" },
                      { id: "friends", label: "Besties", emoji: "🤝", color: "hover:border-sky-350 text-sky-600" },
                      { id: "breakup", label: "Breakup", emoji: "💔", color: "hover:border-sky-350 text-sky-600" },
                      { id: "crush", label: "Crush", emoji: "💌", color: "hover:border-sky-350 text-sky-600" },
                      { id: "birthday", label: "Birthday", emoji: "🎂", color: "hover:border-sky-350 text-sky-600" },
                      { id: "wedding", label: "Wedding", emoji: "💍", color: "hover:border-sky-350 text-sky-600" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleCategoryChange(tab.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                          activeCategory === tab.id
                            ? "bg-white border-sky-500 shadow-sm text-sky-600 scale-[1.02]"
                            : "bg-white/60 border-sky-100 text-slate-400 " + tab.color
                        }`}
                      >
                        <span className="text-xl mb-0.5">{tab.emoji}</span>
                        <span className="text-[10px] font-bold font-mono tracking-wide">{tab.label}</span>
                      </button>
                    ))}
                    <a
                      href="https://wa.me/918921442748?text=Hi!%20I%20would%20like%20to%20request%20a%20custom%20website%20design%20on%20HeartPage."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/20 text-sky-600 hover:bg-sky-50 hover:border-sky-400 transition-all duration-200 cursor-pointer scale-100"
                    >
                      <span className="text-xl mb-0.5">➕</span>
                      <span className="text-[10px] font-bold font-mono tracking-wide">Custom</span>
                    </a>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono border-b border-sky-100 pb-2">
                      2. Personalize Information
                    </h3>

                    {/* Name Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500 font-semibold font-mono">
                          {activeCategory === "wedding" ? "Groom / Bride Name" : "Your Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          {...register("yourName")}
                          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 placeholder-slate-400 ${
                            errors.yourName
                              ? "border-rose-300 focus:border-rose-500 bg-rose-50/5 shadow-sm shadow-rose-50"
                              : "border-sky-150 focus:border-sky-500"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.yourName && (
                            <motion.span
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="text-[11px] text-rose-600 font-bold font-mono flex items-center gap-1 mt-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              {errors.yourName.message}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500 font-semibold font-mono">
                          {activeCategory === "couples"
                            ? "Partner's Name"
                            : activeCategory === "friends"
                            ? "Bestie's Name"
                            : activeCategory === "breakup"
                            ? "Ex Partner's Name"
                            : activeCategory === "crush"
                            ? "Crush's Name"
                            : activeCategory === "wedding"
                            ? "Partner's Name"
                            : "Celebrant's Name"}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            activeCategory === "couples"
                              ? "Partner's Name"
                              : activeCategory === "friends"
                              ? "Bestie's Name"
                              : activeCategory === "breakup"
                              ? "Ex Partner's Name"
                              : activeCategory === "crush"
                              ? "Crush's Name"
                              : activeCategory === "wedding"
                              ? "Partner's Name"
                              : "Celebrant's Name"
                          }
                          {...register("partnerName")}
                          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 placeholder-slate-400 ${
                            errors.partnerName
                              ? "border-rose-300 focus:border-rose-500 bg-rose-50/5 shadow-sm shadow-rose-50"
                              : "border-sky-150 focus:border-sky-500"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.partnerName && (
                            <motion.span
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="text-[11px] text-rose-600 font-bold font-mono flex items-center gap-1 mt-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              {errors.partnerName.message}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
 
                    {/* Dates */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-semibold font-mono">
                        {activeCategory === "couples" && (
                          <>
                            Relationship Start Date <span className="text-rose-500 font-bold">(Optional)</span>
                          </>
                        )}
                        {activeCategory === "friends" && (
                          <>
                            Friendship Date <span className="text-slate-450 font-normal text-[10px]"><span className="text-rose-500 font-bold">(Optional)</span> (e.g. When you met)</span>
                          </>
                        )}
                        {activeCategory === "breakup" && (
                          <>
                            Relationship Period <span className="text-rose-500 font-bold">(Optional)</span> <span className="text-slate-400 font-normal text-[10px]">(e.g. 2018 - 2024)</span>
                          </>
                        )}
                        {activeCategory === "crush" && (
                          <>
                            Proposal Target Date <span className="text-rose-500 font-bold">(Optional)</span>
                          </>
                        )}
                        {activeCategory === "birthday" && (
                          <>
                            Birth Date <span className="text-rose-500 font-bold">(Required)</span> <span className="text-slate-450 font-normal text-[10px]">(to run the birthday countdown)</span>
                          </>
                        )}
                        {activeCategory === "wedding" && (
                          <>
                            Wedding Date <span className="text-rose-500 font-bold">(Required)</span> <span className="text-slate-450 font-normal text-[10px]">(to run the wedding countdown)</span>
                          </>
                        )}
                      </label>
                      {activeCategory === "breakup" ? (
                        <input
                          type="text"
                          placeholder="e.g. 2018 - 2024"
                          {...register("relationshipDate")}
                          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 placeholder-slate-400 ${
                            errors.relationshipDate
                              ? "border-rose-300 focus:border-rose-500 bg-rose-50/5 shadow-sm shadow-rose-50"
                              : "border-sky-150 focus:border-sky-500"
                          }`}
                        />
                      ) : (
                        <input
                          type="date"
                          {...register("relationshipDate")}
                          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-700 ${
                            errors.relationshipDate
                              ? "border-rose-300 focus:border-rose-500 bg-rose-50/5 shadow-sm shadow-rose-50"
                              : "border-sky-150 focus:border-sky-500"
                          }`}
                        />
                      )}
                      <AnimatePresence>
                        {errors.relationshipDate && (
                          <motion.span
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="text-[11px] text-rose-600 font-bold font-mono flex items-center gap-1 mt-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            {errors.relationshipDate.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Love/Friendship/Final message */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-semibold font-mono">
                        {activeCategory === "couples"
                          ? "Love Message"
                          : activeCategory === "friends"
                          ? "Friendship Message"
                          : activeCategory === "wedding"
                          ? "Wedding Invitation Message"
                          : "Final Message"}
                      </label>
                      <textarea
                        rows={4}
                        placeholder={
                          activeCategory === "couples"
                            ? "Share a beautiful note about your feelings..."
                            : activeCategory === "friends"
                            ? "Write a hilarious joke, memory, or sweet message..."
                            : activeCategory === "wedding"
                            ? "Write down the wedding details, venue location, or a sweet invitation note..."
                            : "Write down your final thoughts, lessons learned, or peaceful closing note..."
                        }
                        {...register("message")}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none leading-relaxed text-slate-800 placeholder-slate-400 ${
                          errors.message
                            ? "border-rose-300 focus:border-rose-500 bg-rose-50/5 shadow-sm shadow-rose-50"
                            : "border-sky-150 focus:border-sky-500"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.message && (
                          <motion.span
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="text-[11px] text-rose-600 font-bold font-mono flex items-center gap-1 mt-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            {errors.message.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Gallery Image Upload (Optional) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 font-semibold font-mono">
                          3. Add Photos to Your Gallery <span className="text-slate-400 font-normal">(Optional - Max 2)</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-100/50">
                          {(watch("images") || []).length}/2 Photos
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 -mt-1 leading-relaxed">
                        Add your favorite photos together to showcase them in a special dynamic photo gallery on your website!
                      </p>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {(watch("images") || []).map((img: string, idx: number) => (
                          <div key={idx} className="relative aspect-square rounded-xl border border-sky-100 overflow-hidden bg-slate-50 group">
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const currentImages = watch("images") || [];
                                setValue("images", currentImages.filter((_, i) => i !== idx), { shouldValidate: true });
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {(watch("images") || []).length < 2 && (
                          <label className="relative aspect-square rounded-xl border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/10 hover:bg-sky-50/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files) return;

                                setUploading(true);
                                const currentImages = watch("images") || [];
                                const newBase64s: string[] = [];

                                for (let i = 0; i < files.length; i++) {
                                  if (currentImages.length + newBase64s.length >= 2) {
                                    alert("You can upload a maximum of 2 gallery photos.");
                                    break;
                                  }
                                  try {
                                    const compressed = await compressImage(files[i]);
                                    newBase64s.push(compressed);
                                  } catch (err) {
                                    console.error("Compression failed:", err);
                                  }
                                }

                                setValue("images", [...currentImages, ...newBase64s], { shouldValidate: true });
                                setUploading(false);
                              }}
                              className="hidden"
                              disabled={uploading}
                            />
                            {uploading ? (
                              <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-5 h-5 text-sky-400 group-hover:text-sky-600 transition-colors" />
                                <span className="text-[9px] font-bold text-sky-500 mt-1 uppercase font-mono tracking-wider">Upload</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white transition-all duration-200 shadow-md shadow-sky-500/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Select Theme &amp; Style <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>

              {/* Live Preview Column */}
              <div className="hidden lg:flex lg:col-span-7 bg-white p-6 md:p-8 flex-col justify-center items-center relative overflow-hidden max-h-[calc(100vh-64px)]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0f2fe_1px,transparent_1px),linear-gradient(to_bottom,#e0f2fe_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

                <div className="w-full max-w-2xl h-full flex flex-col relative z-10">
                  <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-500" /> Live Website Preview
                    </span>
                    <span className="text-[10px] bg-sky-50 border border-sky-100 text-sky-600 font-semibold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider animate-pulse">
                      Realtime Rendering
                    </span>
                  </div>

                  {/* Simulated Device Browser Frame */}
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden relative">
                    {/* Browser Address Bar */}
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1.5 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                      </div>
                      <div className="flex-1 bg-white border border-slate-100 rounded-lg px-3 py-1 text-xs text-slate-400 font-mono text-center flex items-center justify-center gap-1">
                        heartpage.com/s/preview
                      </div>
                    </div>

                    {/* Simulated Content */}
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)] relative simulated-scrollable-container">
                      <TemplateDispatcher
                        category={formValues.category}
                        theme={formValues.theme}
                        yourName={formValues.yourName}
                        partnerName={formValues.partnerName}
                        relationshipDate={formValues.relationshipDate}
                        message={formValues.message}
                        images={formValues.images || []}
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
              className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto space-y-12 bg-[#FAFDFE]"
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-5xl font-luxury font-extrabold tracking-tight text-slate-900">
                  Select Visual Theme
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto text-base">
                  Every category has a carefully compiled color palette and layout for both Light and Dark aesthetics. Select the mood that fits best.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
                {/* Light Theme Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setValue("theme", "light")}
                  className={`border-2 rounded-3xl p-6 cursor-pointer flex flex-col justify-between h-[300px] transition-all relative overflow-hidden bg-white shadow-sm ${
                    formValues.theme === "light"
                      ? "border-sky-500"
                      : "border-sky-100 hover:border-sky-300"
                  }`}
                >
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Theme Style</span>
                    {formValues.theme === "light" && (
                      <span className="bg-sky-500 text-white rounded-full p-1.5 shadow-md">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="text-3xl font-luxury font-extrabold text-slate-900">Light Theme</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {activeCategory === "couples"
                        ? "Blush pink backgrounds, rose gold filters, and highly delicate romantic shadows."
                        : activeCategory === "friends"
                        ? "Bright neon yellow, turquoise, and violet sticker popups with deep drop shadows."
                        : activeCategory === "wedding"
                        ? "Elegant champagne, gold flourishes, soft cream panels, and classic luxury script."
                        : "Clean slate-white grid backing, dark charcoal text, and quiet silver overlays."}
                    </p>
                  </div>

                  <div className="relative z-10 flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-50 border border-slate-200" />
                    <span className="w-4 h-4 rounded-full bg-pink-100" />
                    <span className="w-4 h-4 rounded-full bg-sky-100" />
                  </div>
                </motion.div>

                {/* Dark Theme Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setValue("theme", "dark")}
                  className={`border-2 rounded-3xl p-6 cursor-pointer flex flex-col justify-between h-[300px] transition-all relative overflow-hidden bg-white shadow-sm ${
                    formValues.theme === "dark"
                      ? "border-sky-500"
                      : "border-sky-100 hover:border-sky-300"
                  }`}
                >
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Theme Style</span>
                    {formValues.theme === "dark" && (
                      <span className="bg-sky-500 text-white rounded-full p-1.5 shadow-md">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="text-3xl font-luxury font-extrabold text-slate-900">Dark Theme</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {activeCategory === "couples"
                        ? "Deep plum and black mesh gradients, glowing text shadows, and golden rose icons."
                        : activeCategory === "friends"
                        ? "Dark stone backdrop offset with vibrant purple, mustard yellow, and cyan stickers."
                        : activeCategory === "wedding"
                        ? "Deep warm amber, shimmering gold stars, rich mahogany overlays, and glowing rings."
                        : "Cinematic midnight indigo mesh, slate grays, and blurred photographic filters."}
                    </p>
                  </div>

                  <div className="relative z-10 flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-950" />
                    <span className="w-4 h-4 rounded-full bg-rose-950" />
                    <span className="w-4 h-4 rounded-full bg-sky-950" />
                  </div>
                </motion.div>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-4 w-full max-w-md justify-center">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 py-4 border border-sky-150 hover:bg-sky-50 text-slate-500 hover:text-slate-900 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setStep("preview")}
                  className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-sky-500/10 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
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
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 border border-sky-150 px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl backdrop-blur-md max-w-xl w-[90%] sm:w-auto">
                <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold shrink-0 hidden md:inline">
                  Full Page Verification
                </span>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStep("template")}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-sky-150 hover:bg-sky-50 text-slate-500 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    Edit Theme
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(onFormSubmit)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer w-full sm:w-auto"
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
                  images={formValues.images || []}
                  isPreview={false}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* SECURE PAYMENT PROCESSOR MODAL */}
      <AnimatePresence>
        {isSubmitting && paymentStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-sky-100 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

              {/* Loader animation */}
              <div className="relative flex justify-center items-center h-20">
                <div className="absolute w-16 h-16 rounded-full border-4 border-sky-100/50 animate-pulse" />
                <div className="absolute w-16 h-16 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
                <Heart className="w-6 h-6 text-sky-500 fill-sky-500 animate-ping absolute" />
              </div>

              <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {paymentStatus === "creating_order"
                    ? "Creating Secure Payment..."
                    : paymentStatus === "processing"
                    ? "Secure Payment Window Open..."
                    : paymentStatus === "verifying"
                    ? "Verifying Payment..."
                    : paymentStatus === "publishing"
                    ? "Publishing Website..."
                    : "Processing Payment..."}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Please do not refresh the page, close this tab, or click the back button. Your transaction is being secured.
                </p>
              </div>

              {/* Secure lock footer */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider bg-slate-50 py-2 rounded-xl border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SSL Secure 256-Bit Verification
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
