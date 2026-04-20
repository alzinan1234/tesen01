"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, CheckCircle2, XCircle, Info } from "lucide-react";
import { forgotPassword, resetPassword } from "../apiClient";
import { Role } from "../api";


// ── Schemas ───────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    password:        z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path:    ["confirmPassword"],
  });

type EmailForm    = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type Step = "email" | "otp" | "reset";

// ── Toast ─────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type:    ToastType;
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
  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? XCircle : Info;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl font-serif text-sm text-white max-w-sm ${bg[type]}`}
      style={{ animation: "toastSlide 0.3s ease-out" }}
    >
      <Icon size={18} className="shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

// ── OTP Input ─────────────────────────────────────────────────

interface OtpInputProps {
  otp:      string[];
  onChange: (otp: string[]) => void;
  error?:   string;
}

const OtpInput: React.FC<OtpInputProps> = ({ otp, onChange, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([
    null, null, null, null,
  ]);

  const handleChange = (index: number, value: string): void => {
    if (isNaN(Number(value))) return;
    const newOtp  = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    onChange(newOtp);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft"  && index > 0) inputRefs.current[index - 1]?.focus();
    else if   (e.key === "ArrowRight" && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4)
      .split("");
    const newOtp = [...otp];
    pasted.forEach((d, i) => { if (i < 4) newOtp[i] = d; });
    onChange(newOtp);
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-between gap-3">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-[70px] h-[60px] text-center text-xl font-bold border-2 rounded-xl focus:outline-none text-black transition-all duration-200 ${
              error
                ? "border-red-400 bg-red-50"
                : digit
                ? "border-[#3448D6] bg-[#3448D6]/5 focus:ring-2 focus:ring-[#3448D6]/20"
                : "border-[#C1D0E5] focus:border-[#3448D6] focus:ring-2 focus:ring-[#3448D6]/20"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-xs text-center mt-2">{error}</p>
      )}
    </div>
  );
};

// ── Resend Timer ──────────────────────────────────────────────

interface ResendTimerHook {
  timeLeft:  number;
  canResend: boolean;
  start:     () => void;
}

const useResendTimer = (initial: number = 59): ResendTimerHook => {
  const [timeLeft, setTimeLeft] = useState<number>(initial);
  const [active,   setActive]   = useState<boolean>(false);

  useEffect(() => {
    if (!active || timeLeft <= 0) {
      setActive(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, active]);

  return {
    timeLeft,
    canResend: !active || timeLeft <= 0,
    start: () => { setTimeLeft(initial); setActive(true); },
  };
};

// ── Main Component ────────────────────────────────────────────

const ForgotPassword: React.FC = () => {
  const [step,        setStep]        = useState<Step>("email");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [showPassword,        setShowPassword]        = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [otp,      setOtp]      = useState<string[]>(["", "", "", ""]);
  const [otpError, setOtpError] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type:    ToastType;
  } | null>(null);

  // ── FIX: Read role safely on client only ──────────────────
  // Previously this was read directly in component body which
  // causes SSR hydration mismatch and potential crashes.
  const [role, setRole] = useState<Role>("reader");
  useEffect(() => {
    const saved = localStorage.getItem("oped_role") as Role | null;
    if (saved === "reader" || saved === "writer") {
      setRole(saved);
    }
  }, []);

  const router = useRouter();
  const { timeLeft, canResend, start: startTimer } = useResendTimer(59);

  const showToast = useCallback(
    (message: string, type: ToastType = "info"): void =>
      setToast({ message, type }),
    []
  );

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });
  const passForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // ── Step 1: Send OTP ──────────────────────────────────────

  const onEmailSubmit = async (data: EmailForm): Promise<void> => {
    try {
      const res = await forgotPassword({ email: data.email, role });
      if (res.success) {
        setPendingEmail(data.email);
        setStep("otp");
        startTimer();
        showToast(res.message || "OTP sent to your email!", "success");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not send OTP. Please try again.";
      showToast(message, "error");
    }
  };

  // ── Step 2: Verify OTP locally then move to reset ─────────

  const onOtpSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length < 4 || otp.some((d) => d === "")) {
      setOtpError("Please enter all 4 digits");
      return;
    }
    setOtpError("");
    setStep("reset");
  };

  // ── Resend OTP ────────────────────────────────────────────

  const handleResend = async (): Promise<void> => {
    if (!canResend) return;
    try {
      const res = await forgotPassword({ email: pendingEmail, role });
      setOtp(["", "", "", ""]);
      setOtpError("");
      startTimer();
      showToast(res.message || "OTP resent!", "success");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not resend OTP.";
      showToast(message, "error");
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────

  const onResetSubmit = async (data: PasswordForm): Promise<void> => {
    try {
      const res = await resetPassword({
        email:       pendingEmail,
        otp:         otp.join(""),
        newPassword: data.password,
        role,
      });
      if (res.success) {
        showToast(
          res.message || "Password reset successful! You can now login.",
          "success"
        );
        setTimeout(() => router.push("/"), 1500);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not reset password. Please try again.";
      showToast(message, "error");
    }
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
        {/* LEFT IMAGE */}
        <div className="hidden md:block md:w-1/2 lg:w-[45%] h-screen sticky top-0">
          <img
            src="/signup-image.png"
            alt="Letterpress types"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col items-center justify-center py-12 px-6">
          <div className="w-full max-w-[592px] min-h-[550px] flex flex-col px-4 sm:px-12 py-10">

            {/* Logo */}
            <div className="mb-12">
              <img src="/oped.png" alt="Logo" className="w-[135px] h-auto" />
            </div>

            <div className="max-w-[400px] w-full">

              {/* ── STEP 1: Email ── */}
              {step === "email" && (
                <div className="anim-fadeup">
                  <div className="mb-8">
                    <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">
                      Reset Password
                    </h1>
                    <p className="text-[#2D2D2D] font-serif text-[16px] leading-relaxed">
                      Enter your email, we will send a verification code to
                      your email.
                    </p>
                  </div>
                  <form
                    onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-bold font-sans text-gray-800">
                        Email Address
                      </label>
                      <input
                        {...emailForm.register("email")}
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3.5 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300 font-sans"
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-red-500 text-xs">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={emailForm.formState.isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-bold text-base shadow-lg shadow-blue-900/20 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-70"
                    >
                      {emailForm.formState.isSubmitting
                        ? "Sending…"
                        : "Continue"}
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === "otp" && (
                <div className="anim-fadeup">
                  <div className="mb-8">
                    <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">
                      Verification Code
                    </h1>
                    <p className="text-[#2D2D2D] font-serif text-[16px] leading-relaxed">
                      Enter the verification code sent to{" "}
                      <span className="font-semibold text-gray-700">
                        {pendingEmail}
                      </span>
                    </p>
                  </div>
                  <form onSubmit={onOtpSubmit} className="space-y-8">
                    <OtpInput
                      otp={otp}
                      onChange={(v) => {
                        setOtp(v);
                        setOtpError("");
                      }}
                      error={otpError}
                    />
                    <div className="text-center space-y-1">
                      <p className="text-[13px] text-gray-500 font-sans">
                        Didn&apos;t receive the code?{" "}
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={!canResend}
                          className={`font-bold italic transition-all ${
                            canResend
                              ? "text-[#FF4D4D] hover:underline"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          Resend code
                        </button>
                      </p>
                      {!canResend && (
                        <p className="text-[12px] text-gray-400 font-sans">
                          Resend code at 00:
                          {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-bold shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                      Continue
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 3: New Password ── */}
              {step === "reset" && (
                <div className="anim-fadeup">
                  <div className="mb-8">
                    <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">
                      Create New Password
                    </h1>
                    <p className="text-[#2D2D2D] font-serif text-[16px]">
                      Your password must be different from previously used
                      passwords.
                    </p>
                  </div>
                  <form
                    onSubmit={passForm.handleSubmit(onResetSubmit)}
                    className="space-y-5 font-sans"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          {...passForm.register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="........"
                          className="w-full px-4 py-3.5 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {passForm.formState.errors.password && (
                        <p className="text-red-500 text-xs">
                          {passForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          {...passForm.register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="........"
                          className="w-full px-4 py-3.5 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all font-sans"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {passForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-xs">
                          {passForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={passForm.formState.isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-bold shadow-lg mt-4 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-70"
                    >
                      {passForm.formState.isSubmitting
                        ? "Resetting…"
                        : "Continue"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-16 w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[14px] text-[#2D2D2D] tracking-widest font-sans">
              <p>© 2026. OPED. All rights reserved.</p>
              <Link
                href="#"
                className="text-[#3448D6] normal-case font-bold hover:underline"
              >
                Terms &amp; Conditions
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;