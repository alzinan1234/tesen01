"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ChevronDown, User, BookMarked, Newspaper, LogOut, Radio } from "lucide-react";
import { tokenManager, logout } from "../apiClient"; // adjust path
import { UserProfile } from "../apiClient";           // adjust path
import NotificationBell from "./NotificationBell";
    // adjust path

// ── Nav links ─────────────────────────────────────────────────

const navLinks = [
  { name: "Explore",    href: "/reader/explore"    },
  { name: "Politics",   href: "/reader/politics"   },
  { name: "Business",   href: "/reader/business"   },
  { name: "Finance",    href: "/reader/finance"    },
  { name: "Technology", href: "/reader/technology" },
  { name: "Culture",    href: "/reader/culture"    },
  { name: "Travel",     href: "/reader/travel"     },
  { name: "Gastronomy", href: "/reader/gastronomy" },
  { name: "Podcasts",   href: "/reader/podcasts"   },
  { name: "Live News",  href: "/reader/live", icon: Radio },
];

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
    {user && (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-[13px] font-bold font-serif text-gray-900 truncate">{user.name}</p>
        <p className="text-[12px] font-serif text-gray-500 truncate">{user.email}</p>
      </div>
    )}
    <div className="py-1">
      <Link href="/reader/profile" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3448D6] transition-colors">
        <User size={15} /> My Account
      </Link>
      {/* <Link href="/reader/newsletters" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3448D6] transition-colors">
        <Newspaper size={15} /> Your Newsletters
      </Link> */}
      <Link href="/reader/saved" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3448D6] transition-colors">
        <BookMarked size={15} /> Saved Stories
      </Link>
    </div>
    <div className="border-t border-gray-100 py-1">
      <button onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-bold text-[#FF4D4D] hover:bg-red-50 transition-colors">
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  </motion.div>
);

// ── Main Navbar ───────────────────────────────────────────────

