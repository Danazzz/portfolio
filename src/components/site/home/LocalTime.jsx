import { useEffect, useMemo, useState } from "react";

/** Singkatan zona waktu Indonesia (Intl hanya memberi "GMT+8"). */
const ABBR = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };

const makeFormatter = (timeZone) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
      ...(ABBR[timeZone] ? {} : { timeZoneName: "short" }),
    });
  } catch {
    return null; // zona waktu tidak dikenal → jam disembunyikan
  }
};

/** Jam lokal yang berjalan, contoh: "14:32 WITA". Titik dua berkedip pelan. */
export function LocalTime({ timezone }) {
  const format = useMemo(() => (timezone ? makeFormatter(timezone) : null), [timezone]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!format) return;
    let id;
    const schedule = () => {
      id = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60_000 - (Date.now() % 60_000) + 50);
    };
    schedule();
    return () => clearTimeout(id);
  }, [format]);

  if (!format) return null;
  const parts = format.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  const zone = ABBR[timezone] || get("timeZoneName");

  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {get("hour")}
      <span className="animate-caret [animation-duration:2s]">:</span>
      {get("minute")} {zone}
    </time>
  );
}
