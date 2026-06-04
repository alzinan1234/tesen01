"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, RotateCcw, CheckCircle2, XCircle, Info } from "lucide-react";
import { Role } from "../api";
import { resendOtp, signUp, verifyOtp } from "../apiClient";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

// ── Schemas ───────────────────────────────────────────────────
const signUpSchema = z.object({
  role:       z.enum(["reader", "writer"]),
  name:       z.string().min(2, "Name must be at least 2 characters"),
  email:      z.string().email("Invalid email address"),
  password:   z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
type SignUpFormValues = z.infer<typeof signUpSchema>;

// ── Toast Types ───────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

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
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl font-serif text-sm text-white max-w-sm ${bg[type]}`}
      style={{ animation: "toastSlide 0.3s ease-out" }}
    >
      <Icon size={18} className="shrink-0" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">
        ×
      </button>
    </div>
  );
};

// ── OTP Input (unchanged) ─────────────────────────────────────
interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}
const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
  const digits: string[] = Array.from({ length: 4 }, (_, i) => value[i] ?? "");
  const updateValue = (newDigits: string[]): void => onChange(newDigits.join(""));
  const handleChange = (i: number, char: string): void => {
    if (!/^\d?$/.test(char)) return;
    const d = [...digits];
    d[i] = char;
    updateValue(d);
    if (char && i < 3) inputRefs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        const d = [...digits];
        d[i - 1] = "";
        updateValue(d);
        inputRefs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 3) inputRefs.current[i + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const d = Array.from({ length: 4 }, (_, i) => pasted[i] ?? "");
    updateValue(d);
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };
  return (
    <div>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-xl font-bold font-serif text-black rounded-xl border-2 focus:outline-none transition-all duration-200 ${
              error
                ? "border-red-400 bg-red-50"
                : digits[i]
                ? "border-[#3448D6] bg-[#3448D6]/5 focus:ring-2 focus:ring-[#3448D6]/20"
                : "border-[#C1D0E5] focus:border-[#3448D6] focus:ring-2 focus:ring-[#3448D6]/20"
            }`}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
    </div>
  );
};

