"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { buildStandings } from "@/lib/standings";
import { teamName } from "@/lib/teams";
import { champion, hasTeam, resolveBracket, ROUND_NAMES, TIES, type ResolvedTie, type Round, type Side } from "@/lib/bracket";
import TieModal from "./TieModal";

const ROUND_WIDTH: Record<Round, string> = {
  po: "w-full",
  r16: "w-[96%]",
  qf: "w-[86%]",
  sf: "w-[76%]",
  f: "w-[68%]",
};

function SlotLine({
  slot,
  score,
  winner,
  seed,
}: {
  slot: Side;
  score: number | null;
  winner: boolean;
  seed?: boolean;
}) {
  if (!hasTeam(slot))
    return (
      <div className="flex items-center gap-2">
        <span className="w-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-[12px] text-white/30 italic">
          {slot.pending}
        </span>
      </div>
    );
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`w-5 shrink-0 text-right text-[11px] num ${
          slot.rank === undefined
            ? "text-white/25"
            : seed
              ? "text-neon-cyan"
              : "text-neon-amber"
        }`}
      >
        {slot.rank ?? ""}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-left text-[13px] ${
          winner ? "font-semibold text-white" : "text-white/80"
        }`}
      >
        {teamName(slot.teamId)}
      </span>
      {score !== null && (
        <span
          className={`shrink-0 text-[13px] num ${
            winner ? "font-bold text-neon-cyan" : "text-white/45"
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function Tie({ tie, onOpen }: { tie: ResolvedTie; onOpen: () => void }) {
  const playable = hasTeam(tie.a) && hasTeam(tie.b);
  const aWin = !!tie.winner && hasTeam(tie.a) && tie.winner === tie.a.teamId;
  const bWin = !!tie.winner && hasTeam(tie.b) && tie.winner === tie.b.teamId;

  return (
    <button
      onClick={playable ? onOpen : undefined}
      disabled={!playable}
      className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors glass ${
        playable ? "active:border-neon-cyan/40" : "opacity-60"
      } ${tie.winner ? "border-neon-cyan/25" : ""}`}
    >
      <span className="w-9 shrink-0 text-[9px] leading-tight tracking-wider text-white/30 uppercase">
        {tie.def.label}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <SlotLine slot={tie.a} score={tie.aggA} winner={aWin} seed={tie.def.round === "r16"} />
        <SlotLine slot={tie.b} score={tie.aggB} winner={bWin} />
      </div>
      {playable && (
        <span className="shrink-0 text-white/25">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

function RoundTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="h-px flex-1 bg-white/10" />
      <h3 className="font-display text-[11px] tracking-[0.16em] text-white/55 uppercase">
        {children}
      </h3>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

const Link = () => <div className="mx-auto h-3 w-px bg-neon-cyan/30" />;

export default function BracketPanel() {
  const { state } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => buildStandings(state.fixtures), [state.fixtures]);
  const ties = useMemo(() => resolveBracket(rows, state.ko), [rows, state.ko]);

  const played = state.fixtures.filter(
    (f) => f.homeGoals !== null && f.awayGoals !== null
  ).length;
  const champ = champion(ties);
  const staleCount = [...ties.values()].filter((t) => t.stale).length;

  const rounds: Round[] = ["po", "r16", "qf", "sf", "f"];
  const open = openId ? ties.get(openId) : null;

  return (
    <section className="space-y-2.5">
      <div className="px-1">
        <h2 className="font-display text-lg leading-tight font-bold">Llave eliminatoria</h2>
        <p className="mt-0.5 text-[10px] tracking-[0.12em] text-white/40 uppercase">
          {played === state.fixtures.length
            ? "Fase de liga cerrada"
            : `Según la tabla actual · ${played}/${state.fixtures.length} de liga`}
        </p>
      </div>

      {staleCount > 0 && (
        <p className="rounded-xl border border-neon-amber/30 bg-neon-amber/[0.06] px-3 py-2 text-[11px] text-neon-amber/90">
          {staleCount === 1 ? "Un cruce cambió" : `${staleCount} cruces cambiaron`} de equipos al
          moverse la tabla. Sus resultados quedaron sin efecto: volvé a cargarlos.
        </p>
      )}

      {rounds.map((round, i) => (
        <div key={round} className="space-y-2.5">
          {i > 0 && <Link />}
          <RoundTitle>{ROUND_NAMES[round]}</RoundTitle>
          <div className={`mx-auto space-y-1.5 ${ROUND_WIDTH[round]}`}>
            {TIES.filter((d) => d.round === round).map((d) => {
              const t = ties.get(d.id)!;
              return <Tie key={d.id} tie={t} onOpen={() => setOpenId(d.id)} />;
            })}
          </div>
        </div>
      ))}

      <Link />
      <div
        className={`mx-auto w-[80%] rounded-2xl border px-5 py-6 text-center ${
          champ
            ? "border-neon-cyan/50 bg-gradient-to-b from-neon-cyan/20 to-transparent glow-cyan"
            : "border-neon-cyan/25 bg-gradient-to-b from-neon-cyan/8 to-transparent"
        }`}
      >
        <Image
          src="/ucl-ball.png"
          alt=""
          width={108}
          height={98}
          className="mx-auto h-16 w-auto rounded-2xl"
        />
        <p className="mt-3 font-display text-base font-extrabold tracking-[0.2em] text-neon-cyan uppercase">
          Campeón
        </p>
        <p
          className={`mt-1 ${
            champ ? "font-display text-xl font-bold text-white" : "text-sm text-white/40"
          }`}
        >
          {champ ? teamName(champ) : "Por definir"}
        </p>
      </div>

      <p className="px-1 pt-1 pb-2 text-center text-[11px] text-white/35">
        Tocá un cruce para cargar la ida y la vuelta. El ganador avanza solo.
      </p>

      {open && <TieModal tie={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
