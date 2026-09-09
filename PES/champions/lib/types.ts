export type Pot = 1 | 2 | 3 | 4;

export type Team = {
  id: string;
  name: string;
  country: string;
  pot: Pot;
};

export type Fixture = {
  id: string;
  matchday: number;
  homeId: string;
  awayId: string;
  homeGoals: number | null;
  awayGoals: number | null;
};

export type Scorer = {
  id: string;
  name: string;
  teamId: string;
  goals: number;
};

export type Row = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export type Qualification = "r16" | "playoff" | "out";

/** Resultado de una llave. Guarda con que equipos se cargo para detectar
 *  si la tabla cambio y el cruce ya no es el mismo. */
export type KoResult = {
  aId: string;
  bId: string;
  l1a: number | null;
  l1b: number | null;
  l2a: number | null;
  l2b: number | null;
  pens: "a" | "b" | null;
};

export type AppState = {
  version: number;
  seed: number;
  fixtures: Fixture[];
  scorers: Scorer[];
  ko: Record<string, KoResult>;
};
