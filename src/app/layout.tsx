import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Path must match your sidebar: public -> fonts -> OPED-FONTS-OTF -> 61238.otf
const cofoRaffine = localFont({
  src: "../../public/fonts/OPED-FONTS-OTF/61238.otf", 
  variable: "--font-cofo",
  display: "swap",
});

// Path for Tenez font (from your image_3e0580.png)
const tenez = localFont({
  src: "../../public/fonts/Tenez-Font-for-Blog-posts/35997.ttf",
  variable: "--font-tenez",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Fixed Font Paths",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cofoRaffine.variable} ${tenez.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}