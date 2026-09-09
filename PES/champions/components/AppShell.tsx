"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";

export const TABS = [
  { id: "tabla", label: "Tabla" },
  { id: "partidos", label: "Partidos" },
  { id: "llave", label: "Llave" },
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
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-uefa px-4 pt-[calc(env(safe-area-inset-top,0px)+0.6rem)] pb-2.5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/ucl-ball.png"
              alt=""
              width={108}
              height={98}
              priority
              className="h-9 w-auto"
            />
            <h1 className="font-display text-lg leading-none font-extrabold tracking-tight">
              Champions League
            </h1>
          </div>
        </header>

        <main className="flex-1 px-3 pt-4 pb-28">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night-950/85 backdrop-blur-xl safe-bottom">
          <div className="mx-auto grid max-w-3xl grid-cols-4">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex select-none flex-col items-center gap-1 py-2.5 transition-colors ${
                    active ? "text-neon-cyan" : "text-white/55"
                  }`}
                >
                  <TabIcon id={t.id} />
                  <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
                  <span
                    className={`h-0.5 w-6 rounded-full transition-all ${
                      active ? "bg-neon-cyan shadow-[0_0_10px_var(--color-neon-cyan)]" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </TabContext.Provider>
  );
}
