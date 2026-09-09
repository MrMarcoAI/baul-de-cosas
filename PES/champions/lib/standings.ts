import { TEAMS } from "./teams";
import type { Fixture, Qualification, Row } from "./types";

export function buildStandings(fixtures: Fixture[]): Row[] {
  const rows = new Map<string, Row>(
    TEAMS.map((team) => [
      team.id,
      { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
    ])
  );

  for (const m of fixtures) {
    // Solo cuentan los partidos con resultado cargado.
    if (m.homeGoals === null || m.awayGoals === null) continue;
    const home = rows.get(m.homeId);
    const away = rows.get(m.awayId);
    if (!home || !away) continue;

    home.played++; away.played++;
    home.gf += m.homeGoals; home.ga += m.awayGoals;
    away.gf += m.awayGoals; away.ga += m.homeGoals;

    if (m.homeGoals > m.awayGoals) {
      home.won++; home.points += 3; away.lost++;
    } else if (m.homeGoals < m.awayGoals) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.drawn++; away.drawn++; home.points++; away.points++;
    }
  }

  return [...rows.values()]
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.team.name.localeCompare(b.team.name)
    );
}

export function qualification(rank: number): Qualification {
  if (rank <= 8) return "r16";
  if (rank <= 24) return "playoff";
  return "out";
}

export const QUAL_LABEL: Record<Qualification, string> = {
  r16: "Octavos directo",
  playoff: "Play-offs",
  out: "Eliminado",
};
