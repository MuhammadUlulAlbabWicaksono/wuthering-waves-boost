"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function formatDeadline(isoString: string | Date): string {
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

export default function CountdownBanner({ deadline }: { deadline: string | Date }) {
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

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
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
        {remaining || "--:--:--"}
      </div>
    </div>
  );
}
