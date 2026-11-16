import { useEffect, useMemo, useState } from "react";

const COLORS = {
  kw: "text-[#e5a07a]",
  var: "text-[#fcdec0]",
  key: "text-[#f3d2b3]",
  str: "text-[#a8d5a2]",
  num: "text-[#f4b183]",
  bool: "text-[#e5a07a]",
  punc: "text-[#c8ab98]",
  comment: "text-[#8f7469] italic",
};

const str = (value) => JSON.stringify(String(value));

/** Susun objek profil menjadi potongan kode berwarna. */
function buildTokens({ variable, comment, entries }) {
  const tokens = [];
  const push = (text, type = "punc") => tokens.push({ text, type });

  push(`// ${comment}\n`, "comment");
  push("const ", "kw");
  push(variable, "var");
  push(" = {\n");
  entries.forEach(([key, value]) => {
    push("  ");
    push(key, "key");
    push(": ");
    if (Array.isArray(value)) {
      push("[\n");
      for (let i = 0; i < value.length; i += 3) {
        push("    ");
        value.slice(i, i + 3).forEach((item, j, row) => {
          push(str(item), "str");
          push(j < row.length - 1 ? ", " : ",");
        });
        push("\n");
      }
      push("  ],\n");
    } else {
      const type = typeof value === "number" ? "num" : typeof value === "boolean" ? "bool" : "str";
      push(type === "str" ? str(value) : String(value), type);
      push(",\n");
    }
  });
  push("};");
  return tokens;
}

/**
 * Kartu bergaya editor kode dengan animasi mengetik.
 * Pengunjung yang mematikan animasi di perangkatnya langsung melihat teks lengkap.
 */
export function CodeCard({ variable, comment, entries, filename = "about.js" }) {
  const tokens = useMemo(() => buildTokens({ variable, comment, entries }), [variable, comment, entries]);
  const total = tokens.reduce((n, t) => n + t.text.length, 0);
  const [shown, setShown] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? Infinity : 0,
  );

  useEffect(() => {
    if (shown >= total) return;
    const step = Math.max(2, Math.ceil(total / 90)); // ±1,5 detik
    const id = setInterval(() => setShown((n) => Math.min(total, n + step)), 16);
    return () => clearInterval(id);
  }, [shown, total]);

  let remaining = shown;
  const visible = [];
  for (const [i, token] of tokens.entries()) {
    if (remaining <= 0) break;
    const text = token.text.slice(0, remaining);
    remaining -= text.length;
    visible.push(
      <span key={i} className={COLORS[token.type]}>
        {text}
      </span>,
    );
  }

  return (
    <figure className="overflow-hidden rounded-3xl bg-[#241a17] shadow-float ring-1 ring-white/5">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="size-3 rounded-full bg-[#e5735f]" />
        <span className="size-3 rounded-full bg-[#e9b65c]" />
        <span className="size-3 rounded-full bg-[#8cc477]" />
        <span className="ml-2 font-mono text-xs text-[#c8ab98]">{filename}</span>
      </div>
      <pre
        className="whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm"
        aria-label={tokens.map((t) => t.text).join("")}
      >
        <code aria-hidden="true">
          {visible}
          <span className="animate-caret ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-[#fcdec0]" />
        </code>
      </pre>
    </figure>
  );
}
