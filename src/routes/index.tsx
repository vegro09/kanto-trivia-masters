import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
  CATEGORIES,
  QUESTIONS,
  type CategoryId,
  type Difficulty,
  type Question,
} from "@/data/questions";
import { useWallet } from "@/lib/game-storage";
import { SetupScreen } from "@/components/game/SetupScreen";
import { ArenaScreen } from "@/components/game/ArenaScreen";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { CoinStore } from "@/components/game/CoinStore";
import { Modal } from "@/components/game/Modal";
import { Toast } from "@/components/game/Toast";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تحدي الأسئلة — لعبة مسابقات عربية للأصدقاء" },
      {
        name: "description",
        content:
          "لعبة أسئلة عربية جماعية: أضف اللاعبين، اختر الفئات والصعوبة، واحسب النقاط مباشرة بدون تسجيل دخول.",
      },
      { property: "og:title", content: "تحدي الأسئلة — لعبة مسابقات عربية" },
      {
        property: "og:description",
        content: "أسئلة منوعة وجغرافيا وإسلاميات ورياضة وتاريخ، تعمل على جهازك مباشرة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "setup" | "arena" | "results";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function Index() {
  const wallet = useWallet();
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([
    "general",
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    Difficulty[]
  >(["سهل", "متوسط", "صعب"]);
  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [storeOpen, setStoreOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<CategoryId | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pool = useMemo(
    () =>
      QUESTIONS.filter(
        (q) =>
          selectedCategories.includes(q.category) &&
          selectedDifficulties.includes(q.difficulty),
      ),
    [selectedCategories, selectedDifficulties],
  );

  const toggleCategory = (id: CategoryId) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const toggleDifficulty = (d: Difficulty) =>
    setSelectedDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const startGame = (roster = players) => {
    setDeck(shuffle(pool));
    setIndex(0);
    setScores(Object.fromEntries(roster.map((p) => [p, 0])));
    setPhase("arena");
  };

  const handleScore = (player: string, delta: number) =>
    setScores((prev) => ({ ...prev, [player]: (prev[player] ?? 0) + delta }));

  const nextQuestion = () => {
    if (index + 1 >= deck.length) setPhase("results");
    else setIndex((i) => i + 1);
  };

  const confirmUnlock = () => {
    if (!lockTarget) return;
    const cat = CATEGORIES.find((c) => c.id === lockTarget)!;
    const ok = wallet.unlockCategory(cat.id, cat.cost);
    if (ok) {
      setSelectedCategories((prev) => [...prev, cat.id]);
      setToast(`تم فتح حزمة «${cat.name}» بنجاح`);
      setLockTarget(null);
    }
  };

  const rewardAd = useCallback(() => {
    wallet.addCoins(5);
    setToast("تمت إضافة 5 عملات إلى رصيدك بنجاح");
  }, [wallet]);

  const claimDaily = () => {
    wallet.claimDaily();
    setToast("تم استلام المكافأة اليومية: +5 عملات");
  };

  const lockedCategory = lockTarget
    ? CATEGORIES.find((c) => c.id === lockTarget)!
    : null;
  const insufficient = lockedCategory ? wallet.coins < lockedCategory.cost : false;

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => setPhase("setup")}
            className="font-display text-lg"
          >
            تحدي الأسئلة
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-border px-3 py-1.5 text-sm font-bold">
              {wallet.coins} عملة
            </span>
            <button
              onClick={() => setStoreOpen(true)}
              className="btn-base btn-solid px-3 py-1.5 text-xs"
            >
              شحن العملات
            </button>
          </div>
        </div>
      </nav>

      <main>
        {phase === "setup" ? (
          <SetupScreen
            players={players}
            addPlayer={(n) => setPlayers((p) => [...p, n])}
            removePlayer={(n) => setPlayers((p) => p.filter((x) => x !== n))}
            unlocked={wallet.unlocked}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onLockedClick={setLockTarget}
            selectedDifficulties={selectedDifficulties}
            toggleDifficulty={toggleDifficulty}
            onStart={() => startGame()}
            questionCount={pool.length}
          />
        ) : null}

        {phase === "arena" && deck[index] ? (
          <ArenaScreen
            question={deck[index]}
            index={index}
            total={deck.length}
            scores={scores}
            onScore={handleScore}
            onNext={nextQuestion}
            onEnd={() => setPhase("results")}
          />
        ) : null}

        {phase === "results" ? (
          <ResultsScreen
            scores={scores}
            onReplay={() => startGame()}
            onReconfigure={() => setPhase("setup")}
          />
        ) : null}
      </main>

      <CoinStore
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
        coins={wallet.coins}
        onReward={rewardAd}
        dailyAvailable={wallet.dailyAvailable}
        onClaimDaily={claimDaily}
        nextDailyIn={wallet.nextDailyIn}
      />

      <Modal
        open={lockedCategory !== null}
        onClose={() => setLockTarget(null)}
        title="حزمة مقفلة"
      >
        {lockedCategory ? (
          <div className="space-y-4">
            <p className="text-lg font-bold">{lockedCategory.name}</p>
            <div className="flex justify-between rounded-lg border border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">رصيدك</span>
              <span className="font-bold">{wallet.coins} عملة</span>
            </div>
            <div className="flex justify-between rounded-lg border border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">تكلفة الفتح</span>
              <span className="font-bold">{lockedCategory.cost} عملة</span>
            </div>
            {insufficient ? (
              <button
                onClick={() => {
                  setLockTarget(null);
                  setStoreOpen(true);
                }}
                className="btn-base btn-solid w-full"
              >
                شحن رصيد
              </button>
            ) : (
              <button onClick={confirmUnlock} className="btn-base btn-solid w-full">
                إلغاء قفل الحزمة
              </button>
            )}
            <button
              onClick={() => setLockTarget(null)}
              className="btn-base btn-ghost w-full"
            >
              إلغاء
            </button>
          </div>
        ) : null}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
