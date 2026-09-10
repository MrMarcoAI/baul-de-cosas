"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { buildStandings, qualification, QUAL_LABEL } from "@/lib/standings";
import type { Qualification } from "@/lib/types";

const TONE: Record<Qualification, { bar: string; rank: string; dot: string }> = {
  r16: { bar: "bg-cyan", rank: "text-cyan", dot: "bg-cyan" },
  playoff: { bar: "bg-pink", rank: "text-pink-soft", dot: "bg-pink" },
  out: { bar: "bg-white/15", rank: "text-white/35", dot: "bg-white/25" },
};

export default function StandingsTable() {
  const { state } = useStore();
  const rows = useMemo(() => buildStandings(state.fixtures), [state.fixtures]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="headline text-[28px]">Tabla general</h2>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {(["r16", "playoff", "out"] as Qualification[]).map((q) => (
            <span key={q} className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span className={`h-2 w-2 rounded-full ${TONE[q].dot}`} />
              {QUAL_LABEL[q]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] font-semibold tracking-[0.1em] text-white/45 uppercase">
              <th className="w-8 py-3 pl-3 text-left">#</th>
              <th className="py-3 pl-1 text-left">Equipo</th>
              <th className="w-7 py-3 text-center">PJ</th>
              <th className="w-7 py-3 text-center">PG</th>
              <th className="hidden w-7 py-3 text-center sm:table-cell">E</th>
              <th className="hidden w-7 py-3 text-center sm:table-cell">P</th>
              <th className="w-8 py-3 text-center">GF</th>
              <th className="hidden w-8 py-3 text-center sm:table-cell">GC</th>
              <th className="w-8 py-3 text-center">DG</th>
              <th className="w-10 py-3 pr-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const rank = i + 1;
              const t = TONE[qualification(rank)];
              const cut = rank === 8 || rank === 24;
              return (
                <tr
                  key={r.team.id}
                  className={`rule ${cut ? "border-b-2 border-b-white/35" : ""}`}
                >
                  <td className="py-2.5 pl-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-5 w-[3px] rounded-full ${t.bar}`} />
                      <span className={`w-4 text-right text-xs font-semibold num ${t.rank}`}>
                        {rank}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-0 py-2.5 pl-1.5">
                    <span className="block truncate text-[13px] font-semibold">{r.team.name}</span>
                  </td>
                  <td className="py-2.5 text-center text-xs text-white/65 num">{r.played}</td>
                  <td className="py-2.5 text-center text-xs text-white/65 num">{r.won}</td>
                  <td className="hidden py-2.5 text-center text-xs text-white/65 num sm:table-cell">{r.drawn}</td>
                  <td className="hidden py-2.5 text-center text-xs text-white/65 num sm:table-cell">{r.lost}</td>
                  <td className="py-2.5 text-center text-xs text-white/65 num">{r.gf}</td>
                  <td className="hidden py-2.5 text-center text-xs text-white/65 num sm:table-cell">{r.ga}</td>
                  <td className="py-2.5 text-center text-xs text-white/65 num">
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="py-2.5 pr-3 text-center">
                    <span className="font-display text-[19px] leading-none num">{r.points}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
