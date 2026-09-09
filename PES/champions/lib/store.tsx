"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { runDraw } from "./draw";
import type { AppState, KoResult, Scorer } from "./types";

const STORAGE_KEY = "champions48:state";
const VERSION = 3;

const EMPTY: AppState = { version: VERSION, seed: 0, fixtures: [], scorers: [], ko: {} };

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "setResult"; id: string; homeGoals: number | null; awayGoals: number | null }
  | { type: "redraw" }
  | { type: "setKo"; id: string; result: KoResult }
  | { type: "clearKo"; id: string }
  | { type: "upsertScorer"; name: string; teamId: string; goals: number }
  | { type: "removeScorer"; id: string }
  | { type: "reset" };

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "setResult":
      return {
        ...state,
        fixtures: state.fixtures.map((f) =>
          f.id === action.id
            ? { ...f, homeGoals: action.homeGoals, awayGoals: action.awayGoals }
            : f
        ),
      };
    case "redraw": {
      const { seed, fixtures } = runDraw();
      return { ...state, seed, fixtures, scorers: [], ko: {} };
    }
    case "setKo":
      return { ...state, ko: { ...state.ko, [action.id]: action.result } };
    case "clearKo": {
      const ko = { ...state.ko };
      delete ko[action.id];
      return { ...state, ko };
    }
    case "upsertScorer": {
      const key = action.name.trim().toLowerCase();
      const found = state.scorers.find(
        (s) => s.name.trim().toLowerCase() === key && s.teamId === action.teamId
      );
      if (found) {
        return {
          ...state,
          scorers: state.scorers.map((s) =>
            s.id === found.id ? { ...s, goals: s.goals + action.goals } : s
          ),
        };
      }
      return {
        ...state,
        scorers: [
          ...state.scorers,
          { id: uid(), name: action.name.trim(), teamId: action.teamId, goals: action.goals },
        ],
      };
    }
    case "removeScorer":
      return { ...state, scorers: state.scorers.filter((s) => s.id !== action.id) };
    case "reset": {
      const { seed, fixtures } = runDraw();
      return { version: VERSION, seed, fixtures, scorers: [], ko: {} };
    }
  }
}

function load(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== VERSION) return null;
    if (!Array.isArray(parsed.fixtures) || parsed.fixtures.length === 0) return null;
    return {
      version: VERSION,
      seed: parsed.seed ?? 0,
      fixtures: parsed.fixtures,
      scorers: Array.isArray(parsed.scorers) ? parsed.scorers : [],
      ko: parsed.ko && typeof parsed.ko === "object" ? parsed.ko : {},
    };
  } catch {
    return null;
  }
}

type Ctx = {
  state: AppState;
  dispatch: (a: Action) => void;
  hydrated: boolean;
  exportState: () => void;
  importState: (file: File) => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Lee el estado guardado una sola vez, ya en el cliente.
  // Si no hay nada guardado, corre el sorteo.
  useEffect(() => {
    const saved = load();
    if (saved) {
      dispatch({ type: "hydrate", state: saved });
    } else {
      const { seed, fixtures } = runDraw();
      dispatch({ type: "hydrate", state: { version: VERSION, seed, fixtures, scorers: [], ko: {} } });
    }
    setHydrated(true);
  }, []);

  // Guarda en cada cambio, pero nunca antes de haber leido lo guardado:
  // si no, el primer render vacio pisaria los datos existentes.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* cuota llena o modo privado: la app sigue funcionando en memoria */
    }
  }, [state, hydrated]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      hydrated,
      exportState: () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `champions48-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      importState: async (file: File) => {
        const text = await file.text();
        const parsed = JSON.parse(text) as AppState;
        if (!Array.isArray(parsed.fixtures) || parsed.fixtures.length === 0)
          throw new Error("El archivo no tiene partidos");
        dispatch({
          type: "hydrate",
          state: {
            version: VERSION,
            seed: parsed.seed ?? 0,
            fixtures: parsed.fixtures,
            scorers: parsed.scorers ?? [],
            ko: parsed.ko ?? {},
          },
        });
      },
    }),
    [state, hydrated]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}

export type { Action, Scorer };
