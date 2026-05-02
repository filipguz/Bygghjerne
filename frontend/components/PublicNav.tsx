import Link from "next/link";

const BuildingIcon = () => (
  <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function PublicNav({ active }: { active?: "om-oss" | "teknologi" }) {
  return (
    <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <BuildingIcon />
        <span className="font-bold text-brand-900 text-lg">Bygghjerne</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/om-oss"
          className={`text-sm transition-colors ${
            active === "om-oss"
              ? "text-brand-600 font-medium"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Om oss
        </Link>
        <Link
          href="/teknologi"
          className={`text-sm transition-colors ${
            active === "teknologi"
              ? "text-brand-600 font-medium"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Teknologi
        </Link>
        <Link
          href="/login"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Prøv gratis
        </Link>
      </div>
    </nav>
  );
}