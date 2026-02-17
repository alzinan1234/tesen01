"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const footerData = {
  sections: [
    { name: 'Explore', href: '/explore' },
    { name: 'Culture', href: '/culture' },
    { name: 'Travel', href: '/travel' },
    { name: 'Finance', href: '/finance' },
    { name: 'Politics', href: '/politics' },
  ],
  more: [
    { name: 'Podcasts', href: '/podcasts' },
    { name: 'Gastronomy', href: '/gastronomy' },
    { name: 'Technology', href: '/technology' },
    { name: 'Business', href: '/business' },
    { name: 'Subscribe', href: '/subscribe' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ]
};

const socialLinks = [
  { icon: <Facebook size={20} />, href: '#' },
  { icon: <Instagram size={20} />, href: '#' },
  { icon: <Twitter size={20} />, href: '#' },
  { icon: <Linkedin size={20} />, href: '#' },
  // Adding TikTok as a custom SVG since it's in your design
  { 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ), 
    href: '#' 
  },
];

const ReaderFooter = () => {
  return (
    <footer className="bg-[#21242C]  text-white pt-16 pb-8 px-6 sm:px-12 lg:px-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Logo Section */}
          <div className="lg:col-span-1 ">
            <img 
              src="/reader-footer.png" // The 'H' style logo from your design
              alt="OPED Icon" 
              className="w-35 h-auto mb-6 opacity-90"
            />
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-lg font-bold mb-6 tracking-wide">Sections</h3>
            <ul className="space-y-4">
              {footerData.sections.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm tracking-widest">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 tracking-wide">More</h3>
            <ul className="space-y-4">
              {footerData.more.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm tracking-widest">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 tracking-wide">Company & Legal</h3>
            <ul className="space-y-4">
              {footerData.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm tracking-widest">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Branding Section */}
          <div className="lg:col-span-1 flex flex-col items-start lg:items-end">
            <h3 className="text-lg font-bold mb-6 tracking-wide self-start lg:self-auto">Social media links</h3>
            <div className="flex gap-3 mb-10">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#3C3F46] text-white  hover:bg-[#3448D6] hover:text-white transition-all shadow-md"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            
            {/* Large Wordmark Logo */}
            <img 
              src="/OPED-LOGO.png" // The full "O P E D" logo text
              alt="OPED" 
              className="w-58 h-auto opacity-100"
            />
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="pt-8 border-t border-gray-800 flex flex-col items-center">
          <p className="text-[12px] text-white   ">
            © 2026 OPED. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ReaderFooter;