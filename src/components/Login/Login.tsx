"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added for redirection
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is too short"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // Initialize router

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Artificial delay to simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fake Data Logic
    console.log("Login Data Submitted:", data);
    
    // In a real app, you'd verify this against a database.
    // For now, any valid form submission redirects to the reader page.
    router.push('/reader'); 
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-[592px] min-h-[775px] flex flex-col py-12 px-6 sm:px-12 bg-white">
        
        {/* 1. Logo Section */}
        <div className="mb-12 flex justify-start gap-2">
          <img src="./oped.png" alt="Logo" className='w-[135px] h-auto'/>
        </div>

        {/* 2. Welcome Header */}
        <div className="text-left w-full max-w-[400px] mb-8">
          <h1 className="text-[24px] font-serif font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-[#2D2D2D] font-serif text-[16px]">Sign in to continue your account</p>
        </div>

        {/* 3. Login Form */}
        <div className="w-full max-w-[400px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
            
            {/* Email */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-sm font-bold text-gray-800">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300 font-sans"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-800">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  className="w-full px-4 py-3 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer font-sans">
                <input 
                  {...register("rememberMe")}
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 accent-[#3448D6]" 
                />
                Remember Me
              </label>
              <Link href="/forgot-password" className="text-[#FF4D4D] text-xs font-serif italic font-bold">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-bold text-base shadow-lg shadow-blue-900/20 hover:opacity-90 transition-opacity active:scale-[0.98] mt-4"
            >
              {isSubmitting ? "Processing..." : "Log In"}
            </button>
          </form>

          {/* 4. Updated Divider to match image */}
          <div className="flex items-center justify-center my-10 gap-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
            <span className="text-[12px] font-sans font-bold text-gray-400 tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
          </div>

          {/* 5. Social Icons */}
          <div className="flex justify-center gap-6 mb-8">
            <button className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-black hover:bg-gray-900 transition-all active:scale-95 shadow-md">
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                className="w-6 h-6" 
                alt="Google" 
              />
            </button>

            <button className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-black hover:bg-gray-900 transition-all active:scale-95 shadow-md">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" 
                className="w-6 h-6 brightness-0 invert" 
                alt="Apple" 
              />
            </button>
          </div>

          {/* 6. Footer Links */}
          <p className="text-center text-sm text-[#2D2D2D] ">
            Don't have an account? <Link href="/signup" className="text-[#3448D6] font-serif font-bold text-[16px] ml-1">Sign Up</Link>
          </p>
        </div>

        {/* 7. Bottom Copyright */}
        <footer className="mt-auto pt-16 w-full flex flex-col sm:flex-row justify-between gap-2 text-[14px] text-[#2D2D2D] tracking-widest sm:text-left font-sans">
          <p>© 2026. OPED. All rights reserved.</p>
          <div className="flex gap-4">
             <Link href="#" className="text-[#3448D6] normal-case font-bold">Terms & Conditions</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}