const ReaderNavbar: React.FC = () => {
  const [isOpen,       setIsOpen]       = useState(false);
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [user,         setUser]         = useState<UserProfile | null>(null);

  const pathname    = usePathname();
  const router      = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth state sync
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Logout
  const handleLogout = async () => {
    setDropdownOpen(false);
    try { await logout(); } catch { /* clear locally anyway */ }
    syncAuthState();
    router.push("/");
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b font-sans ${
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white shadow"
    } border-gray-200`}>

      {/* ── TOP SECTION ── */}
      <motion.div
        initial={false}
        animate={{ height: isScrolled ? 0 : "auto", opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-visible"
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 h-20 md:h-24 flex items-center justify-between relative">

          {/* Mobile menu toggle */}
          <div className="flex-1 md:hidden">
            <button onClick={() => setIsOpen(true)} className="text-gray-900 p-2 -ml-2">
              <Menu size={28} />
            </button>
          </div>

          {/* Logo – centered */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/reader">
              <img src="/nav-logo.png" alt="OPED" className="h-8 md:h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4 lg:gap-6">

            {isLoggedIn ? (
              /* My Account dropdown */
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-gray-900 hover:text-[#3448D6] transition-colors"
                  style={{ fontWeight: 900, fontSize: "18px", letterSpacing: "0.06em" }}
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
                  <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <AccountDropdown user={user} onLogout={handleLogout} onClose={() => setDropdownOpen(false)} />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/"
                className="hidden md:block text-gray-900 hover:text-[#3448D6] transition-colors"
                style={{ fontWeight: 900, fontSize: "18px", letterSpacing: "0.06em" }}>
                Sign In
              </Link>
            )}

            {/* Subscribe button */}
            <Link href="/reader/subscribe" className="hidden sm:block">
              <button
                className="px-4 sm:px-8 py-2 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
                style={{ fontWeight: 900, fontSize: "14px", letterSpacing: "0.06em" }}>
                Subscribe
              </button>
            </Link>

            {/* 🔔 Notification Bell — only shown when logged in */}
            {isLoggedIn && (
              <NotificationBell className="hidden md:block" />
            )}

            {/* Search */}
            {/* <button className="text-gray-900 hover:text-[#3448D6] transition-colors p-1">
              <Search size={24} className="md:w-[28px] md:h-[28px]" />
            </button> */}
          </div>
        </div>
      </motion.div>

      {/* ── NAV LINKS ── */}
      <div className="w-full border-t border-gray-100 overflow-x-auto no-scrollbar">

        {/* Mobile links row */}
        <div className="md:hidden flex items-center px-4 h-12 gap-4">
          {isScrolled && (
            <button onClick={() => setIsOpen(true)} className="text-gray-900 flex-shrink-0">
              <Menu size={24} />
            </button>
          )}
          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 h-full">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className={`text-xs font-black uppercase whitespace-nowrap flex items-center gap-1 ${
                  pathname === link.href ? "text-[#3448D6]" : "text-gray-800"
                }`}>
                {link.name === "Live News" && <Radio size={12} className="text-red-500 animate-pulse flex-shrink-0" />}
                {link.name}
              </Link>
            ))}
          </div>
          {/* Bell in mobile nav row */}
          {isLoggedIn && (
            <NotificationBell className="flex-shrink-0" />
          )}
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 h-14 justify-center items-center gap-6 lg:gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}
                className={`relative group whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  isActive ? "text-[#3448D6]" : "text-gray-800 hover:text-black"
                }`}
                style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "0.06em" }}>
                {link.name === "Live News" && (
                  <Radio size={14} className="text-red-500 animate-pulse flex-shrink-0" />
                )}
                {link.name}
                <motion.div
                  className="absolute -bottom-1 left-0 h-[2px] bg-[#3448D6] rounded-full"
                  initial={false}
                  animate={{ width: isActive ? "100%" : "0%" }}
                  whileHover={!isActive ? { width: "100%" } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE SIDEBAR ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[60] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b">
                <img src="/oped.png" alt="Logo" className="h-6" />
                <button onClick={() => setIsOpen(false)} className="text-gray-500 p-2">
                  <X size={28} />
                </button>
              </div>

              {isLoggedIn && user && (
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center gap-3">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#3448D6]/10 flex items-center justify-center">
                      <User size={18} className="text-[#3448D6]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.name} href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 transition-colors ${
                        isActive ? "text-[#3448D6]" : "text-gray-900 hover:text-[#3448D6]"
                      }`}
                      style={{ fontWeight: 900, fontSize: "20px", letterSpacing: "0.06em" }}>
                      {link.name === "Live News" && <Radio size={18} className="text-red-500 animate-pulse" />}
                      {link.name}
                    </Link>
                  );
                })}

                {isLoggedIn && (
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <Link href="/reader/profile" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#3448D6] transition-colors"
                      style={{ fontWeight: 900, fontSize: "16px" }}>
                      <User size={16} /> My Account
                    </Link>
                    <Link href="/reader/newsletters" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#3448D6] transition-colors"
                      style={{ fontWeight: 900, fontSize: "16px" }}>
                      <Newspaper size={16} /> Your Newsletters
                    </Link>
                    <Link href="/reader/saved" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#3448D6] transition-colors"
                      style={{ fontWeight: 900, fontSize: "16px" }}>
                      <BookMarked size={16} /> Saved Stories
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6 border-t space-y-4 bg-gray-50">
                {isLoggedIn ? (
                  <button onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="block w-full text-center py-4 text-[#FF4D4D] font-bold text-lg border border-red-200 rounded-xl bg-white">
                    Sign Out
                  </button>
                ) : (
                  <Link href="/" onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-4 text-gray-900 font-bold text-lg border border-gray-300 rounded-xl bg-white">
                    Sign In
                  </Link>
                )}
                <Link href="/reader/subscribe" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-4 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-xl font-bold text-lg">
                    Subscribe Now
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
};

export default ReaderNavbar;