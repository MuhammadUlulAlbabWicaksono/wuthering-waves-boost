"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Clock, Copy, Check, CreditCard, ShoppingCart, AlertTriangle, ChevronLeft } from "lucide-react";
import Link from "next/link";

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

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***";
  const [local, domain] = email.split("@");
  if (local.length <= 4) {
    return `${local[0]}${"*".repeat(local.length - 1)}@${domain}`;
  }
  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-2);
  const masked = "*".repeat(Math.max(local.length - 4, 4));
  return `${visibleStart}${masked}${visibleEnd}@${domain}`;
}

function formatDeadline(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────────────────────
   COPY BUTTON
   ───────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback ignored */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      title="Salin"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/* ─────────────────────────────────────
   COUNTDOWN TIMER
   ───────────────────────────────────── */

function CountdownBanner({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setExpired(true);
        setRemaining("00:00:00");
        clearInterval(interval);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 ${
      expired 
        ? "bg-red-50 border border-red-200" 
        : "bg-amber-50 border border-amber-200"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${expired ? "bg-red-100" : "bg-amber-100"}`}>
          <Clock className={`h-5 w-5 ${expired ? "text-red-600" : "text-amber-600"}`} />
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${expired ? "text-red-700" : "text-amber-700"}`}>
            {expired ? "WAKTU PEMBAYARAN HABIS" : "BATAS AKHIR PEMBAYARAN"}
          </p>
          <p className={`text-sm font-medium ${expired ? "text-red-600" : "text-amber-600"}`}>
            {formatDeadline(deadline)}
          </p>
        </div>
      </div>

      <div className={`text-2xl font-mono font-bold px-4 py-1.5 rounded-lg ${
        expired
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700"
      }`}>
        {remaining || "--:--"}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   DETAIL ROW
   ───────────────────────────────────── */

function DetailRow({
  label,
  value,
  copyable = false,
  badge = false,
  badgeColor = "bg-slate-100 text-slate-600",
}: {
  label: string;
  value: string;
  copyable?: boolean;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between py-3 border-b border-slate-100 last:border-b-0 gap-4">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 text-right">
        {badge ? (
          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${badgeColor}`}>
            {value}
          </span>
        ) : (
          <span className="text-sm font-semibold text-slate-800 break-all">{value}</span>
        )}
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   INVOICE CONTENT
   ───────────────────────────────────── */

interface InvoiceData {
  orderId: string;
  createdAt: string;
  deadline: string;
  status: string;
  customerInfo: { loginMethod: string; accountEmail: string; server: string };
  mode: string;
  teams: string[][];
  bosses: string[];
  paymentMethod: string;
  totalAmount: number;
}

function InvoiceContent({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING_PAYMENT" | "Paid">("PENDING_PAYMENT");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/create-invoice?id=${encodeURIComponent(invoiceId)}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        setInvoice(data);
        // Sinkronkan status dari server
        if (data.status === "Paid") {
          setPaymentStatus("Paid");
        }
      } catch (err) {
        setError("Gagal memuat data invoice.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  /* ── Simulasi polling status pembayaran setiap 10 detik ── */
  useEffect(() => {
    if (paymentStatus === "Paid") return; // Sudah paid, stop polling

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/create-invoice?id=${encodeURIComponent(invoiceId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "Paid") {
            setPaymentStatus("Paid");
            setInvoice(data);
          }
        }
      } catch {
        /* silent fail */
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [invoiceId, paymentStatus]);

  /* ── Simulasi pembayaran berhasil (tombol dev/testing) ── */
  const simulatePayment = useCallback(() => {
    setPaymentStatus("Paid");
  }, []);

  const isPaid = paymentStatus === "Paid";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Memuat tagihan...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-slate-600">{error || "Invoice tidak ditemukan."}</p>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { customerInfo } = invoice;
  const maskedGameId = `${customerInfo.loginMethod} | ${maskEmail(customerInfo.accountEmail)} | ${customerInfo.server}`;
  const productName = `Joki End-Game: ${invoice.mode}${invoice.bosses.length > 0 ? ` (${invoice.bosses.length} Boss)` : ""}`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-24 pb-12 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        {/* Payment Success Banner */}
        {isPaid && (
          <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100">
              <Check className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Pembayaran Berhasil!</p>
              <p className="text-xs text-emerald-600">Pesanan Anda sedang diproses oleh tim booster kami.</p>
            </div>
          </div>
        )}

        {/* Time Bomb Banner — only shown when NOT paid */}
        {!isPaid && <CountdownBanner deadline={invoice.deadline} />}

        {/* ─── DETAIL PEMBAYARAN ─── */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="bg-slate-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Detail Pembayaran
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Pay Button — only shown when NOT paid */}
            {!isPaid && (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3.5 rounded-xl shadow-md shadow-amber-400/20 transition-all duration-200 text-sm"
              >
                <CreditCard className="h-5 w-5" />
                Bayar Tagihan
              </button>
            )}

            {/* Payment Method */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Metode Pembayaran</span>
              <span className="text-sm font-semibold text-blue-600">{invoice.paymentMethod}</span>
            </div>

            {/* Total Payment */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
              <span className="text-sm font-semibold text-slate-700">TOTAL PEMBAYARAN</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-700">{formatRupiah(invoice.totalAmount)}</span>
                <CopyButton text={String(invoice.totalAmount)} />
              </div>
            </div>
          </div>
        </section>

        {/* ─── DETAIL PESANAN ─── */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="bg-slate-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Detail Pesanan
            </h2>
          </div>

          <div className="p-6">
            <DetailRow label="Type" value="JOKI END-GAME" />
            <DetailRow label="No Invoice" value={invoice.orderId} copyable />
            <DetailRow label="Tgl Pemesanan" value={formatDate(invoice.createdAt)} />
            <DetailRow
              label="Status Transaksi"
              value={isPaid ? "PAYMENT SUCCESS" : "PENDING PAYMENT"}
              badge
              badgeColor={isPaid ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}
            />
            <DetailRow label="Game" value="Wuthering Waves - Login" />
            <DetailRow label="Produk" value={productName} />
            <DetailRow label="ID Game" value={maskedGameId} />
          </div>
        </section>

        {/* ─── SIMULASI PEMBAYARAN (DEV ONLY) ─── */}
        {!isPaid && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 p-4 text-center">
            <p className="text-xs text-slate-500 mb-2">🛠️ Development Tool — Simulasi Pembayaran</p>
            <button
              type="button"
              onClick={simulatePayment}
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors"
            >
              Simulasikan Pembayaran Berhasil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   PAGE (Dynamic Route)
   ───────────────────────────────────── */

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InvoiceContent invoiceId={id} />;
}
