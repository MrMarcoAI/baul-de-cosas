"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";

export const TABS = [
  { id: "partidos", label: "Partidos" },
  { id: "tabla", label: "Tabla" },
  { id: "llave", label: "Playoffs" },
  { id: "goleadores", label: "Goles" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

const TabContext = createContext<{ tab: TabId; setTab: (t: TabId) => void } | null>(null);

export function useTab() {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("useTab debe usarse dentro de <AppShell>");
  return ctx;
}

function TabIcon({ id }: { id: TabId }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      {id === "tabla" && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2.5" {...p} />
          <path d="M3 9.3h18M3 14.6h18M8.7 4v16" {...p} />
        </>
      )}
      {id === "partidos" && (
        <>
          {/* pelota de futbol */}
          <circle cx="12" cy="12" r="8.6" {...p} />
          <path d="M12 7.1l3.5 2.55-1.34 4.12H9.84L8.5 9.65z" {...p} />
          <path d="M12 7.1V3.4M15.5 9.65l3.53-1.14M14.16 13.77l2.2 3.02M9.84 13.77l-2.2 3.02M8.5 9.65L4.97 8.51" {...p} />
        </>
      )}
      {id === "llave" && (
        <>
          <path d="M4 6h5v12h5M4 18h5M14 12h6" {...p} />
          <circle cx="19" cy="12" r="2" {...p} />
        </>
      )}
      {id === "goleadores" && (
        <>
          {/* botin de futbol */}
          <path
            d="M4 6.6h3.6v3.15c0 .6.36 1.15.92 1.4l7.5 3.3c1.85.8 2.98 1.9 2.98 3.1v.2H4z"
            fill="currentColor"
          />
          <path
            d="M5.2 17.9h1.7v1.75H5.2zM9.8 17.9h1.7v1.75H9.8zM14.4 17.9h1.7v1.75h-1.7z"
            fill="currentColor"
                    />
        </>
      )}
    </svg>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>("tabla");

  return (
    <TabContext.Provider value={{ tab, setTab }}>
      {/* Luces de fondo: le dan algo que refractar al vidrio */}
      {/* Fondo: cabecera azul con trazos de luz que se funde en indigo oscuro */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-ink-950">
        <div
          className="absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "linear-gradient(180deg, #1c2fd6 0%, #1222b0 30%, #0b0f78 62%, #05053a 100%)",
          }}
        />
        <svg
          className="absolute inset-x-0 top-0 h-[300px] w-full"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMin slice"
          style={{ maskImage: "linear-gradient(180deg, #000 35%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 35%, transparent 100%)" }}
        >
          <defs>
            <linearGradient id="streak" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#14e1f5" />
              <stop offset="0.5" stopColor="#ff4fd8" />
              <stop offset="1" stopColor="#ffe14d" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#streak)" strokeLinecap="round" opacity="0.7">
            <path d="M-20 70 C 80 10, 150 120, 240 40 S 380 10, 430 60" strokeWidth="2.2" />
            <path d="M-30 110 C 60 60, 170 170, 260 90 S 390 70, 440 120" strokeWidth="1.2" opacity="0.6" />
            <path d="M200 -10 C 230 60, 300 80, 420 30" strokeWidth="1.6" opacity="0.8" />
          </g>
          <g fill="none" stroke="#7ea0ff" strokeWidth="0.6" opacity="0.35">
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${250 + i * 9} -10 C ${270 + i * 9} 60, ${330 + i * 8} 110, ${420} ${70 + i * 9}`} />
            ))}
          </g>
        </svg>
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
        <header className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-1">
          <div className="flex items-center gap-2.5">
            <Image
              src="/ucl-ball-white.png"
              alt=""
              width={108}
              height={98}
              priority
              unoptimized
              className="h-8 w-auto"
            />
            <h1 className="t-h1">Champions League</h1>
          </div>
        </header>

        <main className="flex-1 px-4 pt-5 pb-32">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-full glass-clear p-1.5">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex select-none flex-col items-center gap-0.5 rounded-full py-2 transition-colors ${
                    active ? "bg-white/15 text-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]" : "text-white/85"
                  }`}
                >
                  <TabIcon id={t.id} />
                  <span className="text-[11px] font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </TabContext.Provider>
  );
}
