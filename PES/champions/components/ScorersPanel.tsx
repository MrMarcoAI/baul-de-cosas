"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TEAMS, teamName } from "@/lib/teams";

export default function ScorersPanel() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [goals, setGoals] = useState("1");
  const [error, setError] = useState("");

  const ranked = useMemo(
    () => [...state.scorers].sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name)),
    [state.scorers]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(goals);
    if (!name.trim()) return setError("Falta el nombre del jugador.");
    if (!teamId) return setError("Elegí el equipo.");
    if (!Number.isInteger(n) || n === 0) return setError("Poné un número de goles.");
    dispatch({ type: "upsertScorer", name, teamId, goals: n });
    setName("");
    setGoals("1");
    setError("");
  };

  return (
    <section className="space-y-5">
      <form onSubmit={submit} className="space-y-2.5 card p-4">
        <h2 className="headline text-[22px]">Sumar goles</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jugador"
          className="w-full rounded-lg bg-navy-950 px-3 py-2.5 text-white placeholder:text-white/35 focus:ring-2 focus:ring-cyan focus:outline-none"
        />
        <div className="grid grid-cols-[1fr_4.5rem] gap-2.5">
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full appearance-none rounded-lg bg-navy-950 px-3 py-2.5 text-white focus:ring-2 focus:ring-cyan focus:outline-none"
          >
            <option value="">Equipo…</option>
            {[1, 2, 3, 4].map((p) => (
              <optgroup key={p} label={`Bombo ${p}`}>
                {TEAMS.filter((t) => t.pot === p).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="w-full rounded-lg bg-navy-950 px-3 py-2.5 text-center font-display text-lg text-white num focus:ring-2 focus:ring-cyan focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-pink-soft">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-pink py-3 font-display text-[17px] tracking-wide text-white uppercase active:bg-pink-soft"
        >
          Sumar
        </button>
      </form>

      <div>
        <h2 className="headline text-[28px]">Goleadores</h2>
        {ranked.length === 0 ? (
          <p className="mt-3 card px-4 py-8 text-center text-sm text-white/45">
            Todavía no cargaste goleadores.
          </p>
        ) : (
          <div className="mt-3 space-y-3.5">
            {ranked.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 ${i > 0 ? "rule pt-3.5" : ""}`}
              >
                <span
                  className={`w-11 shrink-0 font-display text-[34px] leading-none num ${
                    i === 0 ? "text-pink" : "text-pink/75"
                  }`}
                >
                  {s.goals}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold tracking-[0.06em] uppercase">
                    {s.name}
                  </p>
                  <p className="truncate text-[12px] text-white/55">{teamName(s.teamId)}</p>
                </div>
                <button
                  onClick={() => dispatch({ type: "removeScorer", id: s.id })}
                  aria-label={`Borrar a ${s.name}`}
                  className="shrink-0 px-1 text-lg leading-none text-white/25 active:text-pink"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
