"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PenTool,
  Mic2,
  Bookmark,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// Updated items to match the "Writer" context and the image provided
const navItems = [
  { name: "Home", href: "/writer", icon: Home },
  { name: "Write", href: "/writer/write", icon: PenTool },
  { name: "Podcast", href: "/writer/podcast", icon: Mic2 },
  { name: "Save & Draft", href: "/writer/drafts", icon: Bookmark },
  { name: "Profile & Settings", href: "/writer/settings", icon: UserCog },
];

const WriterSidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-20 left-0 h-[calc(100vh-5rem)] bg-white text-black z-40 
      transition-all duration-300 ease-in-out border-r border-gray-100 overflow-x-hidden
      ${isOpen ? "w-72" : "w-20"}`}
    >
      <div className="flex flex-col h-full overflow-y-auto no-scrollbar py-6">
        
        {/* Navigation Items */}
        <nav className="flex-grow px-4 space-y-4">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center h-14 rounded-xl transition-all relative group ${
                  isActive ? "text-black" : "text-gray-600 hover:bg-gray-50"
                } ${!isOpen ? "justify-center" : "px-4"}`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(52, 62, 135, 0.2) 12.02%, rgba(52, 72, 214, 0.2) 50%, rgba(52, 62, 135, 0.2) 88.46%)",
                      }
                    : {}
                }
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? "text-black" : "text-gray-500"}`} />
                
                <span
                  className={`ml-4 font-serif font-medium text-lg whitespace-nowrap transition-all duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 w-0 invisible absolute"
                  }`}
                >
                  {name}
                </span>

                {/* Tooltip for closed state */}
                {!isOpen && (
                  <div className="absolute left-16 bg-black text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    {name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Separator Line from Image */}
        <div className="px-6 my-4">
            <div className="h-[1px] bg-gray-100 w-full"></div>
        </div>

        {/* Logout Button Footer */}
        <div className="px-4 pb-10">
          <button 
            className={`flex items-center h-14 w-full text-[#FF4D4D] rounded-xl transition-all group relative ${
                !isOpen ? "justify-center" : "px-4"
            }`}
            style={{
                backgroundColor: "rgba(255, 235, 235, 0.8)"
            }}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-4 text-lg font-serif font-bold transition-all duration-300 ${
              isOpen ? "opacity-100 visible" : "opacity-0 w-0 invisible absolute"
            }`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default WriterSidebar;