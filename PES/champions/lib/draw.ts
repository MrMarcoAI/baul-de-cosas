import { TEAMS } from "./teams";
import type { Fixture } from "./types";

/**
 * Sorteo estilo "sistema suizo" UEFA adaptado a 48 equipos.
 *
 * Reglas del emparejamiento:
 *  - 8 rivales por equipo: 2 de cada bombo, uno de local y otro de visitante
 *  - nunca contra un equipo del mismo pais
 *
 * Se resuelve en dos fases, porque hacerlo jornada a jornada deja el torneo
 * sin salida en las ultimas fechas:
 *   Fase A - quien juega contra quien (y de que lado).
 *   Fase B - repartir esos 192 partidos en 8 jornadas de 24, con cada equipo
 *            jugando exactamente una vez por jornada.
 */

const N = TEAMS.length;
const ROUNDS = 8;

const POT = TEAMS.map((t) => t.pot - 1);
const COUNTRIES = [...new Set(TEAMS.map((t) => t.country))];
const CTRY = TEAMS.map((t) => COUNTRIES.indexOf(t.country));

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Pairing = { home: number; away: number };

/** Fase A: 192 partidos que cumplen bombos, paises y localias. */
function buildPairings(rnd: () => number): Pairing[] | null {
  const needAway = Array.from({ length: N }, () => [true, true, true, true]);
  const met = Array.from({ length: N }, () => new Array<boolean>(N).fill(false));

  // Un slot por cada (equipo local, bombo del rival): 48 x 4 = 192.
  const slots: [number, number][] = [];
  for (let t = 0; t < N; t++) for (let p = 0; p < 4; p++) slots.push([t, p]);
  shuffle(slots, rnd);

  const done = new Array<boolean>(slots.length).fill(false);
  const out: Pairing[] = [];
  let budget = 25_000;

  const candidates = (a: number, p: number) => {
    const list: number[] = [];
    for (let b = 0; b < N; b++) {
      if (
        POT[b] === p &&
        b !== a &&
        !met[a][b] &&
        needAway[b][POT[a]] &&
        CTRY[a] !== CTRY[b]
      )
        list.push(b);
    }
    return list;
  };

  function solve(left: number): boolean {
    if (left === 0) return true;
    if (budget-- <= 0) return false;

    // MRV: resolver primero el slot con menos rivales posibles.
    let best = -1;
    let bestList: number[] = [];
    for (let i = 0; i < slots.length; i++) {
      if (done[i]) continue;
      const list = candidates(slots[i][0], slots[i][1]);
      if (list.length === 0) return false;
      if (best === -1 || list.length < bestList.length) {
        best = i;
        bestList = list;
        if (list.length === 1) break;
      }
    }

    const [a, p] = slots[best];
    done[best] = true;
    for (const b of shuffle(bestList, rnd)) {
      needAway[b][POT[a]] = false;
      met[a][b] = met[b][a] = true;
      out.push({ home: a, away: b });

      if (solve(left - 1)) return true;

      out.pop();
      needAway[b][POT[a]] = true;
      met[a][b] = met[b][a] = false;
    }
    done[best] = false;
    return false;
  }

  return solve(slots.length) ? out : null;
}

/** Fase B: asigna jornada 1..8 a cada partido, una sola por equipo y fecha. */
function assignMatchdays(pairs: Pairing[], rnd: () => number): number[] | null {
  const M = pairs.length;
  const color = new Array<number>(M).fill(-1);
  const used = Array.from({ length: N }, () => new Array<boolean>(ROUNDS).fill(false));

  let budget = 40_000;

  const freeColors = (i: number) => {
    const { home, away } = pairs[i];
    const list: number[] = [];
    for (let c = 0; c < ROUNDS; c++) if (!used[home][c] && !used[away][c]) list.push(c);
    return list;
  };

  function solve(left: number): boolean {
    if (left === 0) return true;
    if (budget-- <= 0) return false;

    let best = -1;
    let bestList: number[] = [];
    for (let i = 0; i < M; i++) {
      if (color[i] !== -1) continue;
      const list = freeColors(i);
      if (list.length === 0) return false;
      if (best === -1 || list.length < bestList.length) {
        best = i;
        bestList = list;
        if (list.length === 1) break;
      }
    }

    const { home, away } = pairs[best];
    for (const c of shuffle(bestList, rnd)) {
      color[best] = c;
      used[home][c] = used[away][c] = true;
      if (solve(left - 1)) return true;
      used[home][c] = used[away][c] = false;
      color[best] = -1;
    }
    return false;
  }

  return solve(M) ? color.map((c) => c + 1) : null;
}

export function runDraw(seed = (Math.random() * 2 ** 31) | 0): {
  seed: number;
  fixtures: Fixture[];
} {
  for (let i = 0; i < 400; i++) {
    const s = (seed + i * 7919) | 0;
    const rnd = mulberry32(s);
    const pairs = buildPairings(rnd);
    if (!pairs) continue;
    const days = assignMatchdays(pairs, rnd);
    if (!days) continue;

    const fixtures: Fixture[] = pairs
      .map((p, idx) => ({
        matchday: days[idx],
        homeId: TEAMS[p.home].id,
        awayId: TEAMS[p.away].id,
      }))
      .sort((a, b) => a.matchday - b.matchday)
      .map((f, idx) => ({
        id: `j${f.matchday}-${idx}`,
        matchday: f.matchday,
        homeId: f.homeId,
        awayId: f.awayId,
        homeGoals: null,
        awayGoals: null,
      }));

    return { seed: s, fixtures };
  }
  throw new Error("No se pudo generar un sorteo valido");
}
