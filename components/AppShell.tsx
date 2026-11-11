"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./ui";
import { freeTestsLeft, loadSession, supabase, type Session } from "@/lib/store";
import { FREE_TESTS_PER_MONTH } from "@/lib/exam";

export type { Session };

/** Loads the signed-in user's data. Sends visitors who are not signed in to the login page. */
export function useSession(): Session | null {
  const router = useRouter();
  const [s, setS] = useState<Session | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    loadSession()
      .then((x) => { if (!live) return; x ? setS(x) : router.replace("/login"); })
      .catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [router]);
  if (failed) throw new Error("We could not load your data. Check your connection and refresh the page.");
  return s;
}

const I = ({ d }: { d: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

export default function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const left = freeTestsLeft(session.attempts);
  const items = [
    { href: "/dashboard", label: "Overview", d: "M4 11l8-7 8 7v9h-5v-6H9v6H4z" },
    { href: "/exam", label: "Exam simulations", d: "M9 4h6v3H9zM6 5.5H5v15h14v-15h-1M9 13l2 2 4-4" },
    { href: "/upgrade", label: "Plan & billing", d: "M3 6.5h18v11H3zM3 10.5h18" },
  ];
  return (
    <div className="shell">
      <aside className="side">
        <Logo href="/dashboard" />
        <nav>
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={path.startsWith(it.href) ? "on" : ""}><I d={it.d} />{it.label}</Link>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}><I d="M10 5H5v14h5M15 8l4 4-4 4M19 12H9" />Sign out</button>
        </nav>
        <div className="side-plan">
          {session.plan === "pro" ? (
            <><b>Pro plan</b>Unlimited tests, full simulations and AI study plans.</>
          ) : (
            <>
              <b>Free plan</b>
              {left} of {FREE_TESTS_PER_MONTH} practice tests left this month.
              <Link href="/upgrade" className="btn btn-orange btn-block btn-sm">Upgrade to Pro</Link>
            </>
          )}
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
