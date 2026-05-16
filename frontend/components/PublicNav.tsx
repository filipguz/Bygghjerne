"use client";

import { useState } from "react";
import Link from "next/link";

const BuildingIcon = () => (
  <svg className="h-6 w-6 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const navLinks = [
  { href: "/om-oss",    label: "Om oss",    key: "om-oss" as const },
  { href: "/teknologi", label: "Teknologi", key: "teknologi" as const },
];

export default function PublicNav({ active }: { active?: "om-oss" | "teknologi" }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="px-6 py-5 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BuildingIcon />
          <span className="font-bold text-white text-lg">Bygghjerne</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              className={`text-sm transition-colors ${
                active === key ? "text-coral-400 font-medium" : "text-white/60 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="border border-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Prøv gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={open ? "Lukk meny" : "Åpne meny"}
        >
          <span
            className={`block h-0.5 w-5 bg-white transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-all duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-1 border-t border-white/10 pt-4">
          {navLinks.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active === key
                  ? "text-coral-400 font-medium bg-white/5"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 text-center border border-white/25 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Prøv gratis
          </Link>
        </div>
      )}
    </nav>
  );
}
