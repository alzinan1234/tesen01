import type { Metadata } from "next";
import localFont from "next/font/local";
import "./reader.css";
import ReaderNavbar from "@/components/Reader/ReaderNavbar";
import ReaderFooter from "@/components/Reader/ReaderFooter";

// Path must match your sidebar: public -> fonts -> OPED-FONTS-OTF -> 61238.otf
const cofoRaffine = localFont({
  // Use relative path: up from src/app/(reader) -> src/app -> src -> project root -> public
  src: "../../../public/fonts/OPED-FONTS-OTF/61238.otf", 
  variable: "--font-cofo",
  display: "swap",
});

const tenez = localFont({
  src: "../../../public/fonts/Tenez-Font-for-Blog-posts/35997.ttf",
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
        <ReaderNavbar />
        {children}
        <ReaderFooter />
      </body>
    </html>
  );
}