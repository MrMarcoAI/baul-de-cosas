import type { KoResult, Row } from "./types";

export type Round = "po" | "r16" | "qf" | "sf" | "f";

type SlotRef = { rank: number } | { winnerOf: string };

export type TieDef = {
  id: string;
  round: Round;
  label: string;
  legs: 1 | 2;
  a: SlotRef;
  b: SlotRef;
};

/** Mitad de arriba 1-8-4-5, mitad de abajo 2-7-3-6: el 1º y el 2º solo se cruzan en la final. */
const R16_SEEDS = [1, 8, 4, 5, 2, 7, 3, 6];

export const ROUND_NAMES: Record<Round, string> = {
  po: "Play-offs",
  r16: "Octavos de final",
  qf: "Cuartos de final",
  sf: "Semifinales",
  f: "Final",
};

export const TIES: TieDef[] = [
  // Play-offs: 9º-24º, 10º-23º … 16º-17º
  ...Array.from({ length: 8 }, (_, k): TieDef => ({
    id: `po${k + 1}`,
    round: "po",
    label: `PO ${k + 1}`,
    legs: 2,
    a: { rank: 9 + k },
    b: { rank: 24 - k },
  })),
  // Octavos: cada cabeza de serie espera al ganador de su play-off
  ...R16_SEEDS.map((seed, i): TieDef => ({
    id: `r16-${i + 1}`,
    round: "r16",
    label: `8vos ${i + 1}`,
    legs: 2,
    a: { rank: seed },
    b: { winnerOf: `po${9 - seed}` },
  })),
  ...[1, 2, 3, 4].map((n): TieDef => ({
    id: `qf-${n}`,
    round: "qf",
    label: `4tos ${n}`,
    legs: 2,
    a: { winnerOf: `r16-${n * 2 - 1}` },
    b: { winnerOf: `r16-${n * 2}` },
  })),
  ...[1, 2].map((n): TieDef => ({
    id: `sf-${n}`,
    round: "sf",
    label: `SF ${n}`,
    legs: 2,
    a: { winnerOf: `qf-${n * 2 - 1}` },
    b: { winnerOf: `qf-${n * 2}` },
  })),
  { id: "final", round: "f", label: "Final", legs: 1, a: { winnerOf: "sf-1" }, b: { winnerOf: "sf-2" } },
];

const LABEL_OF: Record<string, string> = Object.fromEntries(TIES.map((t) => [t.id, t.label]));

export type Side = { teamId: string; rank?: number } | { pending: string };

export type ResolvedTie = {
  def: TieDef;
  a: Side;
  b: Side;
  result: KoResult | null;
  aggA: number | null;
  aggB: number | null;
  winner: string | null;
  /** El cruce quedo cargado con otros equipos: la tabla cambio. */
  stale: boolean;
};

export const hasTeam = (s: Side): s is { teamId: string; rank?: number } => "teamId" in s;

/** Suma de ambos partidos, o null si falta cargar alguno. */
function aggregate(def: TieDef, r: KoResult | null) {
  if (!r) return { aggA: null, aggB: null };
  const need = def.legs === 1 ? [r.l1a, r.l1b] : [r.l1a, r.l1b, r.l2a, r.l2b];
  if (need.some((v) => v === null)) return { aggA: null, aggB: null };
  if (def.legs === 1) return { aggA: r.l1a!, aggB: r.l1b! };
  return { aggA: r.l1a! + r.l2a!, aggB: r.l1b! + r.l2b! };
}

export function resolveBracket(
  rows: Row[],
  ko: Record<string, KoResult>
): Map<string, ResolvedTie> {
  const out = new Map<string, ResolvedTie>();

  const side = (ref: SlotRef): Side => {
    if ("rank" in ref) {
      const row = rows[ref.rank - 1];
      return row ? { teamId: row.team.id, rank: ref.rank } : { pending: `${ref.rank}º` };
    }
    const prev = out.get(ref.winnerOf);
    if (prev?.winner) return { teamId: prev.winner };
    return { pending: `Ganador ${LABEL_OF[ref.winnerOf]}` };
  };

  for (const def of TIES) {
    const a = side(def.a);
    const b = side(def.b);
    const saved = ko[def.id] ?? null;

    // Si el cruce ya no es entre los mismos equipos, el resultado no aplica.
    const stale =
      !!saved && hasTeam(a) && hasTeam(b) && (saved.aId !== a.teamId || saved.bId !== b.teamId);
    const result = saved && !stale ? saved : null;

    const { aggA, aggB } = aggregate(def, result);
    let winner: string | null = null;
    if (result && aggA !== null && aggB !== null && hasTeam(a) && hasTeam(b)) {
      if (aggA > aggB) winner = a.teamId;
      else if (aggB > aggA) winner = b.teamId;
      else if (result.pens === "a") winner = a.teamId;
      else if (result.pens === "b") winner = b.teamId;
    }

    out.set(def.id, { def, a, b, result, aggA, aggB, winner, stale });
  }

  return out;
}

export const champion = (ties: Map<string, ResolvedTie>) => ties.get("final")?.winner ?? null;
