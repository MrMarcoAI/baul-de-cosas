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
    () =>
      [...state.scorers].sort(
        (a, b) => b.goals - a.goals || a.name.localeCompare(b.name)
      ),
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
    <section className="space-y-4">
      <form onSubmit={submit} className="space-y-3 rounded-2xl p-4 glass">
        <h2 className="font-display text-lg font-bold">Sumar goles</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jugador"
          className="w-full rounded-xl border border-white/12 bg-night-900/80 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-neon-cyan/60 focus:outline-none"
        />
        <div className="grid grid-cols-[1fr_4.5rem] gap-3">
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/12 bg-night-900/80 px-3 py-2.5 text-white focus:border-neon-cyan/60 focus:outline-none"
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
            className="w-full rounded-xl border border-white/12 bg-night-900/80 px-3 py-2.5 text-center font-semibold text-white num focus:border-neon-cyan/60 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-neon-magenta">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-neon-cyan px-4 py-3 font-display font-bold tracking-wide text-night-950 uppercase active:scale-[0.98] glow-cyan"
        >
          Sumar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl glass">
        <h2 className="px-4 py-3 font-display text-lg font-bold">Tabla de goleadores</h2>
        {ranked.length === 0 && (
          <p className="px-4 pb-8 text-center text-sm text-white/40">
            Todavía no cargaste goleadores.
          </p>
        )}
        {ranked.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 border-t border-white/[0.06] px-3 py-2.5"
          >
            <span
              className={`w-6 text-right text-sm num ${
                i === 0 ? "font-bold text-neon-cyan" : "text-white/45"
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white/90">{s.name}</p>
              <p className="truncate text-[11px] text-white/40">{teamName(s.teamId)}</p>
            </div>
            <span className="text-lg font-bold num">{s.goals}</span>
            <button
              onClick={() => dispatch({ type: "removeScorer", id: s.id })}
              aria-label={`Borrar a ${s.name}`}
              className="px-1 text-white/25 active:text-neon-magenta"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
