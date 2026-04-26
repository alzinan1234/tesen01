"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, CheckCircle2, XCircle, Info } from "lucide-react";
import { Role } from "../api";
import { login } from "../apiClient";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

// ── Schema ────────────────────────────────────────────────────
const loginSchema = z.object({
  email:      z.string().email("Invalid email address"),
  password:   z.string().min(6, "Password is too short"),
  rememberMe: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;
type ToastType = "success" | "error" | "info";

// ── Toast ─────────────────────────────────────────────────────
interface ToastProps { message: string; type: ToastType; onClose: () => void; }
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg: Record<ToastType, string> = {
    success: "bg-[#3448D6]",
    error:   "bg-red-500",
    info:    "bg-gray-800",
  };
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? XCircle : Info;
  return (
    <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl font-serif text-sm text-white max-w-sm ${bg[type]}`}
         style={{ animation: "toastSlide 0.3s ease-out" }}>
      <Icon size={18} className="shrink-0" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};

// ── Role Switcher ─────────────────────────────────────────────
interface RoleSwitcherProps { activeRole: Role; onChange: (r: Role) => void; }
const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ activeRole, onChange }) => (
  <div className="inline-flex bg-white border border-gray-100 rounded-full shadow-sm w-full max-w-[400px] mb-8">
    {(["reader", "writer"] as Role[]).map((r) => (
      <button key={r} type="button" onClick={() => onChange(r)}
        className={`flex-1 py-2.5 text-sm font-serif font-medium rounded-full capitalize transition-all duration-300 ${
          activeRole === r ? "bg-[#3448D6] text-white shadow-md" : "bg-transparent text-gray-500 hover:text-gray-700"
        }`}>{r}</button>
    ))}
  </div>
);

const getRedirectPath = (role: Role): string => role === "writer" ? "/writer" : "/reader";
const extractErrorMessage = (err: unknown, fallback: string): string =>
  (err as any)?.response?.data?.message ?? fallback;

// ── Main Component ────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<Role>("reader");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const router = useRouter();
  const showToast = useCallback((message: string, type: ToastType = "info") => setToast({ message, type }), []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Email/password login
  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    const roleUsed = activeRole;
    try {
      const res = await login({
        email: values.email,
        password: values.password,
        role: roleUsed,
      });
      if (res.success) {
        showToast(res.message || "Login successful!", "success");
        setTimeout(() => router.push(getRedirectPath(roleUsed)), 1000);
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "") ||
        (activeRole === "writer"
          ? "No writer account found. Try logging in as a Reader."
          : "No reader account found. Try logging in as a Writer.");
      showToast(message, "error");
    }
  };

  const onSocialLoginSuccess = () => {
    showToast("Login successful! Redirecting...", "success");
    setTimeout(() => {
      router.push(getRedirectPath(activeRole));
    }, 1000);
  };
  const onSocialLoginError = (msg: string) => showToast(msg, "error");

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[592px] min-h-[775px] flex flex-col py-12 px-6 sm:px-12 bg-white">
          <div className="mb-12 flex justify-start">
            <img src="./oped.png" alt="Logo" className="w-[135px] h-auto" />
          </div>

          <RoleSwitcher activeRole={activeRole} onChange={setActiveRole} />

          <p className="text-xs text-gray-400 font-sans -mt-5 mb-6 max-w-[400px]">
            {activeRole === "writer"
              ? "⚠️ Writer accounts can only log in as Writer."
              : "⚠️ Reader accounts can only log in as Reader."}
          </p>

          <div className="text-left w-full max-w-[400px] mb-8">
            <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-[#2D2D2D] font-serif text-[16px]">Sign in to continue your account</p>
          </div>

          <div className="w-full max-w-[400px]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-800">Email Address</label>
                <input {...register("email")} type="email" placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300 font-serif" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-800">Password</label>
                <div className="relative">
                  <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="........"
                    className="w-full px-4 py-3 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all font-serif" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer font-sans">
                  <input {...register("rememberMe")} type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#3448D6]" />
                  Remember Me
                </label>
                <Link href="/forgot-password" className="text-[#FF4D4D] text-xs font-serif italic font-bold">Forgot Password?</Link>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-2 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-bold text-base shadow-lg shadow-blue-900/20 hover:opacity-90 transition-opacity active:scale-[0.98] mt-4 disabled:opacity-70">
                {isSubmitting ? "Signing in…" : "Log In"}
              </button>
            </form>

            <div className="flex items-center justify-center my-10 gap-4">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
              <span className="text-[12px] font-sans font-bold text-gray-400 tracking-widest">OR</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-gray-300 to-gray-300" />
            </div>

            {/* Real social auth buttons */}
            <SocialAuthButtons role={activeRole} onSuccess={onSocialLoginSuccess} onError={onSocialLoginError} />

            <p className="text-center text-sm text-[#2D2D2D]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#3448D6] font-serif font-bold text-[16px] ml-1">Sign Up</Link>
            </p>
          </div>

          <footer className="mt-auto pt-16 w-full flex flex-col sm:flex-row justify-between gap-2 text-[14px] text-[#2D2D2D] tracking-widest font-sans">
            <p>© 2026. OPED. All rights reserved.</p>
            <Link href="#" className="text-[#3448D6] normal-case font-bold">Terms &amp; Conditions</Link>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LoginPage;