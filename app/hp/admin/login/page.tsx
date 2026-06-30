"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, User, Loader2, AlertCircle, Heart } from "lucide-react";
import { loginAdmin } from "@/actions/admin";

// Client-side schema
const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormInput = z.infer<typeof loginFormSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAdmin(data);
      if (result.success) {
        // Redirect to dashboard
        router.push("/hp/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Invalid username or password.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glow meshes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-950/80 border border-zinc-900 rounded-3xl p-8 space-y-8 relative z-10 backdrop-blur-md shadow-2xl"
      >
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-rose-500 shadow-md">
            <Heart className="w-6 h-6 fill-rose-500/10" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase font-mono">
            HeartPage Admin
          </h1>
          <p className="text-zinc-500 text-xs">
            Authenticate to access the management panel
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-red-200"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium font-mono">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-zinc-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="njanadmin"
                disabled={isLoading}
                {...register("username")}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-rose-500/80 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors text-white disabled:opacity-50"
              />
            </div>
            {errors.username && (
              <span className="text-[10px] text-red-500 font-mono">{errors.username.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium font-mono">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register("password")}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-rose-500/80 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors text-white disabled:opacity-50"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-mono">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </motion.div>

      {/* Expiry / Security notice */}
      <footer className="absolute bottom-6 text-[10px] text-zinc-600 font-mono">
        SECURE ADMIN GATEWAY &middot; JWT SESSION ENCRYPTED
      </footer>
    </div>
  );
}
