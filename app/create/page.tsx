"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
  Plus,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sun,
  Moon,
  Smile,
  Sunset
} from "lucide-react";
import { websiteFormSchema, WebsiteInput } from "@/lib/validation";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";
import { getSettings } from "@/actions/settings";

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

const PREVIEW_MUSIC_MAP = {
  couples: "/Website Music/Couple.mp3",
  friends: "/Website Music/Besties.mp3",
  breakup: "/Website Music/Breakup.mp3",
  crush: "/Website Music/Crush.mp3",
  wedding: "/Website Music/Wedding and Birthday .mp3",
  birthday: "/Website Music/Wedding and Birthday .mp3",
};

export default function CreatePage() {
  const router = useRouter();
  const [isMaintenance, setIsMaintenance] = useState<boolean | null>(null);
  const [step, setStep] = useState<"details" | "template" | "preview">("details");
  const [activeCategory, setActiveCategory] = useState<"couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding">("couples");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "creating_order" | "processing" | "verifying" | "publishing"
  >("idle");
  const [uploading, setUploading] = useState(false);

  const [isFormMusicPlaying, setIsFormMusicPlaying] = useState(false);
  const formAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [availableMusic, setAvailableMusic] = useState<{ filename: string; displayName: string }[]>([]);

  // Load dynamic music tracks from public directory
  useEffect(() => {
    async function loadMusic() {
      try {
        const res = await fetch("/api/music");
        const data = await res.json();
        if (data.success && data.files) {
          setAvailableMusic(data.files);
        }
      } catch (err) {
        console.error("Failed to load music files:", err);
      }
    }
    loadMusic();
  }, []);

  // Check Maintenance Mode from system settings
  useEffect(() => {
    async function checkMaintenanceStatus() {
      try {
        const { success, settings } = await getSettings();
        if (success && settings && settings.maintenanceMode) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
      } catch (err) {
        console.error("Error loading maintenance status:", err);
        setIsMaintenance(false);
      }
    }
    checkMaintenanceStatus();
  }, []);

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
    control,
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
      customFields: [],
      musicEnabled: true,
      selectedMusic: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields",
  });

  // Watch fields for live preview
  const formValues = watch();

  // Music preview audio manager for details step
  useEffect(() => {
    // If music is disabled, pause preview immediately
    if (!formValues.musicEnabled) {
      if (formAudioRef.current) {
        formAudioRef.current.pause();
        setIsFormMusicPlaying(false);
      }
    }
  }, [formValues.musicEnabled]);

  // Pause preview when activeCategory or selectedMusic changes, so we don't play the wrong song
  const watchedSelectedMusic = watch("selectedMusic");
  useEffect(() => {
    if (formAudioRef.current) {
      formAudioRef.current.pause();
      formAudioRef.current = null;
      setIsFormMusicPlaying(false);
    }
    setPreviewProgress(0);
    setPreviewDuration(0);
  }, [activeCategory, watchedSelectedMusic]);

  // Pause preview when step changes
  useEffect(() => {
    if (formAudioRef.current) {
      formAudioRef.current.pause();
      setIsFormMusicPlaying(false);
    }
  }, [step]);

  // Clean up preview audio on unmount
  useEffect(() => {
    return () => {
      if (formAudioRef.current) {
        formAudioRef.current.pause();
        formAudioRef.current = null;
      }
    };
  }, []);

  // Scroll to top on step changes so the header/floating actions are visible
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Keep track of original inline styles to restore them later
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
    const originalBodyScrollBehavior = document.body.style.scrollBehavior;

    const lockScroll = () => {
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
    };

    const unlockScroll = () => {
      document.documentElement.style.scrollBehavior = originalHtmlScrollBehavior;
      document.body.style.scrollBehavior = originalBodyScrollBehavior;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
    };

    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: "instant" as any });
      } catch (e) {
        window.scrollTo(0, 0);
      }
      
      try {
        document.documentElement.scrollTo({ top: 0, behavior: "instant" as any });
      } catch (e) {
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
      }
      
      try {
        document.body.scrollTo({ top: 0, behavior: "instant" as any });
      } catch (e) {
        if (document.body) {
          document.body.scrollTop = 0;
        }
      }
    };

    // Lock scrollability and snap to top immediately
    lockScroll();
    scrollToTop();

    // Enforce lock and top scroll positioning during the transition window (700ms)
    let handle: number;
    const startTime = Date.now();
    const run = () => {
      scrollToTop();
      if (Date.now() - startTime < 700) {
        handle = requestAnimationFrame(run);
      } else {
        unlockScroll();
        scrollToTop();
      }
    };

    run();

    return () => {
      cancelAnimationFrame(handle);
      unlockScroll();
    };
  }, [step]);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleFormMusicPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customMusic = watch("selectedMusic");
    const trackSrc = customMusic ? `/Website Music/${encodeURIComponent(customMusic)}` : PREVIEW_MUSIC_MAP[activeCategory];
    
    if (!formAudioRef.current || formAudioRef.current.src !== window.location.origin + trackSrc) {
      if (formAudioRef.current) {
        formAudioRef.current.pause();
      }
      const audio = new Audio(trackSrc);
      audio.loop = true;
      formAudioRef.current = audio;
      
      // Listeners to keep state synced in case audio stops/pauses
      audio.onplay = () => setIsFormMusicPlaying(true);
      audio.onpause = () => setIsFormMusicPlaying(false);
      audio.ontimeupdate = () => setPreviewProgress(audio.currentTime);
      audio.onloadedmetadata = () => setPreviewDuration(audio.duration);
      
      if (audio.duration) {
        setPreviewDuration(audio.duration);
      }
    }

    if (isFormMusicPlaying) {
      formAudioRef.current.pause();
    } else {
      formAudioRef.current.play()
        .then(() => {
          setIsFormMusicPlaying(true);
        })
        .catch(err => {
          console.error("Form preview play failed:", err);
        });
    }
  };

  const stableImages = useMemo(() => formValues.images || [], [formValues.images]);
  const stableCustomFields = useMemo(() => formValues.customFields || [], [formValues.customFields]);

  const getCustomFieldPlaceholders = (category: string) => {
    switch (category) {
      case "wedding":
        return {
          label: "e.g. Venue Location or RSVP",
          value: "e.g. Google Maps Link or Phone number",
        };
      case "couples":
        return {
          label: "e.g. Our Song or First Date Spot",
          value: "e.g. Perfect by Ed Sheeran or Paris Cafe",
        };
      case "friends":
        return {
          label: "e.g. Favorite Memory or Nickname",
          value: "e.g. That summer beach trip or Captain Chaos",
        };
      case "breakup":
        return {
          label: "e.g. Final Agreement or Shared Item",
          value: "e.g. Returning keys or Staying friends",
        };
      case "crush":
        return {
          label: "e.g. Confession Question or Gift Spot",
          value: "e.g. Will you meet me? or Under the oak tree",
        };
      case "birthday":
        return {
          label: "e.g. Party Location or Gift Wishlist",
          value: "e.g. Royal Club House or Link to wishlist",
        };
      default:
        return {
          label: "e.g. Details Label",
          value: "e.g. Link or custom text details",
        };
    }
  };

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
      customFields: [],
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
    // Reset custom music when switching category to avoid playing unrelated song
    setValue("selectedMusic", "");
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

        // If payment is disabled by admin, bypass Razorpay and redirect directly to success screen
        if (orderData.paymentEnabled === false) {
          setPaymentStatus("publishing");
          setTimeout(() => {
            router.push(`/success/${orderData.slug}?paymentId=${orderData.paymentId}`);
          }, 1500);
          return;
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

  if (isMaintenance === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFDFE]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="bg-[#121110] text-[#FAF9F6] min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
        {/* Glowing background auroras */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-900/10 blur-[150px] pointer-events-none z-0"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-lg w-full bg-zinc-950/60 backdrop-blur-xl border border-zinc-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center"
        >
          {/* Animated Heart Icon with glowing concentric rings */}
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
            >
              <Heart className="w-9 h-9 fill-rose-500/20" />
            </motion.div>
            <div className="absolute -inset-2 rounded-full border border-rose-500/5 animate-ping pointer-events-none"></div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl text-white font-semibold tracking-tight mb-2">
            Love is on Hold
          </h1>
          <p className="italic text-lg text-rose-300/80 mb-6">
            Under Scheduled Maintenance
          </p>

          {/* Details */}
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-8">
            HeartPage is currently undergoing scheduled platform upgrades to make your shared journeys even more magical. We will be back online shortly. Thank you for your patience!
          </p>

          {/* Contact or Social Action Button */}
          <div className="w-full space-y-4">
            <a 
              href="/"
              className="block w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-[0.2em] uppercase rounded-full shadow-md transition-all duration-300 text-center"
            >
              Go Back Home
            </a>
            
            <p className="text-[10px] text-zinc-650 font-mono tracking-widest uppercase">
              Need assistance? Email: support@heartpage.com
            </p>
          </div>
        </motion.div>
        
        {/* Subtle footer */}
        <div className="absolute bottom-6 text-[10px] text-zinc-550 font-mono uppercase tracking-widest">
          HeartPage Platform Status
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFDFE] text-slate-800 min-h-screen flex flex-col">
      {/* Top wizard bar */}
      <header className="border-b border-sky-100 bg-[#FAFDFE]/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                try {
                  window.scrollTo({ top: 0, behavior: "instant" as any });
                } catch (e) {
                  window.scrollTo(0, 0);
                }
                if (document.documentElement) document.documentElement.scrollTop = 0;
                if (document.body) document.body.scrollTop = 0;

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
                          {activeCategory === "wedding" ? "Groom Name" : "Your Name"}
                        </label>
                        <input
                          type="text"
                          placeholder={activeCategory === "wedding" ? "Groom Name" : "Your Name"}
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
                            ? "Bride Name"
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
                              ? "Bride Name"
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

                    {/* Dynamic Custom Fields Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 font-semibold font-mono">
                          Add Additional Details <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => append({ label: "", value: "" })}
                          className="text-[10px] text-sky-600 hover:text-sky-700 font-bold uppercase tracking-wider bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200/50 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Detail
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 -mt-1 leading-relaxed">
                        Add details like event location links, dress code, RSVP contacts, or timing details!
                      </p>

                      {fields.length > 0 && (
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-sky-100/30">
                          {fields.map((item, idx) => (
                            <div key={item.id} className="flex gap-2 items-start">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                  <input
                                    type="text"
                                    placeholder={getCustomFieldPlaceholders(activeCategory).label}
                                    {...register(`customFields.${idx}.label` as const)}
                                    className="w-full bg-white border border-sky-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
                                  />
                                  {errors.customFields?.[idx]?.label && (
                                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Name is required</span>
                                  )}
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder={getCustomFieldPlaceholders(activeCategory).value}
                                    {...register(`customFields.${idx}.value` as const)}
                                    className="w-full bg-white border border-sky-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
                                  />
                                  {errors.customFields?.[idx]?.value && (
                                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Value is required</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Birthday Star Photo Upload (Only for Birthday) */}
                    {activeCategory === "birthday" && (
                      <div className="space-y-4 pt-2 border-t border-sky-100/50">
                        <label className="text-xs text-slate-500 font-semibold font-mono block">
                          3. Upload Birthday Person's Photo <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <p className="text-[11px] text-slate-400 -mt-1 leading-relaxed">
                          Upload a photo of the birthday person to feature them in a special highlight section of the website.
                        </p>

                        <div className="w-1/2">
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Photo</span>
                            {watch("partnerName") && (
                              <span className="text-[9px] text-slate-400 font-mono -mt-1 block">({watch("partnerName")})</span>
                            )}
                            
                            <div className="relative aspect-square rounded-2xl border border-sky-100 overflow-hidden bg-slate-50 flex items-center justify-center group">
                              {watch("groomPhoto") ? (
                                <>
                                  <img src={watch("groomPhoto")} alt="Birthday Star Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setValue("groomPhoto", "", { shouldValidate: true })}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-50/20 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImage(file);
                                        setValue("groomPhoto", compressed, { shouldValidate: true });
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Upload className="w-5 h-5 text-sky-400 mb-1" />
                                  <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">Select Photo</span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Groom & Bride Photo Upload (Only for Wedding) */}
                    {activeCategory === "wedding" && (
                      <div className="space-y-4 pt-2 border-t border-sky-100/50">
                        <label className="text-xs text-slate-500 font-semibold font-mono block">
                          3. Upload Bride & Groom Photos <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <p className="text-[11px] text-slate-400 -mt-1 leading-relaxed">
                          Upload high-quality portrait photos for the Bride and the Groom to display them beautifully on the wedding website.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Bride Photo */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Bride Photo</span>
                            {watch("yourName") && (
                              <span className="text-[9px] text-slate-400 font-mono -mt-1 block">({watch("yourName")})</span>
                            )}
                            
                            <div className="relative aspect-square rounded-2xl border border-sky-100 overflow-hidden bg-slate-50 flex items-center justify-center group">
                              {watch("bridePhoto") ? (
                                <>
                                  <img src={watch("bridePhoto")} alt="Bride Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setValue("bridePhoto", "", { shouldValidate: true })}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-50/20 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImage(file);
                                        setValue("bridePhoto", compressed, { shouldValidate: true });
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Upload className="w-5 h-5 text-sky-400 mb-1" />
                                  <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">Select Photo</span>
                                </label>
                              )}
                            </div>
                          </div>

                          {/* Groom Photo */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Groom Photo</span>
                            {watch("partnerName") && (
                              <span className="text-[9px] text-slate-400 font-mono -mt-1 block">({watch("partnerName")})</span>
                            )}
                            
                            <div className="relative aspect-square rounded-2xl border border-sky-100 overflow-hidden bg-slate-50 flex items-center justify-center group">
                              {watch("groomPhoto") ? (
                                <>
                                  <img src={watch("groomPhoto")} alt="Groom Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setValue("groomPhoto", "", { shouldValidate: true })}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-50/20 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImage(file);
                                        setValue("groomPhoto", compressed, { shouldValidate: true });
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Upload className="w-5 h-5 text-sky-400 mb-1" />
                                  <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">Select Photo</span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Gallery Image Upload (Optional) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 font-semibold font-mono">
                          {(activeCategory === "wedding" || activeCategory === "birthday") ? "4" : "3"}. Add Photos to Your Gallery <span className="text-slate-400 font-normal">(Optional - Max 2)</span>
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

                    {/* Background Music Option Toggle */}
                    <div className="space-y-3 pt-4 border-t border-sky-100/50">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 font-semibold font-mono">
                          {(activeCategory === "wedding" || activeCategory === "birthday") ? "5" : "4"}. Enable Background Music
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 -mt-1 leading-relaxed">
                        Play a matching romantic ambient sound track in the background when your page is opened.
                      </p>

                      <div 
                        onClick={() => setValue("musicEnabled", !watch("musicEnabled"))}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          watch("musicEnabled")
                            ? "bg-emerald-50/20 border-emerald-500/30 text-emerald-755"
                            : "bg-slate-50/50 border-slate-200 text-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            watch("musicEnabled") ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                          }`}>
                            <Music className={`w-4 h-4 ${watch("musicEnabled") ? "animate-bounce" : ""}`} />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold font-mono tracking-wide block">
                              {watch("musicEnabled") ? "Background Music Enabled" : "Background Music Disabled"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium block -mt-0.5">
                              {watch("musicEnabled") 
                                ? "Category specific ambient track will play" 
                                : "No music will play on this page"}
                            </span>
                          </div>
                        </div>

                        {/* Switch pill */}
                        <div className={`w-10 h-6 rounded-full transition-all relative flex items-center p-0.5 ${
                          watch("musicEnabled") ? "bg-emerald-500" : "bg-slate-200"
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${
                            watch("musicEnabled") ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </div>
                      </div>

                      {/* Form Music Preview Button */}
                      <AnimatePresence>
                        {watch("musicEnabled") && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="w-full mt-2 p-4 rounded-2xl bg-white border border-sky-150 shadow-sm flex flex-col gap-4">
                              {/* Music Selector Grid */}
                              <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">
                                  Select Soundtrack
                                </label>
                                <div className="max-h-56 overflow-y-auto border border-sky-100/70 rounded-2xl p-2 bg-slate-50/50 space-y-1.5 scrollbar-thin">
                                  {/* Default Category Track Option */}
                                  <div
                                    onClick={() => setValue("selectedMusic", "")}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                      !watch("selectedMusic")
                                        ? "bg-white border-sky-400 shadow-sm text-sky-700 font-bold"
                                        : "bg-transparent border-transparent hover:bg-slate-100 text-slate-655"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        !watch("selectedMusic") ? "bg-sky-50 text-sky-500" : "bg-slate-200/70 text-slate-400"
                                      }`}>
                                        <Music className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="text-left">
                                        <span className="text-xs block">
                                          Default Theme Track
                                        </span>
                                        <span className="text-[9px] text-slate-400 block font-normal -mt-0.5">
                                          Original soundtrack matching {activeCategory}
                                        </span>
                                      </div>
                                    </div>
                                    {!watch("selectedMusic") && (
                                      <span className="text-[9px] bg-sky-50 border border-sky-100 text-sky-600 px-1.5 py-0.5 rounded font-mono font-bold">
                                        Active
                                      </span>
                                    )}
                                  </div>

                                  {/* Dynamic Music Tracks */}
                                  {availableMusic.map((track) => {
                                    const isSelected = watch("selectedMusic") === track.filename;
                                    return (
                                      <div
                                        key={track.filename}
                                        onClick={() => setValue("selectedMusic", track.filename)}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                          isSelected
                                            ? "bg-white border-sky-400 shadow-sm text-sky-700 font-bold"
                                            : "bg-transparent border-transparent hover:bg-slate-100 text-slate-655"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                            isSelected ? "bg-sky-50 text-sky-500" : "bg-slate-200/70 text-slate-400"
                                          }`}>
                                            <Music className="w-3.5 h-3.5" />
                                          </div>
                                          <div className="text-left">
                                            <span className="text-xs block truncate max-w-[180px]">
                                              {track.displayName}
                                            </span>
                                            <span className="text-[9px] text-slate-400 block font-normal -mt-0.5 uppercase font-mono tracking-wider">
                                              Custom audio file
                                            </span>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <span className="text-[9px] bg-sky-50 border border-sky-100 text-sky-600 px-1.5 py-0.5 rounded font-mono font-bold">
                                            Active
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="w-full h-[1px] bg-sky-100/50" />

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-sky-50 text-sky-600 ${isFormMusicPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }}>
                                    <Music className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="text-left">
                                    <span className="text-[11px] font-bold font-mono tracking-wide text-slate-800 block">
                                      Soundtrack Preview
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium block">
                                      {isFormMusicPlaying ? "Playing ambient theme" : "Ready to preview"}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={toggleFormMusicPreview}
                                  className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                >
                                  {isFormMusicPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                                  )}
                                </button>
                              </div>

                              {/* Progress bar and time stamps */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min="0"
                                    max={previewDuration || 100}
                                    value={previewProgress}
                                    onChange={(e) => {
                                      const newTime = parseFloat(e.target.value);
                                      setPreviewProgress(newTime);
                                      if (formAudioRef.current) {
                                        formAudioRef.current.currentTime = newTime;
                                      }
                                    }}
                                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                                  <span>{formatTime(previewProgress)}</span>
                                  <span>{formatTime(previewDuration)}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  <div className="w-full h-[600px] xl:h-[680px] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden relative">
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
                    <div className="flex-1 overflow-y-auto relative simulated-scrollable-container">
                      <TemplateDispatcher
                        category={formValues.category}
                        theme={formValues.theme}
                        yourName={formValues.yourName}
                        partnerName={formValues.partnerName}
                        relationshipDate={formValues.relationshipDate}
                        message={formValues.message}
                        images={stableImages}
                        customFields={stableCustomFields}
                        groomPhoto={formValues.groomPhoto}
                        bridePhoto={formValues.bridePhoto}
                        isPreview={true}
                        musicEnabled={formValues.musicEnabled}
                        hideMusicPlayer={true}
                        selectedMusic={formValues.selectedMusic}
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
                {/* Day Vibe (Light Theme) Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setValue("theme", "light")}
                  className={`border-2 rounded-[2rem] cursor-pointer flex flex-col transition-all duration-300 relative overflow-hidden bg-white shadow-sm hover:shadow-md ${
                    formValues.theme === "light"
                      ? "border-sky-500 shadow-sky-500/10"
                      : "border-sky-100 hover:border-sky-200"
                  }`}
                >
                  {/* Top visual mockup container */}
                  <div className="h-48 w-full bg-gradient-to-b from-sky-50/50 via-rose-50/30 to-white flex justify-center items-end pt-4 overflow-hidden relative border-b border-slate-105">
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-sm">
                      <Sun className="w-3 h-3 text-amber-500" /> Day Vibe
                    </div>

                    {/* Miniature Phone Mockup */}
                    <div className={`w-[130px] h-[160px] bg-white rounded-t-2xl shadow-lg border flex flex-col relative overflow-hidden transition-all duration-300 ${
                      formValues.theme === "light" ? "border-sky-300 scale-105" : "border-slate-100"
                    }`}>
                      {/* status bar */}
                      <div className="h-3 px-2 flex justify-between items-center bg-slate-50/80 border-b border-slate-100/50">
                        <span className="text-[6px] font-bold text-slate-400">9:41</span>
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="w-1.5 h-0.5 bg-slate-300 rounded-sm" />
                        </div>
                      </div>
                      {/* mini header */}
                      <div className="h-4 px-2 bg-slate-50/20 border-b border-slate-100/30 flex items-center justify-center">
                        <div className="w-10 h-1.5 bg-slate-200/60 rounded-full" />
                      </div>
                      {/* mockup content */}
                      <div className="flex-1 p-2 flex flex-col justify-center items-center relative overflow-hidden bg-rose-50/30">
                        {activeCategory === "couples" ? (
                          <>
                            <span className="text-[8px] font-luxury font-bold text-pink-600 tracking-wide text-center truncate w-full px-1">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Alex"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Jordan"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-pink-105 flex items-center justify-center shadow-sm">
                              <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-300/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-200/60 rounded-full" />
                          </>
                        ) : activeCategory === "friends" ? (
                          <>
                            <span className="text-[8px] font-sans font-black text-sky-600 tracking-tight text-center uppercase truncate w-full px-1">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Sam"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Taylor"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-200 shadow-sm">
                              <Smile className="w-2.5 h-2.5 text-yellow-600" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-300/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-200/60 rounded-full" />
                          </>
                        ) : activeCategory === "breakup" ? (
                          <>
                            <span className="text-[8px] font-serif italic text-slate-800 text-center truncate w-full px-1">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Riley"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Casey"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                              <Sunset className="w-2.5 h-2.5 text-slate-500" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-300/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-200/60 rounded-full" />
                          </>
                        ) : (
                          <>
                            <span className="text-[8px] font-luxury text-slate-800 text-center truncate w-full px-1">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Wisher"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Recipient"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shadow-sm">
                              <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-300/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-200/60 rounded-full" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900">Light Theme</h3>
                        {formValues.theme === "light" && (
                          <span className="bg-sky-500 text-white rounded-full p-1 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-slate-550 text-xs leading-relaxed">
                        {activeCategory === "couples"
                          ? "Blush pink backgrounds, rose gold filters, and highly delicate romantic shadows."
                          : activeCategory === "friends"
                          ? "Bright neon yellow, turquoise, and violet sticker popups with deep drop shadows."
                          : activeCategory === "wedding"
                          ? "Elegant champagne, gold flourishes, soft cream panels, and classic luxury script."
                          : "Clean slate-white grid backing, dark charcoal text, and quiet silver overlays."}
                      </p>
                    </div>

                    {/* Color indicators */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Palette</span>
                      <div className="flex gap-1.5">
                        {activeCategory === "couples" ? (
                          <>
                            <span className="w-3 h-3 rounded-full bg-pink-100 border border-slate-200" title="Rose Gold" />
                            <span className="w-3 h-3 rounded-full bg-[#FAFDFE] border border-slate-200" title="Beige Cream" />
                            <span className="w-3 h-3 rounded-full bg-rose-50 border border-slate-200" title="Blush Pink" />
                          </>
                        ) : activeCategory === "friends" ? (
                          <>
                            <span className="w-3 h-3 rounded-full bg-yellow-300 border border-slate-200" title="Neon Yellow" />
                            <span className="w-3 h-3 rounded-full bg-sky-400 border border-slate-200" title="Sky Blue" />
                            <span className="w-3 h-3 rounded-full bg-indigo-500 border border-slate-200" title="Violet" />
                          </>
                        ) : activeCategory === "wedding" ? (
                          <>
                            <span className="w-3 h-3 rounded-full bg-[#FAF5E6] border border-slate-200" title="Champagne" />
                            <span className="w-3 h-3 rounded-full bg-amber-400 border border-slate-200" title="Luxury Gold" />
                            <span className="w-3 h-3 rounded-full bg-white border border-slate-200" title="Pure Ivory" />
                          </>
                        ) : (
                          <>
                            <span className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200" title="Slate White" />
                            <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-200" title="Silver Gray" />
                            <span className="w-3 h-3 rounded-full bg-white border border-slate-200" title="Pure White" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Night Vibe (Dark Theme) Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setValue("theme", "dark")}
                  className={`border-2 rounded-[2rem] cursor-pointer flex flex-col transition-all duration-300 relative overflow-hidden bg-white shadow-sm hover:shadow-md ${
                    formValues.theme === "dark"
                      ? "border-sky-500 shadow-sky-500/10"
                      : "border-sky-100 hover:border-sky-200"
                  }`}
                >
                  {/* Top visual mockup container */}
                  <div className="h-48 w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex justify-center items-end pt-4 overflow-hidden relative border-b border-slate-800">
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-indigo-950 border border-indigo-900 text-indigo-300 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-sm">
                      <Moon className="w-3 h-3 text-indigo-400 fill-indigo-400" /> Night Vibe
                    </div>

                    {/* Miniature Phone Mockup */}
                    <div className={`w-[130px] h-[160px] bg-slate-950 rounded-t-2xl shadow-lg border flex flex-col relative overflow-hidden transition-all duration-300 ${
                      formValues.theme === "dark" ? "border-sky-500 scale-105" : "border-slate-900"
                    }`}>
                      {/* status bar */}
                      <div className="h-3 px-2 flex justify-between items-center bg-slate-900/80 border-b border-slate-900/50">
                        <span className="text-[6px] font-bold text-slate-500">9:41</span>
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="w-1.5 h-0.5 bg-slate-700 rounded-sm" />
                        </div>
                      </div>
                      {/* mini header */}
                      <div className="h-4 px-2 bg-slate-900/20 border-b border-slate-900/30 flex items-center justify-center">
                        <div className="w-10 h-1.5 bg-slate-800/60 rounded-full" />
                      </div>
                      {/* mockup content */}
                      <div className="flex-1 p-2 flex flex-col justify-center items-center relative overflow-hidden bg-slate-900">
                        {/* Glow ambient meshes */}
                        <div className="absolute top-1/4 left-1/4 w-10 h-10 rounded-full bg-pink-500/10 blur-md pointer-events-none" />
                        
                        {activeCategory === "couples" ? (
                          <>
                            <span className="text-[8px] font-luxury font-bold text-pink-300 tracking-wide text-center truncate w-full px-1 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Alex"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Jordan"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-pink-950 flex items-center justify-center border border-pink-900 shadow-sm">
                              <Heart className="w-2.5 h-2.5 text-pink-400 fill-pink-550" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-700/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-800/60 rounded-full" />
                          </>
                        ) : activeCategory === "friends" ? (
                          <>
                            <span className="text-[8px] font-sans font-black text-sky-300 tracking-tight text-center uppercase truncate w-full px-1 drop-shadow-[0_0_4px_rgba(56,189,248,0.4)]">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Sam"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Taylor"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center border border-sky-800 shadow-sm">
                              <Smile className="w-2.5 h-2.5 text-sky-400" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-700/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-800/60 rounded-full" />
                          </>
                        ) : activeCategory === "breakup" ? (
                          <>
                            <span className="text-[8px] font-serif italic text-slate-300 text-center truncate w-full px-1 drop-shadow-[0_0_4px_rgba(148,163,184,0.2)]">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Riley"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Casey"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shadow-sm">
                              <Sunset className="w-2.5 h-2.5 text-slate-400" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-700/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-800/60 rounded-full" />
                          </>
                        ) : (
                          <>
                            <span className="text-[8px] font-luxury text-sky-200 text-center truncate w-full px-1 drop-shadow-[0_0_4px_rgba(14,165,233,0.3)]">
                              {formValues.yourName ? formValues.yourName.substring(0, 8) : "Wisher"} &amp; {formValues.partnerName ? formValues.partnerName.substring(0, 8) : "Recipient"}
                            </span>
                            <div className="mt-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center border border-slate-850 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                            </div>
                            <div className="mt-2 w-12 h-1 bg-slate-700/60 rounded-full" />
                            <div className="mt-1 w-16 h-0.5 bg-slate-800/60 rounded-full" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900">Dark Theme</h3>
                        {formValues.theme === "dark" && (
                          <span className="bg-sky-500 text-white rounded-full p-1 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-slate-550 text-xs leading-relaxed">
                        {activeCategory === "couples"
                          ? "Deep plum and black mesh gradients, glowing text shadows, and golden rose icons."
                          : activeCategory === "friends"
                          ? "Dark stone backdrop offset with vibrant purple, mustard yellow, and cyan stickers."
                          : activeCategory === "wedding"
                          ? "Deep warm amber, shimmering gold stars, rich mahogany overlays, and glowing rings."
                          : "Cinematic midnight indigo mesh, slate grays, and blurred photographic filters."}
                      </p>
                    </div>

                    {/* Color indicators */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Palette</span>
                      <div className="flex gap-1.5">
                        {activeCategory === "couples" ? (
                          <>
                            <span className="w-3 h-3 rounded-full bg-[#180825] border border-slate-800" title="Plum Black" />
                            <span className="w-3 h-3 rounded-full bg-[#F43F5E] border border-slate-800" title="Rose Glow" />
                            <span className="w-3 h-3 rounded-full bg-[#E2E8F0]/20 border border-slate-800" title="Silver Frost" />
                          </>
                        ) : activeCategory === "friends" ? (
                          <>
                            <span className="w-3 h-3 rounded-full bg-[#0F172A] border border-slate-800" title="Dark Slate" />
                            <span className="w-3 h-3 rounded-full bg-violet-650 border border-slate-800" title="Vibrant Purple" />
                            <span className="w-3 h-3 rounded-full bg-cyan-400 border border-slate-800" title="Cyan Spark" />
                          </>
                        ) : activeCategory === "wedding" ? (
                          <>
                            <span className="w-3 h-3 rounded-full bg-[#1e140a] border border-slate-800" title="Warm Mahogany" />
                            <span className="w-3 h-3 rounded-full bg-[#fbbf24] border border-slate-800" title="Shimer Gold" />
                            <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" title="Amber Dark" />
                          </>
                        ) : (
                          <>
                            <span className="w-3 h-3 rounded-full bg-[#020617] border border-slate-800" title="Midnight Indigo" />
                            <span className="w-3 h-3 rounded-full bg-[#1E293B] border border-slate-800" title="Deep Slate" />
                            <span className="w-3 h-3 rounded-full bg-[#64748B] border border-slate-800" title="Slate Gray" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Background Music Toggle */}
              <div className="w-full max-w-3xl bg-white border border-sky-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    formValues.musicEnabled
                      ? "bg-emerald-50 text-emerald-500 border border-emerald-100"
                      : "bg-slate-50 text-slate-400 border border-slate-100"
                  }`}>
                    <Music className={`w-6 h-6 ${formValues.musicEnabled ? "animate-bounce" : ""}`} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                      Background Music
                      {formValues.musicEnabled ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 py-0.5 px-2 rounded-full uppercase tracking-wider">Disabled</span>
                      )}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      Include a premium ambient background track corresponding to your category.
                    </p>
                  </div>
                </div>

                {/* Premium Switch Widget */}
                <button
                  type="button"
                  onClick={() => setValue("musicEnabled", !formValues.musicEnabled)}
                  className={`w-14 h-8 rounded-full transition-all relative outline-none flex items-center p-1 cursor-pointer ${
                    formValues.musicEnabled ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-slate-200"
                  }`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 rounded-full bg-white shadow-sm"
                    animate={{ x: formValues.musicEnabled ? "24px" : "0px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-4 w-full max-w-md justify-center">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.scrollTo({ top: 0, behavior: "instant" as any });
                    } catch (e) {
                      window.scrollTo(0, 0);
                    }
                    if (document.documentElement) document.documentElement.scrollTop = 0;
                    if (document.body) document.body.scrollTop = 0;
                    setStep("details");
                  }}
                  className="flex-1 py-4 border border-sky-150 hover:bg-sky-50 text-slate-500 hover:text-slate-900 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.scrollTo({ top: 0, behavior: "instant" as any });
                    } catch (e) {
                      window.scrollTo(0, 0);
                    }
                    if (document.documentElement) document.documentElement.scrollTop = 0;
                    if (document.body) document.body.scrollTop = 0;
                    setStep("preview");
                  }}
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
              onAnimationComplete={() => {
                const scrollToTop = () => {
                  try {
                    window.scrollTo({ top: 0, behavior: "instant" as any });
                  } catch (e) {
                    window.scrollTo(0, 0);
                  }
                  if (document.documentElement) {
                    document.documentElement.scrollTop = 0;
                  }
                  if (document.body) {
                    document.body.scrollTop = 0;
                  }
                };
                scrollToTop();
                // Execute a sequence of scrolls to override any dynamic layout adjustments on mobile
                const t1 = setTimeout(scrollToTop, 50);
                const t2 = setTimeout(scrollToTop, 150);
                const t3 = setTimeout(scrollToTop, 300);
                const t4 = setTimeout(scrollToTop, 500);
                return () => {
                  clearTimeout(t1);
                  clearTimeout(t2);
                  clearTimeout(t3);
                  clearTimeout(t4);
                };
              }}
            >
              {/* Floating controls banner */}
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 border border-sky-150 px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl backdrop-blur-md max-w-xl w-[90%] sm:w-auto">
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
                    className="relative group overflow-hidden px-8 py-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-600 hover:via-indigo-600 hover:to-purple-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg shadow-indigo-500/35 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-95 ring-4 ring-sky-500/20 hover:ring-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <span>Generate Link</span>
                        <Sparkles className="w-4.5 h-4.5 text-amber-300 fill-amber-300 animate-pulse" />
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
                  images={stableImages}
                  customFields={stableCustomFields}
                  groomPhoto={formValues.groomPhoto}
                  bridePhoto={formValues.bridePhoto}
                  isPreview={true}
                  musicEnabled={formValues.musicEnabled}
                  selectedMusic={formValues.selectedMusic}
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
