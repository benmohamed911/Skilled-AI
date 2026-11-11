import Link from "next/link";

export function Logo({ dark, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className={"logo" + (dark ? " dark" : "")}>
      <span className="logo-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7a1a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      </span>
      Skilld AI
    </Link>
  );
}

export function Check({ color = "#202afa" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
  );
}

export function Spark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#202afa" strokeWidth="2" strokeLinejoin="round" style={{ flex: "none" }}><path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8L10 3z" /><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z" /></svg>
  );
}

export function Bar({ pct, low }: { pct: number; low?: boolean }) {
  return (
    <div className="bar"><i className={low ? "low" : ""} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>
  );
}

export function Ring({ pct, label, size = 132 }: { pct: number; label: string; size?: number }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e7ebf3" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#202afa" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 60 60)" />
      </svg>
      <b><span>{pct}%<small>{label}</small></span></b>
    </div>
  );
}

export function Disclaimer() {
  return (
    <>
      Skilld AI is an independent study tool. It is not affiliated with, endorsed by or sponsored by Microsoft.
      Microsoft and Power BI are trademarks of the Microsoft group of companies. All practice questions are
      original and are not taken from any real exam.
    </>
  );
}
