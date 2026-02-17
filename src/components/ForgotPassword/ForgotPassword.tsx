"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

// --- SCHEMAS ---
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Timer Logic
  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  // Forms
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const passForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  // --- HANDLERS ---
  const onEmailSubmit = async (data: EmailForm) => {
    console.log("Sending OTP to:", data.email);
    setStep('otp');
  };

  const onOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('reset');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE: Letterpress Image */}
      <div className="hidden md:block md:w-1/2 lg:w-[45%] h-screen sticky top-0">
        <img 
          src="/signup-image.png" 
          alt="Letterpress types" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col items-center justify-center py-12 px-6">
        
        {/* DESIGN BOX: 592px Width x 550px Min-Height (As per image specs) */}
        <div className="w-full max-w-[592px] min-h-[550px] flex flex-col px-4 sm:px-12 py-10">
          
          {/* Logo */}
          <div className="mb-12">
            <img src="/oped.png" alt="Logo" className="w-[135px] h-auto" />
          </div>

          <div className="max-w-[400px] w-full">
            {/* STEP 1: REQUEST OTP */}
            {step === 'email' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-8">
                  <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">Reset Password</h1>
                  <p className="text-[#2D2D2D] font-serif text-[16px] leading-relaxed">
                    Enter your email, we will send a verification code to your email.
                  </p>
                </div>

                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold font-sans text-gray-800">Email Address</label>
                    <input
                      {...emailForm.register("email")}
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3.5 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300 font-sans"
                    />
                    {emailForm.formState.errors.email && <p className="text-red-500 text-xs">{emailForm.formState.errors.email.message}</p>}
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-bold text-base shadow-lg shadow-blue-900/20 hover:opacity-90 transition-opacity active:scale-[0.98]">
                    Continue
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 'otp' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-8">
                  <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">Verification Code</h1>
                  <p className="text-[#2D2D2D] font-serif text-[16px] leading-relaxed">
                    Enter the verification code that we have sent to your email.
                  </p>
                </div>

                <form onSubmit={onOtpSubmit} className="space-y-8">
                  <div className="flex justify-between gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-[70px] h-[60px] text-center text-xl font-bold border border-[#C1D0E5] rounded-xl focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none text-black"
                      />
                    ))}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-[13px] text-gray-500 font-sans">
                      Didn't receive the code? <button type="button" className="text-[#FF4D4D] font-bold italic hover:underline">Resend code</button>
                    </p>
                    <p className="text-[12px] text-gray-400 font-sans">
                      Resend code at 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </p>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-bold shadow-lg">
                    Continue
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 'reset' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-8">
                  <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">Create New Password</h1>
                  <p className="text-[#2D2D2D] font-serif text-[16px]">
                    Your password must be different from previous used password.
                  </p>
                </div>

                <form onSubmit={passForm.handleSubmit((d) => console.log(d))} className="space-y-5 font-sans">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800">New Password</label>
                    <div className="relative">
                      <input
                        {...passForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="........"
                        className="w-full px-4 py-3.5 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all font-sans"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800">Confirm Password</label>
                    <div className="relative">
                      <input
                        {...passForm.register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="........"
                        className="w-full px-4 py-3.5 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all font-sans"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs">{passForm.formState.errors.confirmPassword.message}</p>}
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-bold shadow-lg mt-4">
                    Continue
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer (Matches design exactly) */}
          <footer className="mt-auto pt-16 w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[14px] text-[#2D2D2D]  tracking-widest font-sans">
            <p>© 2026. OPED. All rights reserved.</p>
            <Link href="#" className="text-[#3448D6] normal-case font-bold hover:underline">Terms & Conditions</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}