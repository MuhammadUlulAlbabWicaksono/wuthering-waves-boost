"use client";

import { motion, Variants } from "framer-motion";
import { Compass, Database, Swords, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SceneMount } from "@/components/three/SceneMount";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { BlurText } from "@/components/motion/BlurText";
import { CountUp } from "@/components/motion/CountUp";

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <SmoothScroll>
    <>
      <div aria-hidden="true" className="scene-fallback pointer-events-none fixed inset-0 z-0" />
      <SceneMount />
      <main className="relative z-10 min-h-screen w-full overflow-hidden flex flex-col selection:bg-emerald-500/30">
      {/* Ambient Background Lights */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px]"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px]"
          animate={{
            x: [0, -60, 60, 0],
            y: [0, 60, -60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 w-full min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Typography */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SaaS Joki Platform
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
            >
              Tertinggal Meta <br className="hidden md:block" />
              Karena Tidak <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Ada Waktu?</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10"
            >
              Jangan biarkan kesibukan dunia nyata menghancurkan progres akun Anda. 
              Wuthering Boost mengambil alih grinding harian, memberikan Anda hasil instan 
              tanpa harus mengorbankan waktu berharga.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-lg transition-all duration-300 hover:bg-cyan-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                Mulai Berlangganan
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Glass Card */}
          {/* TODO: slot for future 3D Wuthering Waves character render */}
          <motion.div
            variants={itemVariants}
            aria-hidden="true"
            className="w-full max-w-md mx-auto md:max-w-none aspect-square rounded-3xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 to-transparent"
          />
        </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="efisiensi" className="relative z-10 w-full py-32 px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-10%" }}
          className="max-w-4xl mx-auto text-center"
        >
          <BlurText
            className="text-3xl md:text-5xl font-sans font-extrabold tracking-tight text-white mb-6"
            parts={[{ text: "Efisiensi adalah keunggulan kompetitif Anda." }]}
          />
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Wuthering Boost tidak dioperasikan oleh pemain kasual. Kami adalah tim dengan standar manajemen operasional berpresisi tinggi. Keamanan data, kecepatan eksekusi, dan ketepatan waktu adalah jaminan mutlak.
          </p>
        </motion.div>
      </section>

      {/* Portfolio / Bento Grid Section */}
      <section className="relative z-10 w-full pb-32 px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
            }}
            className="glass rounded-3xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
          >
            <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6 text-emerald-400">
              <Compass className="w-8 h-8" />
            </div>
            <CountUp to={100} suffix="%" className="text-4xl font-extrabold text-white mb-2" />
            <p className="text-lg font-semibold text-slate-200 mb-2">Eksplorasi Wilayah</p>
            <p className="text-sm text-slate-400">Huanglong, Mt. Firmament, hingga Rinascita bersih tanpa sisa.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
            }}
            className="glass rounded-3xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
          >
            <div className="p-4 bg-cyan-500/10 rounded-2xl mb-6 text-cyan-400">
              <Database className="w-8 h-8" />
            </div>
            <CountUp to={30} prefix="Lv. " className="text-4xl font-extrabold text-white mb-2" />
            <p className="text-lg font-semibold text-slate-200 mb-2">Max Data Bank</p>
            <p className="text-sm text-slate-400">Koleksi Echo lengkap dengan rasio drop rate tertinggi.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
            }}
            className="glass rounded-3xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
          >
            <div className="p-4 bg-purple-500/10 rounded-2xl mb-6 text-purple-400">
              <Swords className="w-8 h-8" />
            </div>
            <CountUp to={30} suffix="/30" className="text-4xl font-extrabold text-white mb-2" />
            <p className="text-lg font-semibold text-slate-200 mb-2">Tower of Adversity</p>
            <p className="text-sm text-slate-400">Penyelesaian endgame sempurna dengan tim optimal.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Glowing Orb Section */}
      <section id="cta" className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-32">
        {/* Glowing Orb Background */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]"
          />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 px-4">
          <BlurText
            className="text-5xl md:text-6xl font-sans font-extrabold tracking-tight text-white"
            parts={[{ text: "Waktu Anda Terlalu Berharga." }]}
          />
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Biarkan tim profesional kami menangani repetisi, sementara Anda menikmati puncak permainan.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all"
            >
              Mulai Transformasi Akun
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Minimalis */}
      <footer className="w-full border-t border-white/10 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 text-sm text-slate-500 gap-4">
          <p>© 2026 Apiao Boost. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </footer>
    </main>
    </>
    </SmoothScroll>
  );
}
