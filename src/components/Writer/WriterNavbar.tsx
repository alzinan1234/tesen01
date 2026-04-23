"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, User, FileText, Settings, LogOut } from "lucide-react";
import { tokenManager, logout } from "../apiClient";
import { UserProfile } from "../apiClient";
import NotificationBell from "../Reader/NotificationBell";
 // ← Import the notification component

// ── Account Dropdown ──────────────────────────────────────────

interface AccountDropdownProps {
  user:     UserProfile | null;
  onLogout: () => void;
  onClose:  () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ user, onLogout, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0,  scale: 1    }}
    exit={  { opacity: 0, y: 8,  scale: 0.97 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
    className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
  >
    {/* User info */}
    {user && (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50" style={{ fontFamily: 'serif' }}>
        <p className="text-[13px] font-bold text-gray-900 truncate">{user.name}</p>
        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
      </div>
    )}

    {/* Menu items */}
    <div className="py-1">
      <Link href="/writer/profile" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3448D6] transition-colors" style={{ fontFamily: 'serif' }}>
        <User size={15} /> My Account
      </Link>
      {/* <Link href="/writer/articles" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3448D6] transition-colors" style={{ fontFamily: 'serif' }}>
        <FileText size={15} /> My Articles
      </Link> */}
      {/* <Link href="/writer/settings" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3448D6] transition-colors" style={{ fontFamily: 'serif' }}>
        <Settings size={15} /> Settings
      </Link> */}
    </div>

    {/* Logout */}
    <div className="border-t border-gray-100 py-1">
      <button onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-bold text-[#FF4D4D] hover:bg-red-50 transition-colors" style={{ fontFamily: 'serif' }}>
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  </motion.div>
);

// ── Main Navbar ───────────────────────────────────────────────

const WriterNavbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isLoggedIn,   setIsLoggedIn]   = useState<boolean>(false);
  const [user,         setUser]         = useState<UserProfile | null>(null);

  const router      = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Auth state sync ───────────────────────────────────────

  const syncAuthState = () => {
    const loggedIn = tokenManager.isLoggedIn();
    setIsLoggedIn(loggedIn);
    setUser(loggedIn ? tokenManager.getUser() : null);
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("focus", syncAuthState);
    return () => window.removeEventListener("focus", syncAuthState);
  }, []);

  // ── Close dropdown on outside click ──────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  
  // ── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
    } catch {
      // tokens cleared locally even if API fails
    }
    syncAuthState();
    router.push("/");
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white border-b border-gray-100 z-50 flex items-center px-6 md:px-12 lg:px-20 font-sans" style={{ fontFamily: 'sans-serif' }}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">

        {/* Left spacer */}
        <div className="flex-1" />

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/writer">
            <img src="/nav-logo.png" alt="OPED" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex justify-end items-center gap-6">

          {isLoggedIn ? (
            /* ── Logged in: My Account dropdown ── */
            <div className="relative overflow-visible" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 text-black hover:text-[#3448D6] transition-colors font-sans"
                style={{ fontWeight: 900, fontSize: "20px" }}
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#3448D6]/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3448D6]/10 flex items-center justify-center">
                    <User size={16} className="text-[#3448D6]" />
                  </div>
                )}
                <span>My Account</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <AccountDropdown
                    user={user}
                    onLogout={handleLogout}
                    onClose={() => setDropdownOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Logged out: Sign In ── */
            <Link
              href="/"
              className="text-black font-sans font-bold text-2xl hover:text-gray-600 transition-colors"
              style={{ fontFamily: 'sans-serif' }}
            >
              Sign In
            </Link>
          )}

          {/* Notification Bell - Using the same component as ReaderNavbar */}
          {isLoggedIn && (
            <NotificationBell className="" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default WriterNavbar;