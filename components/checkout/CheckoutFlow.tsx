"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, User, CreditCard, ShoppingCart, AlertTriangle, ChevronDown } from "lucide-react";

/* ─────────────────────────────────────
   TYPES
   ───────────────────────────────────── */

export interface SelectedProduct {
  name: string;
  price: number;
  category: string;
  details?: Record<string, any>;
}

interface CheckoutFlowProps {
  product: SelectedProduct;
  onClose: () => void;
}

/* ─────────────────────────────────────
   HELPERS
   ───────────────────────────────────── */

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

const PAYMENT_METHODS = ["QRIS", "E-Wallet", "Virtual Account", "Transfer Bank"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const SERVERS = ["SEA", "ASIA", "AMERICA", "EUROPE", "HK-MO-TW"] as const;

/* ─────────────────────────────────────
   CHECKOUT FLOW COMPONENT
   ───────────────────────────────────── */

export default function CheckoutFlow({ product, onClose }: CheckoutFlowProps) {
  const router = useRouter();

  /* ── Form State ── */
  const [loginMethod, setLoginMethod] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [server, setServer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  /* ── Confirm Modal State ── */
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete = loginMethod && accountEmail && server && paymentMethod;

  /* ── Handle Confirm Purchase ── */
  const handleConfirmPurchase = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerInfo: { loginMethod, accountEmail, server },
        mode: product.category,
        productName: product.name,
        teams: product.details?.teams || [],
        bosses: product.details?.bosses || [],
        paymentMethod,
        totalAmount: product.price,
      };

      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.orderId) {
        setIsConfirmOpen(false);
        onClose();
        router.push(`/invoice/${data.orderId}`);
      }
    } catch (err) {
      console.error("Failed to create invoice:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [loginMethod, accountEmail, server, paymentMethod, product, router, onClose]);

  return (
    <>
      {/* ─── FULL-SCREEN OVERLAY ─── */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
        <div className="min-h-full flex items-start justify-center p-4 pt-20 pb-10">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Checkout</h2>
                <p className="text-xs text-slate-400 mt-0.5">{product.name}</p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ─── PRODUK TERPILIH ─── */}
              <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{product.category}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{product.name}</p>
                </div>
                <p className="text-lg font-bold text-blue-700">{formatRupiah(product.price)}</p>
              </div>

              {/* ─── INFORMASI AKUN ─── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2 mb-4">
                  <User className="h-4 w-4" />
                  Informasi Akun
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Metode Login</label>
                    <input
                      type="text"
                      placeholder="Kuro Games / Google / Apple"
                      value={loginMethod}
                      onChange={(e) => setLoginMethod(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Akun</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Server</label>
                    <div className="relative">
                      <select
                        value={server}
                        onChange={(e) => setServer(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <option value="">Pilih Server...</option>
                        {SERVERS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── METODE PEMBAYARAN ─── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4" />
                  Metode Pembayaran
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-semibold transition-all duration-200 ${
                        paymentMethod === method
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 ${paymentMethod === method ? "text-blue-500" : "text-slate-400"}`} />
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── TOMBOL PESAN ─── */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Total Pembayaran</p>
                    <p className="text-xl font-bold text-slate-900">{formatRupiah(product.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfirmOpen(true)}
                    disabled={!isFormComplete}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    PESAN SEKARANG
                  </button>
                </div>
                {!isFormComplete && (
                  <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Lengkapi semua informasi akun dan pilih metode pembayaran.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL KONFIRMASI ORDER ─── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                KONFIRMASI ORDER
              </h3>
              <button type="button" onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ringkasan Pesanan</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-600">Item Pembelian</span>
                    <span className="text-sm font-semibold text-slate-800">{product.name}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-600">Kategori</span>
                    <span className="text-sm font-semibold text-slate-800">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-600">Jumlah</span>
                    <span className="text-sm font-semibold text-slate-800">1</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-600">Server</span>
                    <span className="text-sm font-semibold text-slate-800">{server}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-600">Metode Pembayaran</span>
                    <span className="text-sm font-semibold text-blue-600">{paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Total Pembayaran</span>
                <span className="text-xl font-bold text-blue-700">{formatRupiah(product.price)}</span>
              </div>

              {/* T&C Warning */}
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Dengan menekan &quot;BELI SEKARANG&quot;, Anda menyetujui <span className="font-semibold underline cursor-pointer">Syarat &amp; Ketentuan</span> layanan kami. Proses joki akan dimulai setelah pembayaran berhasil dikonfirmasi. Tidak ada pengembalian dana setelah proses dimulai.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      BELI SEKARANG
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