// ── Resend Timer ──────────────────────────────────────────────
const useResendTimer = (initial: number = 60) => {
  const [seconds, setSeconds] = useState<number>(initial);
  const [active, setActive] = useState<boolean>(true);
  useEffect(() => {
    if (!active || seconds <= 0) {
      setActive(false);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, active]);
  return {
    seconds,
    canResend: !active,
    reset: () => {
      setSeconds(initial);
      setActive(true);
    },
  };
};

// ── Main Component ────────────────────────────────────────────
const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<Role>("reader");
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [otpValue, setOtpValue] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { seconds, canResend, reset: resetTimer } = useResendTimer(60);
  const showToast = useCallback((message: string, type: ToastType = "info") => setToast({ message, type }), []);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "reader", rememberMe: false },
  });

  const handleRoleChange = (role: Role): void => {
    setActiveRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: SignUpFormValues): Promise<void> => {
    try {
      const res = await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      if (res.success) {
        setPendingEmail(data.email);
        setStep("otp");
        showToast(res.message || "Account created! Check your email for the OTP.", "success");
      }
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message ?? "Something went wrong. Please try again.";
      showToast(message, "error");
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    const clean = otpValue.replace(/\s/g, "");
    if (clean.length < 4) {
      setOtpError("Please enter all 4 digits");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await verifyOtp({ email: pendingEmail, otp: clean, role: activeRole });
      if (res.success) {
        showToast("Email verified successfully! Redirecting…", "success");
        setTimeout(() => {
          window.location.href = activeRole === "writer" ? "/writer" : "/writer";
        }, 1500);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Invalid OTP. Please try again.";
      setOtpError(msg);
      showToast(msg, "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!canResend) return;
    try {
      const res = await resendOtp({ email: pendingEmail, role: activeRole });
      resetTimer();
      setOtpValue("");
      setOtpError("");
      showToast(res.message || "OTP resent! Check your email.", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Could not resend OTP.";
      showToast(message, "error");
    }
  };

  const onSocialLoginSuccess = () => {
    showToast("Login successful! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = activeRole === "writer" ? "/writer" : "/writer";
    }, 1500);
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fadeup { animation: fadeUp 0.4s ease-out forwards; }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        <div className="hidden md:block md:w-1/2 lg:w-[45%] h-screen sticky top-0">
          <img src="/signup-image.png" alt="Letterpress types" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col items-center py-12 px-6 sm:px-16 overflow-y-auto">
          <div className="w-full max-w-[440px] flex flex-col h-full">
            <div className="mb-10">
              <img src="/oped.png" alt="Logo" className="w-[150px] h-auto" />
            </div>

            {step === "otp" ? (
              <div className="anim-fadeup">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-[35px] text-gray-800 mb-4">Choose Your Role</h2>
                  <div className="inline-flex bg-white border border-gray-100 rounded-full shadow-sm w-full">
                    {(["reader", "writer"] as Role[]).map((r) => (
                      <button key={r} type="button" disabled
                        className={`flex-1 py-3 text-sm font-serif font-medium rounded-full capitalize transition-all duration-300 ${
                          activeRole === r ? "bg-[#3448D6] text-white shadow-md" : "bg-transparent text-gray-400"
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <h1 className="text-[20px] font-serif font-bold text-gray-900 mb-1">Verify your email</h1>
                  <p className="text-gray-500 font-serif text-sm">
                    We sent a 4-digit OTP to <span className="font-semibold text-gray-700">{pendingEmail}</span>
                  </p>
                </div>
                <div className="space-y-6">
                  <OtpInput value={otpValue} onChange={setOtpValue} error={otpError} />
                  <button onClick={handleVerifyOtp} disabled={otpLoading || otpValue.replace(/\s/g, "").length < 4}
                    className="w-full py-3 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] font-serif text-white rounded-full font-bold shadow-lg hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-60">
                    {otpLoading ? "Verifying…" : "Verify OTP"}
                  </button>
                  <div className="text-center">
                    {canResend ? (
                      <button onClick={handleResend} className="flex items-center gap-1.5 mx-auto text-sm font-serif text-[#3448D6] font-bold hover:underline">
                        <RotateCcw size={14} /> Resend OTP
                      </button>
                    ) : (
                      <p className="text-sm font-serif text-gray-400">Resend OTP in <span className="font-bold text-gray-600">{seconds}s</span></p>
                    )}
                  </div>
                  <p className="text-center font-serif text-sm text-gray-600">
                    Wrong email?{" "}
                    <button onClick={() => { setStep("signup"); setOtpValue(""); setOtpError(""); }}
                      className="text-[#3448D6] font-serif font-bold ml-1 hover:underline">Go back</button>
                  </p>
                </div>
                <footer className="mt-auto font-sans flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 tracking-tighter sm:tracking-widest pt-12">
                  <p>© 2026. OPED. All rights reserved.</p>
                  <Link href="#" className="text-[#3448D6] normal-case font-bold hover:underline">Terms &amp; Conditions</Link>
                </footer>
              </div>
            ) : (
              <div className="anim-fadeup">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-[35px] text-gray-800 mb-4">Choose Your Role</h2>
                  <div className="inline-flex bg-white border border-gray-100 rounded-full shadow-sm w-full">
                    <button onClick={() => handleRoleChange("reader")}
                      className={`flex-1 py-3 text-sm font-serif font-medium rounded-full transition-all duration-300 ${
                        activeRole === "reader" ? "bg-[#3448D6] text-white shadow-md" : "bg-transparent text-gray-500 hover:text-gray-700"
                      }`}>Reader</button>
                    <button onClick={() => handleRoleChange("writer")}
                      className={`flex-1 py-2 text-sm font-serif font-medium rounded-full transition-all duration-300 ${
                        activeRole === "writer" ? "bg-[#3448D6] text-white shadow-md" : "bg-transparent text-gray-500 hover:text-gray-700"
                      }`}>Writer</button>
                  </div>
                </div>

                <div className="mb-8">
                  <h1 className="text-[20px] font-serif font-bold text-gray-900 mb-1">Create new Account</h1>
                  <p className="text-gray-500 font-serif text-sm">Sign in to continue your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold font-sans text-black">Name</label>
                    <input {...register("name")} type="text" placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none font-serif transition-all placeholder:text-gray-300" />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold font-sans text-black">Email Address</label>
                    <input {...register("email")} type="email" placeholder="Enter your email address"
                      className="w-full px-4 py-3 rounded-xl font-serif text-black border border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300" />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold font-sans text-black">Password</label>
                    <div className="relative">
                      <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="........"
                        className="w-full px-4 py-3 rounded-xl font-serif text-black border border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input {...register("rememberMe")} type="checkbox" id="remember"
                      className="w-4 h-4 rounded font-sans text-black border-gray-300 accent-[#3448D6] cursor-pointer" />
                    <label htmlFor="remember" className="text-xs font-serif text-gray-500 cursor-pointer">Remember Me</label>
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] font-serif text-white rounded-full font-bold shadow-lg hover:opacity-95 transition-all active:scale-[0.98] mt-2 disabled:opacity-70">
                    {isSubmitting ? "Creating Account…" : "Continue"}
                  </button>
                </form>

                <div className="flex items-center justify-center my-8 gap-4">
                  <div className="flex-1 h-[1px] bg-gray-200" />
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest">OR</span>
                  <div className="flex-1 h-[1px] bg-gray-200" />
                </div>

                {/* Real social auth buttons */}
                <SocialAuthButtons role={activeRole} onSuccess={onSocialLoginSuccess} onError={onSocialLoginError} />

                <p className="text-center font-serif text-black text-sm text-gray-600 mb-12">
                  Already have an account?{" "}
                  <Link href="/" className="text-[#3448D6] font-serif font-bold ml-1">Login</Link>
                </p>

                <footer className="mt-auto font-sans flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 tracking-tighter sm:tracking-widest">
                  <p>© 2026. OPED. All rights reserved.</p>
                  <Link href="#" className="text-[#3448D6] normal-case font-bold hover:underline">Terms &amp; Conditions</Link>
                </footer>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;