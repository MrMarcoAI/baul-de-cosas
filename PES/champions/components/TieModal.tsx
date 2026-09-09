"use client";

import { useStore } from "@/lib/store";
import { teamName } from "@/lib/teams";
import { hasTeam, type ResolvedTie } from "@/lib/bracket";

function Score({
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
      placeholder="–"
      value={value === null ? "" : value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(null);
        const n = Math.max(0, Math.min(99, Math.floor(Number(raw))));
        onChange(Number.isNaN(n) ? null : n);
      }}
      className="h-10 w-10 shrink-0 rounded-lg border border-white/15 bg-night-950/70 text-center text-base font-bold text-white num [appearance:textfield] focus:border-neon-cyan/70 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export default function TieModal({ tie, onClose }: { tie: ResolvedTie; onClose: () => void }) {
  const { dispatch } = useStore();
  if (!hasTeam(tie.a) || !hasTeam(tie.b)) return null;

  const aId = tie.a.teamId;
  const bId = tie.b.teamId;
  const r = tie.result;

  const set = (patch: Partial<NonNullable<typeof r>>) =>
    dispatch({
      type: "setKo",
      id: tie.def.id,
      result: {
        aId,
        bId,
        l1a: r?.l1a ?? null,
        l1b: r?.l1b ?? null,
        l2a: r?.l2a ?? null,
        l2b: r?.l2b ?? null,
        pens: r?.pens ?? null,
        ...patch,
      },
    });

  const twoLegs = tie.def.legs === 2;
  const tied = tie.aggA !== null && tie.aggA === tie.aggB;

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal>
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-night-950/80 backdrop-blur-sm"
      />
      <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl border-t border-white/15 bg-night-900 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

        <p className="text-[10px] tracking-[0.16em] text-white/40 uppercase">
          {tie.def.label} · {twoLegs ? "Ida y vuelta" : "Partido único"}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold">
          {teamName(aId)} <span className="text-white/35">vs</span> {teamName(bId)}
        </h2>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 p-3">
            <p className="mb-2 text-[10px] tracking-[0.14em] text-white/40 uppercase">
              {twoLegs ? `Ida · en casa de ${teamName(bId)}` : "Partido único"}
            </p>
            {twoLegs ? (
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-right text-sm">{teamName(bId)}</span>
                <Score
                  label={`Goles de ${teamName(bId)} en la ida`}
                  value={r?.l1b ?? null}
                  onChange={(v) => set({ l1b: v })}
                />
                <Score
                  label={`Goles de ${teamName(aId)} en la ida`}
                  value={r?.l1a ?? null}
                  onChange={(v) => set({ l1a: v })}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{teamName(aId)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-right text-sm">{teamName(aId)}</span>
                <Score
                  label={`Goles de ${teamName(aId)}`}
                  value={r?.l1a ?? null}
                  onChange={(v) => set({ l1a: v })}
                />
                <Score
                  label={`Goles de ${teamName(bId)}`}
                  value={r?.l1b ?? null}
                  onChange={(v) => set({ l1b: v })}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{teamName(bId)}</span>
              </div>
            )}
          </div>

          {twoLegs && (
            <div className="rounded-xl border border-white/10 p-3">
              <p className="mb-2 text-[10px] tracking-[0.14em] text-white/40 uppercase">
                Vuelta · en casa de {teamName(aId)}
              </p>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-right text-sm">{teamName(aId)}</span>
                <Score
                  label={`Goles de ${teamName(aId)} en la vuelta`}
                  value={r?.l2a ?? null}
                  onChange={(v) => set({ l2a: v })}
                />
                <Score
                  label={`Goles de ${teamName(bId)} en la vuelta`}
                  value={r?.l2b ?? null}
                  onChange={(v) => set({ l2b: v })}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{teamName(bId)}</span>
              </div>
            </div>
          )}
        </div>

        {tie.aggA !== null && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
            <p className="text-[10px] tracking-[0.14em] text-white/40 uppercase">Global</p>
            <p className="mt-1 text-sm num">
              <span className={tie.winner === aId ? "font-bold text-neon-cyan" : "text-white/70"}>
                {teamName(aId)} {tie.aggA}
              </span>
              <span className="mx-2 text-white/30">–</span>
              <span className={tie.winner === bId ? "font-bold text-neon-cyan" : "text-white/70"}>
                {tie.aggB} {teamName(bId)}
              </span>
            </p>
          </div>
        )}

        {tied && (
          <div className="mt-3">
            <p className="mb-2 text-center text-[11px] text-white/50">
              Empate en el global. ¿Quién pasa por penales?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["a", "b"] as const).map((side) => {
                const id = side === "a" ? aId : bId;
                const on = r?.pens === side;
                return (
                  <button
                    key={side}
                    onClick={() => set({ pens: on ? null : side })}
                    className={`truncate rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      on
                        ? "border-neon-cyan/60 bg-neon-cyan/10 font-semibold text-neon-cyan"
                        : "border-white/12 text-white/70"
                    }`}
                  >
                    {teamName(id)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
          <button
            onClick={() => dispatch({ type: "clearKo", id: tie.def.id })}
            className="rounded-xl border border-neon-magenta/30 px-4 py-3 text-xs text-neon-magenta/80"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-neon-cyan px-4 py-3 font-display font-bold tracking-wide text-night-950 uppercase glow-cyan"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
