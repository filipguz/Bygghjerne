import Link from "next/link";

const BuildingIcon = () => (
  <svg className="h-6 w-6 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function PublicNav({ active }: { active?: "om-oss" | "teknologi" }) {
  return (
    <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <BuildingIcon />
        <span className="font-bold text-white text-lg">Serv24</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/om-oss"
          className={`text-sm transition-colors ${
            active === "om-oss"
              ? "text-coral-400 font-medium"
              : "text-white/60 hover:text-white"
          }`}
        >
          Om oss
        </Link>
        <Link
          href="/teknologi"
          className={`text-sm transition-colors ${
            active === "teknologi"
              ? "text-coral-400 font-medium"
              : "text-white/60 hover:text-white"
          }`}
        >
          Teknologi
        </Link>
        <Link
          href="/login"
          className="border border-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Prøv gratis
        </Link>
      </div>
    </nav>
  );
}
