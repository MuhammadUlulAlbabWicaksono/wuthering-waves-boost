import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Apiao Boost",
  description: "Bagaimana Apiao Boost mengumpulkan, menggunakan, dan melindungi data Anda.",
};

const SECTIONS = [
  {
    title: "1. Data yang Kami Kumpulkan",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "2. Penggunaan Data",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    title: "3. Penyimpanan & Keamanan",
    body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    title: "4. Berbagi dengan Pihak Ketiga",
    body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  },
  {
    title: "5. Hak Anda",
    body: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae.",
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <main className="max-w-3xl mx-auto py-24 px-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-3">Legal</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Kebijakan Privasi</h1>
      <p className="text-sm text-slate-500 mb-12">Terakhir diperbarui: 3 Oktober 2026</p>

      <div className="space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">{s.title}</h2>
            <p className="text-slate-300 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-white/10 pt-8 text-sm text-slate-400">
        Lihat juga{" "}
        <Link href="/syarat-ketentuan" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          Syarat &amp; Ketentuan
        </Link>
        .
      </div>
    </main>
  );
}
