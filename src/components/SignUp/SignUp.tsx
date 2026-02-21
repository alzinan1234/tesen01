"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

const signUpSchema = z.object({
  role: z.enum(["reader", "writer"]),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState<"reader" | "writer">("reader");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "reader",
      rememberMe: false
    }
  });

  const onSubmit = async (data: SignUpFormValues) => {
    // This will log the role (reader/writer) along with other data
    console.log("Sign Up Data:", data);
  };

  const handleRoleChange = (role: "reader" | "writer") => {
    setActiveRole(role);
    setValue("role", role);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE: Letterpress Image (Hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 lg:w-[45%] h-screen sticky top-0">
        <img 
          src="/signup-image.png" 
          alt="Letterpress types" 
          className="w-full h-full "
        />
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col items-center py-12 px-6 sm:px-16 overflow-y-auto">
        <div className="w-full max-w-[440px] flex flex-col h-full">
          
          {/* Logo */}
          <div className="mb-10">
            <img src="/oped.png" alt="Logo" className="w-[120px] h-auto" />
          </div>

          {/* Role Switcher */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-[27px] text-gray-800 mb-4">Choose Your Role</h2>
            <div className="inline-flex  bg-white border border-gray-100 rounded-full shadow-sm w-full">
              <button
                type="button"
                onClick={() => handleRoleChange("reader")}
                className={`flex-1 py-2 text-sm font-serif  font-medium rounded-full transition-all duration-300 ${
                  activeRole === "reader" 
                  ? "bg-[#3448D6] text-white shadow-md" 
                  : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Reader
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("writer")}
                className={`flex-1 py-2 text-sm font-serif  font-medium rounded-full transition-all duration-300 ${
                  activeRole === "writer" 
                  ? "bg-[#3448D6] text-white shadow-md" 
                  : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Writer
              </button> 
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-[20px] font-serif font-bold text-gray-900 mb-1">Create new Account</h1>
            <p className="text-gray-500 font-serif  text-sm">Sign in to continue your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold font-sans  text-black">Name</label>
              <input
                {...register("name")}
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border text-black border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold font-sans  text-black">Email Address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xl font-sans  text-black border border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all placeholder:text-gray-300"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold font-sans  text-black">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  className="w-full px-4 py-3 rounded-xl font-sans  text-black border border-[#C1D0E5] focus:ring-2 focus:ring-[#3448D6]/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-sans  k text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input 
                {...register("rememberMe")}
                type="checkbox" 
                id="remember"
                className="w-4 h-4 rounded font-sans  text-black border-gray-300 accent-[#3448D6] cursor-pointer" 
              />
              <label htmlFor="remember" className="text-xs font-serif   text-gray-500 cursor-pointer">
                Remember Me
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] font-serif   text-white rounded-full font-bold shadow-lg hover:opacity-95 transition-all active:scale-[0.98] mt-2"
            >
              {isSubmitting ? "Creating Account..." : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center my-8 gap-4">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="w-11 h-11 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-all">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            </button>
            <button className="w-11 h-11 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 brightness-0 invert" alt="Apple" />
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center font-serif  text-black text-sm text-gray-600 mb-12">
            Already have an account? <Link href="/" className="text-[#3448D6] font-serif font-bold ml-1">Login</Link>
          </p>

          {/* Bottom Copyright */}
          <footer className="mt-auto  font-sans   flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500  tracking-tighter sm:tracking-widest">
            <p>© 2026. OPED. All rights reserved.</p>
            <Link href="#" className="text-[#3448D6] normal-case font-bold hover:underline">Terms & Conditions</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}