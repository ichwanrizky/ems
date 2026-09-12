"use client";

import { temaSekarang, terapkanTema } from "@/libs/Theme";

/**
 * Sakelar tema terang/gelap — bentuk pil yang knob-nya bergeser, mengikuti gaya
 * WorkLoad (serba membulat, ikon SVG bergaris seperti ikon header bawaannya).
 *
 * Posisi knob dan ikonnya ditentukan CSS lewat `[data-theme-version]` pada
 * <body>, bukan state React: skrip pra-render sudah menetapkan tema sebenarnya
 * sebelum hydration, jadi kalau digerakkan state, knob-nya akan tampak melompat
 * dari posisi tema terang sesaat setelah halaman hidup.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const ganti = () => {
    terapkanTema(temaSekarang() === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={ganti}
      aria-label="Ganti tema terang/gelap"
      title="Ganti tema terang/gelap"
    >
      <svg
        className="theme-toggle-ikon ikon-matahari"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>

      <svg
        className="theme-toggle-ikon ikon-bulan"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      <span className="theme-toggle-knob" aria-hidden="true" />
    </button>
  );
}
