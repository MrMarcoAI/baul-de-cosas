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
      className="h-8 w-8 rounded-lg border border-white/12 bg-night-950/70 text-center text-sm font-bold text-white num [appearance:textfield] focus:border-neon-cyan/70 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
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
    <div
      className={`flex items-center gap-1.5 border-t border-white/[0.06] px-2.5 py-1.5 ${
        played ? "" : "bg-white/[0.015]"
      }`}
    >
      {showMatchday && (
        <span className="w-6 shrink-0 text-[10px] text-white/30">J{f.matchday}</span>
      )}
      <span className="flex min-w-0 flex-1 items-baseline justify-end gap-1">
        <span className="text-[9px] text-white/25">B{home.pot}</span>
        <span
          className={`truncate text-[13px] ${homeWin ? "font-semibold text-white" : "text-white/75"}`}
        >
          {home.name}
        </span>
      </span>
      <GoalInput
        label={`Goles de ${home.name}`}
        value={f.homeGoals}
        onChange={(v) => set("home", v)}
      />
      <GoalInput
        label={`Goles de ${away.name}`}
        value={f.awayGoals}
        onChange={(v) => set("away", v)}
      />
      <span className="flex min-w-0 flex-1 items-baseline gap-1">
        <span
          className={`truncate text-[13px] ${awayWin ? "font-semibold text-white" : "text-white/75"}`}
        >
          {away.name}
        </span>
        <span className="text-[9px] text-white/25">B{away.pot}</span>
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
    if (
      confirm(
        "Se hace un sorteo nuevo y se borran todos los resultados y goleadores. ¿Seguro?"
      )
    )
      dispatch({ type: "redraw" });
  };

  return (
    <section className="space-y-2.5">
      <div>
        <div className="grid grid-cols-8 gap-1">
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
                className={`rounded-lg border py-1.5 text-center transition-colors ${
                  active
                    ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/10 text-white/60"
                }`}
              >
                <span className="block font-display text-[13px] leading-tight font-bold">J{md}</span>
                <span className="block text-[8px] leading-tight opacity-70 num">{done}/24</span>
              </button>
            );
          })}
        </div>
      </div>

      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/12 bg-night-900/80 px-3 py-2 text-[13px] text-white focus:border-neon-cyan/60 focus:outline-none"
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

      <div className="overflow-hidden rounded-2xl glass">
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="font-display text-sm font-bold">
            {teamId ? TEAMS_BY_ID[teamId].name : `Jornada ${matchday}`}
          </h2>
          <span className="text-[11px] text-white/40 num">
            {loaded}/{shown.length} cargados
          </span>
        </div>
        {shown.map((f) => (
          <MatchRow key={f.id} f={f} showMatchday={!!teamId} />
        ))}
      </div>

      <button
        onClick={redraw}
        className="w-full rounded-xl border border-neon-magenta/25 px-4 py-2 text-[11px] text-neon-magenta/70 active:scale-[0.99]"
      >
        Rehacer sorteo
      </button>
    </section>
  );
}
