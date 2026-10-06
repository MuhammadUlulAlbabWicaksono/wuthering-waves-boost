"use client";

import { Search, Loader2, PackageCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LacakPesananPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate network request
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center pt-32 pb-16 px-6 lg:px-8 selection:bg-emerald-500/30">
      <div className="w-full max-w-2xl mx-auto text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Lacak Progres Anda.
        </h1>
        <p className="text-slate-400 text-lg">
          Masukkan ID Pesanan (Order ID) atau UID Game Anda untuk melihat status pengerjaan secara real-time.
        </p>

        <form onSubmit={handleSearch} className="relative mt-8 max-w-xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Contoh: WB-84920 atau 123456789"
              className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-4 bg-white text-slate-950 font-semibold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Lacak"}
          </button>
        </form>
      </div>

      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Order #WB-84920</h2>
              <p className="text-slate-400 text-sm mt-1">Dipesan pada 2 Okt 2026</p>
            </div>
            
            {/* Status Badge: PROCESSING */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-400 text-sm font-semibold tracking-wide">PROCESSING</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <PackageCheck className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-200 font-medium">Quest: Chapter I Act VII</span>
              </div>
              <span className="text-white font-bold">Rp 36.000</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progres Pengerjaan</span>
                <span className="text-cyan-400 font-medium">65%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
