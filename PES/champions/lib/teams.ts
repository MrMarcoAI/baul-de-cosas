import type { Team, Pot } from "./types";

/** [nombre, pais] por bombo, segun coeficiente UEFA. */
const POTS: Record<Pot, [string, string][]> = {
  1: [
    ["Bayern", "GER"], ["Arsenal", "ENG"], ["Real Madrid", "ESP"], ["PSG", "FRA"],
    ["Inter", "ITA"], ["Man City", "ENG"], ["Barcelona", "ESP"], ["Liverpool", "ENG"],
    ["Leverkusen", "GER"], ["Dortmund", "GER"], ["Atletico", "ESP"], ["Aston Villa", "ENG"],
  ],
  2: [
    ["Tottenham", "ENG"], ["Fiorentina", "ITA"], ["Roma", "ITA"], ["Chelsea", "ENG"],
    ["Porto", "POR"], ["Benfica", "POR"], ["Brugge", "BEL"], ["Sporting", "POR"],
    ["Atalanta", "ITA"], ["Betis", "ESP"], ["PSV", "NED"], ["Milan", "ITA"],
  ],
  3: [
    ["Man United", "ENG"], ["Frankfurt", "GER"], ["Olympiakos", "GRE"], ["Napoli", "ITA"],
    ["Fenerbahce", "TUR"], ["Juventus", "ITA"], ["Lille", "FRA"], ["Real Sociedad", "ESP"],
    ["Feyenoord", "NED"], ["Lyon", "FRA"], ["Leipzig", "GER"], ["Besiktas", "TUR"],
  ],
  4: [
    ["Athletic", "ESP"], ["Galatasaray", "TUR"], ["Marseille", "FRA"], ["Celtic", "SCO"],
    ["Ajax", "NED"], ["Villarreal", "ESP"], ["Newcastle", "ENG"], ["Sevilla", "ESP"],
    ["Lens", "FRA"], ["Como", "ITA"], ["Spartak", "RUS"], ["Zenit", "RUS"],
  ],
};

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const TEAMS: Team[] = ([1, 2, 3, 4] as Pot[]).flatMap((pot) =>
  POTS[pot].map(([name, country]) => ({ id: slug(name), name, country, pot }))
);

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t])
);

export const teamName = (id: string) => TEAMS_BY_ID[id]?.name ?? id;

export const COUNTRY_NAMES: Record<string, string> = {
  ENG: "Inglaterra", ESP: "España", ITA: "Italia", GER: "Alemania", FRA: "Francia",
  POR: "Portugal", NED: "Países Bajos", TUR: "Turquía", RUS: "Rusia",
  BEL: "Bélgica", GRE: "Grecia", SCO: "Escocia",
};
