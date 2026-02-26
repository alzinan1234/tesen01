'use client';

import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './writer.css';
import WriterSidebar from '@/components/Writer/WriterSidebar';
import WriterNavbar from '@/components/Writer/WriterNavbar';
import WriterFooter from '@/components/Writer/WriterFooter';



const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  // Default bhabe true rakha valo jate desktop-e sidebar khola thake
  const [isOpen, setIsOpen] = useState(true);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex bg-gray-50 min-h-screen">
          {/* Sidebar component */}
          <WriterSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* Main Content Area */}
          <main
            className={`transition-all bg-white duration-300 ease-in-out flex-1 flex flex-col min-h-screen ${
              isOpen ? 'ml-64' : 'ml-20'
            }`}
          >
            {/* Navbar */}
            <WriterNavbar />

            {/* Page Content */}
            <div className="p-4 flex-1">
              {children}
            </div>
           
          </main>
        </div>
      </body>
    </html>
  );
}