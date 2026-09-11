import { useCallback, useEffect, useState } from "react";
import type { CategoryId, Difficulty, Question } from "@/data/questions";

const COINS_KEY = "kanto.coins";
const UNLOCKED_KEY = "kanto.unlocked";
const DAILY_KEY = "kanto.dailyReward";
const SESSION_KEY = "kanto.activeSession";
const ROSTER_KEY = "kanto.savedRoster";
const SETTINGS_KEY = "kanto.gameSettings";

const STARTER_COINS = 5;

export interface GameSession {
  phase: "arena" | "results";
  players: string[];
  deck: Question[];
  index: number;
  scores: Record<string, number>;
  selectedCategories: CategoryId[];
  selectedDifficulty?: Difficulty;
  selectedDifficulties: Difficulty[];
  roundLimit: number;
  currentTurnIndex?: number;
  activeTurnIndex?: number;
  questionStarterIndex?: number;
  questionAttempts?: number;
}

export interface StoredGameSettings {
  roundLimit: number;
  selectedDifficulty?: Difficulty;
  selectedDifficulties: Difficulty[];
  selectedCategories: CategoryId[];
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function saveActiveSession(session: GameSession) {
  writeStorage(SESSION_KEY, session);
}

export function loadActiveSession(): GameSession | null {
  return readStorage<GameSession | null>(SESSION_KEY, null);
}

export function clearActiveSession() {
  removeStorage(SESSION_KEY);
}

export function savePlayerRoster(roster: string[]) {
  writeStorage(ROSTER_KEY, roster);
}

export function loadPlayerRoster(): string[] {
  return readStorage<string[]>(ROSTER_KEY, []);
}

export function saveStoredSettings(settings: StoredGameSettings) {
  writeStorage(SETTINGS_KEY, settings);
}

interface RawSettings {
  roundLimit?: number;
  selectedDifficulty?: Difficulty;
  selectedDifficulties?: Difficulty[];
  selectedCategories?: CategoryId[];
}

export function loadStoredSettings(): StoredGameSettings {
  const raw = readStorage<RawSettings | null>(SETTINGS_KEY, null);
  if (raw) {
    let diffs: Difficulty[] = ["سهل"];
    if (Array.isArray(raw.selectedDifficulties) && raw.selectedDifficulties.length > 0) {
      diffs = raw.selectedDifficulties;
    } else if (raw.selectedDifficulty) {
      diffs = [raw.selectedDifficulty];
    }
    return {
      roundLimit: typeof raw.roundLimit === "number" ? raw.roundLimit : 10,
      selectedDifficulty: diffs[0] ?? "سهل",
      selectedDifficulties: diffs,
      selectedCategories: Array.isArray(raw.selectedCategories)
        ? raw.selectedCategories
        : ["general"],
    };
  }
  return {
    roundLimit: 10,
    selectedDifficulty: "سهل",
    selectedDifficulties: ["سهل"],
    selectedCategories: ["general"],
  };
}

export function useWallet() {
  const [hydrated, setHydrated] = useState(false);
  const [coins, setCoins] = useState(STARTER_COINS);
  const [unlocked, setUnlocked] = useState<CategoryId[]>(["general"]);
  const [lastDaily, setLastDaily] = useState<number>(0);

  useEffect(() => {
    setCoins(readStorage(COINS_KEY, STARTER_COINS));
    setUnlocked(readStorage<CategoryId[]>(UNLOCKED_KEY, ["general"]));
    setLastDaily(readStorage<number>(DAILY_KEY, 0));
    setHydrated(true);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = Math.max(0, prev + amount);
      writeStorage(COINS_KEY, next);
      return next;
    });
  }, []);

  const unlockCategory = useCallback((id: CategoryId, cost: number) => {
    let ok = false;
    setCoins((prev) => {
      if (prev < cost) return prev;
      ok = true;
      const next = prev - cost;
      writeStorage(COINS_KEY, next);
      return next;
    });
    setUnlocked((prev) => {
      if (!ok || prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStorage(UNLOCKED_KEY, next);
      return next;
    });
    return ok;
  }, []);

  const dailyAvailable = hydrated && Date.now() - lastDaily >= 24 * 60 * 60 * 1000;

  const claimDaily = useCallback(() => {
    const now = Date.now();
    setLastDaily(now);
    writeStorage(DAILY_KEY, now);
    addCoins(5);
  }, [addCoins]);

  const nextDailyIn = Math.max(0, lastDaily + 24 * 60 * 60 * 1000 - Date.now());

  return {
    hydrated,
    coins,
    unlocked,
    addCoins,
    unlockCategory,
    dailyAvailable,
    claimDaily,
    nextDailyIn,
  };
}
