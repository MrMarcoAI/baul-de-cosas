"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TEAMS, TEAMS_BY_ID } from "@/lib/teams";
import type { Fixture } from "@/lib/types";

const MATCHDAYS = [1, 2, 3, 4, 5, 6, 7, 8];

function GoalInput({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
}) {
  return (
    <input
      aria-label={label}
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      value={value === null ? "" : value}
      placeholder="–"
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(null);
        const n = Math.max(0, Math.min(99, Math.floor(Number(raw))));
        onChange(Number.isNaN(n) ? null : n);
      }}
      className="h-8 w-8 rounded-md bg-navy-950 text-center font-display text-[15px] text-white num [appearance:textfield] placeholder:text-white/25 focus:ring-2 focus:ring-cyan focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function MatchRow({ f, showMatchday }: { f: Fixture; showMatchday?: boolean }) {
  const { dispatch } = useStore();
  const home = TEAMS_BY_ID[f.homeId];
  const away = TEAMS_BY_ID[f.awayId];
  const played = f.homeGoals !== null && f.awayGoals !== null;
  const homeWin = played && f.homeGoals! > f.awayGoals!;
  const awayWin = played && f.awayGoals! > f.homeGoals!;

  const set = (side: "home" | "away", v: number | null) =>
    dispatch({
      type: "setResult",
      id: f.id,
      homeGoals: side === "home" ? v : f.homeGoals,
      awayGoals: side === "away" ? v : f.awayGoals,
    });

  return (
    <div className="flex items-center gap-1.5 rule px-3 py-2">
      {showMatchday && (
        <span className="w-6 shrink-0 text-[10px] font-semibold text-white/35">J{f.matchday}</span>
      )}
      <span
        className={`min-w-0 flex-1 truncate text-right text-[13px] ${
          homeWin ? "font-bold" : played ? "font-medium text-white/60" : "font-medium"
        }`}
      >
        {home.name}
      </span>
      <GoalInput label={`Goles de ${home.name}`} value={f.homeGoals} onChange={(v) => set("home", v)} />
      <GoalInput label={`Goles de ${away.name}`} value={f.awayGoals} onChange={(v) => set("away", v)} />
      <span
        className={`min-w-0 flex-1 truncate text-[13px] ${
          awayWin ? "font-bold" : played ? "font-medium text-white/60" : "font-medium"
        }`}
      >
        {away.name}
      </span>
    </div>
  );
}

export default function FixturesPanel() {
  const { state, dispatch } = useStore();
  const [matchday, setMatchday] = useState(1);
  const [teamId, setTeamId] = useState("");

  const shown = useMemo(() => {
    if (teamId)
      return state.fixtures
        .filter((f) => f.homeId === teamId || f.awayId === teamId)
        .sort((a, b) => a.matchday - b.matchday);
    return state.fixtures.filter((f) => f.matchday === matchday);
  }, [state.fixtures, matchday, teamId]);

  const loaded = shown.filter((f) => f.homeGoals !== null && f.awayGoals !== null).length;

  const redraw = () => {
    if (confirm("Se hace un sorteo nuevo y se borran todos los resultados y goleadores. ¿Seguro?"))
      dispatch({ type: "redraw" });
  };

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-8 gap-1.5">
        {MATCHDAYS.map((md) => {
          const active = !teamId && md === matchday;
          const done = state.fixtures.filter(
            (f) => f.matchday === md && f.homeGoals !== null && f.awayGoals !== null
          ).length;
          return (
            <button
              key={md}
              onClick={() => {
                setTeamId("");
                setMatchday(md);
              }}
              className={`rounded-full py-1.5 text-center transition-colors ${
                active ? "bg-cyan text-navy-900" : "bg-navy-800 text-white/70"
              }`}
            >
              <span className="block font-display text-[13px] leading-tight">J{md}</span>
              <span
                className={`block text-[8px] leading-tight num ${
                  active ? "text-navy-900/70" : "text-white/45"
                }`}
              >
                {done}/24
              </span>
            </button>
          );
        })}
      </div>

      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="w-full appearance-none rounded-lg bg-navy-800 px-3 py-2.5 text-[13px] font-medium text-white focus:ring-2 focus:ring-cyan focus:outline-none"
      >
        <option value="">Ver por jornada · todos los equipos</option>
        {[1, 2, 3, 4].map((p) => (
          <optgroup key={p} label={`Bombo ${p}`}>
            {TEAMS.filter((t) => t.pot === p).map((t) => (
              <option key={t.id} value={t.id}>
                Calendario de {t.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div>
        <div className="flex items-end justify-between">
          <h2 className="headline text-[26px]">
            {teamId ? TEAMS_BY_ID[teamId].name : `Jornada ${matchday}`}
          </h2>
          <span className="pb-1 text-[11px] font-semibold text-pink num">
            {loaded}/{shown.length}
          </span>
        </div>
        <div className="mt-2 overflow-hidden card">
          {shown.map((f) => (
            <MatchRow key={f.id} f={f} showMatchday={!!teamId} />
          ))}
        </div>
      </div>

      <button
        onClick={redraw}
        className="w-full rounded-lg py-2 text-[11px] font-semibold tracking-wide text-white/40 uppercase active:text-pink"
      >
        Rehacer sorteo
      </button>
    </section>
  );
}
