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
      className="h-11 w-11 shrink-0 rounded-lg bg-navy-950 text-center font-display text-lg text-white num [appearance:textfield] placeholder:text-white/25 focus:ring-2 focus:ring-cyan focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
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
        className="absolute inset-0 bg-navy-950/85 backdrop-blur-sm"
      />
      <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-navy-900 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />

        <p className="text-[10px] font-semibold tracking-[0.16em] text-white/45 uppercase">
          {tie.def.label} · {twoLegs ? "Ida y vuelta" : "Partido único"}
        </p>
        <h2 className="mt-1 headline text-[26px]">
          {teamName(aId)} <span className="text-white/35">vs</span> {teamName(bId)}
        </h2>

        <div className="mt-4 space-y-3">
          <div className="card p-3">
            <p className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">
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
            <div className="card p-3">
              <p className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">
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
          <div className="mt-4 card px-3 py-3 text-center">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">Global</p>
            <p className="mt-1.5 font-display text-[20px] num">
              <span className={tie.winner === aId ? "text-cyan" : "text-white/50"}>
                {teamName(aId)} {tie.aggA}
              </span>
              <span className="mx-2 text-white/30">–</span>
              <span className={tie.winner === bId ? "text-cyan" : "text-white/50"}>
                {tie.aggB} {teamName(bId)}
              </span>
            </p>
          </div>
        )}

        {tied && (
          <div className="mt-3">
            <p className="mb-2 text-center text-[11px] text-white/55">
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
                    className={`truncate rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      on
                        ? "bg-cyan text-navy-900 font-bold"
                        : "bg-navy-800 text-white/75"
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
            className="rounded-lg bg-navy-800 px-4 py-3 text-xs font-semibold text-white/60"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-pink px-4 py-3 font-display text-[17px] tracking-wide text-white uppercase"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
