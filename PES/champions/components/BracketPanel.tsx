"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { buildStandings } from "@/lib/standings";
import { teamName } from "@/lib/teams";
import {
  champion,
  hasTeam,
  resolveBracket,
  ROUND_NAMES,
  TIES,
  type ResolvedTie,
  type Round,
  type Side,
} from "@/lib/bracket";
import TieModal from "./TieModal";

const ROUND_WIDTH: Record<Round, string> = {
  po: "w-full",
  r16: "w-full",
  qf: "w-[92%]",
  sf: "w-[84%]",
  f: "w-[76%]",
};

function SlotLine({
  slot,
  score,
  winner,
  decided,
  seed,
}: {
  slot: Side;
  score: number | null;
  winner: boolean;
  decided: boolean;
  seed?: boolean;
}) {
  if (!hasTeam(slot))
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-[12px] text-white/35">
          {slot.pending}
        </span>
      </div>
    );
  return (
    <div className="flex min-w-0 items-center gap-2 py-0.5">
      <span
        className={`w-4 shrink-0 text-right text-[10px] font-semibold num ${
          slot.rank === undefined ? "text-transparent" : seed ? "text-cyan" : "text-pink-soft"
        }`}
      >
        {slot.rank ?? "0"}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-left text-[13px] ${
          decided && !winner ? "font-medium text-white/40" : "font-bold"
        }`}
      >
        {teamName(slot.teamId)}
      </span>
      {score !== null && (
        <span
          className={`shrink-0 font-display text-[17px] leading-none num ${
            winner ? "text-cyan" : "text-white/40"
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
  const decided = !!tie.winner;

  return (
    <button
      onClick={playable ? onOpen : undefined}
      disabled={!playable}
      className={`w-full card px-3 py-2.5 text-left transition-opacity ${
        playable ? "active:opacity-70" : "opacity-55"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-[0.14em] text-white/40 uppercase">
          {tie.def.label}
          {tie.def.legs === 2 ? " · ida y vuelta" : " · partido único"}
        </span>
        {playable && (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <SlotLine
        slot={tie.a}
        score={tie.aggA}
        winner={aWin}
        decided={decided}
        seed={tie.def.round === "r16"}
      />
      <SlotLine slot={tie.b} score={tie.aggB} winner={bWin} decided={decided} />
    </button>
  );
}

const Connector = () => (
  <div className="flex justify-center py-1">
    <div className="h-4 w-px bg-white/20" />
  </div>
);

export default function BracketPanel() {
  const { state } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => buildStandings(state.fixtures), [state.fixtures]);
  const ties = useMemo(() => resolveBracket(rows, state.ko), [rows, state.ko]);

  const played = state.fixtures.filter((f) => f.homeGoals !== null && f.awayGoals !== null).length;
  const champ = champion(ties);
  const staleCount = [...ties.values()].filter((t) => t.stale).length;

  const rounds: Round[] = ["po", "r16", "qf", "sf", "f"];
  const open = openId ? ties.get(openId) : null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="headline text-[28px]">Camino a la final</h2>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
          {played === state.fixtures.length
            ? "Fase de liga cerrada"
            : `Según la tabla · ${played}/${state.fixtures.length} de liga`}
        </p>
      </div>

      {staleCount > 0 && (
        <p className="rounded-lg bg-pink/15 px-3 py-2 text-[11px] text-pink-soft">
          {staleCount === 1 ? "Un cruce cambió" : `${staleCount} cruces cambiaron`} de equipos al
          moverse la tabla. Sus resultados quedaron sin efecto: volvé a cargarlos.
        </p>
      )}

      {rounds.map((round, i) => (
        <div key={round}>
          {i > 0 && <Connector />}
          <h3 className="mb-2 headline text-[15px] text-pink">{ROUND_NAMES[round]}</h3>
          <div className={`mx-auto space-y-2 ${ROUND_WIDTH[round]}`}>
            {TIES.filter((d) => d.round === round).map((d) => (
              <Tie key={d.id} tie={ties.get(d.id)!} onOpen={() => setOpenId(d.id)} />
            ))}
          </div>
        </div>
      ))}

      <Connector />

      <div className="overflow-hidden rounded-xl bg-navy-800 px-5 py-7 text-center">
        <Image
          src="/ucl-ball.png"
          alt=""
          width={108}
          height={98}
          className="mx-auto h-14 w-auto rounded-xl"
        />
        <p className="mt-4 headline text-[30px] text-white">Campeón</p>
        <p
          className={`headline text-pink ${champ ? "text-[42px]" : "text-[26px] opacity-60"}`}
        >
          {champ ? teamName(champ) : "Por definir"}
        </p>
      </div>

      <p className="pt-1 pb-2 text-center text-[11px] text-white/40">
        Tocá un cruce para cargar los partidos. El ganador avanza solo.
      </p>

      {open && <TieModal tie={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
