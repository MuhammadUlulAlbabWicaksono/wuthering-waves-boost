import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Check, CreditCard, ShoppingCart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import CountdownBanner from '@/components/CountdownBanner';

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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date): string {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validasi UUID untuk mencegah error Prisma query
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          quest: {
            include: { category: true }
          }
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  const isPaid = order.status === "PAID";
  
  // Kelompokkan item berdasarkan kategori (Region / Tipe)
  const questsGrouped = order.items.reduce((acc, item) => {
    const categoryName = item.quest.category?.name || item.quest.region || "Lainnya";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>);

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

        {/* Time Bomb Banner */}
        {!isPaid && order.paymentDeadline && (
          <CountdownBanner deadline={order.paymentDeadline} />
        )}

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
              order.paymentUrl ? (
                <a
                  href={order.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3.5 rounded-xl shadow-md shadow-amber-400/20 transition-all duration-200 text-sm"
                >
                  <CreditCard className="h-5 w-5" />
                  Bayar Tagihan
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed text-sm"
                >
                  <CreditCard className="h-5 w-5" />
                  Memproses Pembayaran...
                </button>
              )
            )}

            {/* Total Payment */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
              <span className="text-sm font-semibold text-slate-700">TOTAL TAGIHAN SAH</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-700">{formatRupiah(order.totalAmount)}</span>
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
            <DetailRow label="No Invoice" value={order.id} />
            <DetailRow label="Tgl Pemesanan" value={formatDate(order.createdAt)} />
            <DetailRow
              label="Status Transaksi"
              value={isPaid ? "PAYMENT SUCCESS" : "PENDING PAYMENT"}
              badge
              badgeColor={isPaid ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}
            />
            <DetailRow label="Metode Pembayaran" value={order.paymentMethod || "-"} />
            <DetailRow label="ID Game" value={`${order.loginMethod || "-"} | ${maskEmail(order.gameEmail)} | ${order.gameServer || "-"}`} />
            
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Rincian Layanan:</h3>
              <div className="space-y-6">
                {Object.entries(questsGrouped).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">{category}</h4>
                    <ul className="space-y-2">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-l-2 border-slate-200 pl-3 py-1">
                          <span className="text-slate-700">{item.quest.name}</span>
                          <span className="font-medium text-slate-900">{formatRupiah(item.priceAtTimeOfOrder)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  badge = false,
  badgeColor = "bg-slate-100 text-slate-600",
}: {
  label: string;
  value: string;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-b-0 gap-2">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <div className="text-left sm:text-right">
        {badge ? (
          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${badgeColor}`}>
            {value}
          </span>
        ) : (
          <span className="text-sm font-semibold text-slate-800 break-all">{value}</span>
        )}
      </div>
    </div>
  );
}
