import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wuthering Waves Boosting Service | Joki Game Profesional",
  description:
    "Layanan joki game Wuthering Waves profesional, cepat, dan terpercaya. Boost akun, clear abyss, farming material, dan lainnya dengan harga bersahabat.",
  keywords: [
    "Wuthering Waves",
    "joki game",
    "boosting service",
    "game boost",
    "WuWa",
  ],
};

import { CartProvider } from "@/context/CartContext";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <Providers>
          <CartProvider>
            {/* Navbar */}
            <Navbar />
            <Toaster position="top-center" />

            {/* Main Content */}
            <main className="flex-1 pb-24">{children}</main>

            {/* Footer */}
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
