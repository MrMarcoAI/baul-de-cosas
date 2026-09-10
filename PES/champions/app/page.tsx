"use client";

import { useTab } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import StandingsTable from "@/components/StandingsTable";
import FixturesPanel from "@/components/FixturesPanel";
import ScorersPanel from "@/components/ScorersPanel";
import BracketPanel from "@/components/BracketPanel";

export default function Home() {
  const { tab } = useTab();
  const { hydrated } = useStore();

  if (!hydrated)
    return (
      <div className="card px-6 py-16 text-center">
        <p className="headline text-[26px] text-pink">Sorteando</p>
        <p className="mt-2 text-sm text-white/50">Armando las 8 jornadas.</p>
      </div>
    );

  if (tab === "tabla") return <StandingsTable />;
  if (tab === "partidos") return <FixturesPanel />;
  if (tab === "goleadores") return <ScorersPanel />;
  return <BracketPanel />;
}
