"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { signIn, useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  Search,
  Map,
  Calendar,
  BookOpen,
  Hammer,
  Trophy,
  FileText,
  LogIn,
  LogOut
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const brandTextClass =
    "text-xl font-bold tracking-tight text-slate-100 hidden sm:block whitespace-nowrap";

  let logoTarget = "/"; 
  if (pathname === "/dashboard/planner") {
    logoTarget = "/dashboard";
  } else if (pathname === "/dashboard") {
    logoTarget = "/";
  }

  return (
    <>
      {/* ─── TASKBAR UTAMA (TOP NAVBAR) ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/50 text-white h-16 flex items-center px-4 md:px-8 justify-between">
        {/* Kiri: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>
          <Link href={logoTarget} className="flex items-center gap-x-3 z-50">
            <Image
              src="/apiao-boost-logo.svg"
              alt="Apiao Boost Logo"
              width={36}
              height={36}
              className="object-contain shrink-0 size-9"
              priority
            />
            {isLandingPage ? (
              <motion.div
                className={brandTextClass}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                Apiao Boost
              </motion.div>
            ) : (
              <span className={brandTextClass}>Apiao Boost</span>
            )}
          </Link>
        </div>

        {/* Tengah: Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari Jasa Joki..." 
              className="w-full bg-transparent border border-[#1a3a5f] rounded-full pl-10 pr-4 py-1.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Kanan: Tombol Aksi */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Icon */}
          <button className="md:hidden p-1 text-white hover:text-blue-300 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          
          <Link 
            href="/lacak-pesanan"
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-blue-300 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Lacak Pesanan</span>
          </Link>

          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-3 bg-[#1a3a5f] rounded-full pl-1 pr-1.5 py-1 border border-[#2a4a6f]">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="h-7 w-7 rounded-full border border-blue-400" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white border border-blue-400">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-semibold text-white pr-2">{session.user.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => signOut()}
                className="p-1.5 rounded-full hover:bg-red-500/20 text-zinc-300 hover:text-red-400 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-yellow-400 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Masuk</span>
            </button>
          )}
        </div>
      </nav>

      {/* ─── OVERLAY SIDEBAR ─── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* ─── SIDEBAR / DRAWER MENU (Kategori Joki) ─── */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-[#0d2745] text-white z-50 transform transition-transform duration-300 shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a3a5f]">
          <span className="font-bold text-lg text-white">Kategori Joki</span>
          <button 
            type="button" 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-6 px-4 overflow-y-auto">
          <Link href="/dashboard?tab=eksplorasi" className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-900 text-zinc-200 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <Map className="h-5 w-5" /><span>Eksplorasi Map</span>
          </Link>
          <Link href="/dashboard?tab=maintenance" className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-900 text-zinc-200 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <Calendar className="h-5 w-5" /><span>Maintenance Akun</span>
          </Link>
          <Link href="/dashboard?tab=quest" className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-900 text-zinc-200 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <BookOpen className="h-5 w-5" /><span>Penyelesaian Quest</span>
          </Link>
          <Link href="/dashboard?tab=build" className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-900 text-zinc-200 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <Hammer className="h-5 w-5" /><span>Build Karakter</span>
          </Link>
          <Link href="/dashboard?tab=endgame" className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-900 text-zinc-200 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <Trophy className="h-5 w-5" /><span>End-Game</span>
          </Link>
        </div>
      </aside>



      {/* ─── MODAL: LOGIN / SIGN UP ─── */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#0d2745] rounded-xl shadow-xl overflow-hidden flex flex-col relative">
            <button 
              onClick={() => { setIsLoginOpen(false); setShowManualForm(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Header: Placeholder for Mascot */}
            <div className="h-40 bg-gray-800 rounded-t-xl flex items-center justify-center">
              <span className="text-zinc-500 text-sm">Image Mascot Placeholder</span>
            </div>

            <div className="p-6">
              <h2 className="text-center font-bold text-white leading-snug mb-6">
                MASUK DAN NIKMATI KEMUDAHAN DALAM MELAKUKAN <span className="text-yellow-400">JOKI!</span>
              </h2>

              {!showManualForm ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => signIn('google')}
                    className="w-full bg-white hover:bg-gray-100 text-black font-semibold rounded-full py-2 flex justify-center items-center gap-2 transition-colors"
                  >
                    {/* TODO: Integrate NextAuth GoogleProvider */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                    Masuk dengan Google
                  </button>
                  <button 
                    onClick={() => setShowManualForm(true)}
                    className="w-full border border-zinc-500 hover:bg-zinc-800 text-white font-semibold rounded-full py-2 transition-colors"
                  >
                    Login dengan Email
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      placeholder="Nomor WhatsApp" 
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg transition-colors">
                    Daftar / Masuk
                  </button>
                  <button 
                    onClick={() => setShowManualForm(false)}
                    className="w-full text-zinc-400 hover:text-white text-sm text-center underline transition-colors"
                  >
                    Kembali
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
