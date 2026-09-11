import { useCallback, useEffect, useState } from "react";
import type { CategoryId } from "@/data/questions";

const COINS_KEY = "kanto.coins";
const UNLOCKED_KEY = "kanto.unlocked";
const DAILY_KEY = "kanto.dailyReward";

const STARTER_COINS = 5;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function useWallet() {
  const [hydrated, setHydrated] = useState(false);
  const [coins, setCoins] = useState(STARTER_COINS);
  const [unlocked, setUnlocked] = useState<CategoryId[]>(["general"]);
  const [lastDaily, setLastDaily] = useState<number>(0);

  useEffect(() => {
    setCoins(read(COINS_KEY, STARTER_COINS));
    setUnlocked(read<CategoryId[]>(UNLOCKED_KEY, ["general"]));
    setLastDaily(read<number>(DAILY_KEY, 0));
    setHydrated(true);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = Math.max(0, prev + amount);
      write(COINS_KEY, next);
      return next;
    });
  }, []);

  const unlockCategory = useCallback((id: CategoryId, cost: number) => {
    let ok = false;
    setCoins((prev) => {
      if (prev < cost) return prev;
      ok = true;
      const next = prev - cost;
      write(COINS_KEY, next);
      return next;
    });
    setUnlocked((prev) => {
      if (!ok || prev.includes(id)) return prev;
      const next = [...prev, id];
      write(UNLOCKED_KEY, next);
      return next;
    });
    return ok;
  }, []);

  const dailyAvailable =
    hydrated && Date.now() - lastDaily >= 24 * 60 * 60 * 1000;

  const claimDaily = useCallback(() => {
    const now = Date.now();
    setLastDaily(now);
    write(DAILY_KEY, now);
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
