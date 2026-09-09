"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { buildStandings, qualification, QUAL_LABEL } from "@/lib/standings";
import type { Qualification } from "@/lib/types";

const STYLES: Record<Qualification, { bar: string; text: string; row: string; chip: string }> = {
  r16: {
    bar: "bg-neon-cyan shadow-[0_0_12px_var(--color-neon-cyan)]",
    text: "text-neon-cyan",
    row: "bg-neon-cyan/[0.06]",
    chip: "border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10",
  },
  playoff: {
    bar: "bg-neon-amber shadow-[0_0_12px_var(--color-neon-amber)]",
    text: "text-neon-amber",
    row: "bg-neon-amber/[0.04]",
    chip: "border-neon-amber/40 text-neon-amber bg-neon-amber/10",
  },
  out: {
    bar: "bg-neon-magenta/50",
    text: "text-white/40",
    row: "opacity-55",
    chip: "border-neon-magenta/30 text-neon-magenta/80 bg-neon-magenta/5",
  },
};

export default function StandingsTable() {
  const { state } = useStore();
  const rows = useMemo(() => buildStandings(state.fixtures), [state.fixtures]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["r16", "playoff", "out"] as Qualification[]).map((q) => (
          <span
            key={q}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase ${STYLES[q].chip}`}
          >
            {QUAL_LABEL[q]}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full border-collapse text-sm num">
          <thead>
            <tr className="text-[10px] tracking-[0.12em] text-white/45 uppercase">
              <th className="w-9 py-2.5 pr-0 pl-2 text-left font-medium">#</th>
              <th className="py-2.5 pl-0 text-left font-medium">Equipo</th>
              <th className="w-7 py-2.5 text-center font-medium">PJ</th>
              <th className="w-7 py-2.5 text-center font-medium">PG</th>
              <th className="hidden w-7 py-2.5 text-center font-medium sm:table-cell">E</th>
              <th className="hidden w-7 py-2.5 text-center font-medium sm:table-cell">P</th>
              <th className="w-8 py-2.5 text-center font-medium">GF</th>
              <th className="hidden w-8 py-2.5 text-center font-medium sm:table-cell">GC</th>
              <th className="w-8 py-2.5 text-center font-medium">DG</th>
              <th className="w-9 py-2.5 pr-2.5 text-center font-medium">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const rank = i + 1;
              const q = qualification(rank);
              const s = STYLES[q];
              const cut = rank === 8 || rank === 24;
              return (
                <tr
                  key={r.team.id}
                  className={`border-t border-white/[0.06] ${s.row} ${
                    cut ? "border-b-2 border-b-white/20" : ""
                  }`}
                >
                  <td className="w-9 py-2 pr-0 pl-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-6 w-[3px] rounded-full ${s.bar}`} />
                      <span className={`w-4 text-right text-xs ${s.text}`}>{rank}</span>
                    </div>
                  </td>
                  <td className="max-w-0 py-2 pl-1.5">
                    <span className="block truncate text-[13px] font-medium text-white/90">
                      {r.team.name}
                    </span>
                  </td>
                  <td className="py-2 text-center text-xs text-white/70">{r.played}</td>
                  <td className="py-2 text-center text-xs text-white/70">{r.won}</td>
                  <td className="hidden py-2 text-center text-xs text-white/70 sm:table-cell">{r.drawn}</td>
                  <td className="hidden py-2 text-center text-xs text-white/70 sm:table-cell">{r.lost}</td>
                  <td className="py-2 text-center text-xs text-white/70">{r.gf}</td>
                  <td className="hidden py-2 text-center text-xs text-white/70 sm:table-cell">{r.ga}</td>
                  <td className="py-2 text-center text-xs text-white/70">
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="py-2 pr-2.5 text-center text-sm font-semibold text-white">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
