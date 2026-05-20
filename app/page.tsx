import Link from "next/link";
import { GRADIENT_BG } from "@/lib/theme";

const cardCls =
  "group flex flex-col rounded-2xl border border-white/25 bg-white/10 p-6 transition hover:bg-white/15 hover:border-white/60";

export default function Landing() {
  return (
    <main
      style={GRADIENT_BG}
      className="h-[100dvh] flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-2 text-center">
          Stake Service
        </h1>
        <p className="text-white/80 text-center mb-10">
          Serving together. Choose where to start.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/log" className={cardCls}>
            <span className="text-xl font-semibold">Log Service Hours</span>
            <span className="mt-1 text-white/70 text-sm">
              Record time you have already served.
            </span>
            <span className="mt-4 text-white/80 text-sm group-hover:translate-x-0.5 transition-transform">
              Get started →
            </span>
          </Link>
          <Link href="/events" className={cardCls}>
            <span className="text-xl font-semibold">Upcoming Projects</span>
            <span className="mt-1 text-white/70 text-sm">
              See what is planned and add it to your calendar.
            </span>
            <span className="mt-4 text-white/80 text-sm group-hover:translate-x-0.5 transition-transform">
              View projects →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
