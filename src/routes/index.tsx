import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  QUESTIONS,
  type CategoryId,
  type Difficulty,
  type Question,
} from "@/data/questions";
import {
  useWallet,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
  savePlayerRoster,
  loadPlayerRoster,
  saveStoredSettings,
  loadStoredSettings,
} from "@/lib/game-storage";
import { SetupScreen } from "@/components/game/SetupScreen";
import { ArenaScreen } from "@/components/game/ArenaScreen";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { CoinStore } from "@/components/game/CoinStore";
import { Modal } from "@/components/game/Modal";
import { Toast } from "@/components/game/Toast";
import { admobService } from "@/lib/admob-service";
import { buildInterleavedDeck } from "@/lib/deck-builder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اسألني — لعبة مسابقات عربية للأصدقاء" },
      {
        name: "description",
        content:
          "لعبة أسئلة عربية جماعية: أضف اللاعبين، اختر الفئات والصعوبة، واحسب النقاط مباشرة بدون تسجيل دخول أو خوادم.",
      },
      { property: "og:title", content: "اسألني — لعبة مسابقات عربية" },
      {
        property: "og:description",
        content: "أسئلة منوعة وجغرافيا وإسلاميات ورياضة وتاريخ، تعمل على جهازك مباشرة 100%.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "setup" | "arena" | "results";

function Index() {
  const wallet = useWallet();
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(["general"]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(["سهل"]);
  const [roundLimit, setRoundLimit] = useState<number>(10);
  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [questionAttempts, setQuestionAttempts] = useState(0);
  const [storeOpen, setStoreOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<CategoryId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Load initial settings and check active session
  useEffect(() => {
    const savedRoster = loadPlayerRoster();
    if (savedRoster.length > 0) {
      setPlayers(savedRoster);
    }
    const savedSettings = loadStoredSettings();
    if (savedSettings) {
      setSelectedCategories(savedSettings.selectedCategories);
      setSelectedDifficulties(savedSettings.selectedDifficulties);
      setRoundLimit(savedSettings.roundLimit);
    }
    const active = loadActiveSession();
    if (active && active.phase === "arena" && active.deck.length > 0) {
      setHasSavedSession(true);
    }
    void admobService.initialize();
  }, []);

  const pool = useMemo(() => {
    const activeCategoryNames = new Set(
      selectedCategories.map((id) => {
        const found = CATEGORIES.find((c) => c.id === id);
        return found ? found.name : id;
      }),
    );

    return QUESTIONS.filter((q) => {
      const categoryMatches =
        selectedCategories.includes(q.category as CategoryId) ||
        activeCategoryNames.has(q.category);
      let difficultyMatches = selectedDifficulties.includes(q.difficulty);

      // Safe fallback for categories without hard tier (e.g. Islamic):
      // When "صعب" is selected, fallback smoothly to serving available "متوسط" questions
      if (!difficultyMatches && selectedDifficulties.includes("صعب")) {
        const isIslamic = q.category === "إسلاميات وتاريخ إسلامي" || q.category === "islamic";
        if (isIslamic && q.difficulty === "متوسط") {
          difficultyMatches = true;
        }
      }

      return categoryMatches && difficultyMatches;
    });
  }, [selectedCategories, selectedDifficulties]);

  const toggleCategory = (id: CategoryId) =>
    setSelectedCategories((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      saveStoredSettings({
        roundLimit,
        selectedDifficulties,
        selectedCategories: next,
      });
      return next;
    });

  const handleToggleDifficulty = (d: Difficulty) => {
    setSelectedDifficulties((prev) => {
      let next: Difficulty[];
      if (prev.includes(d)) {
        // Prevent unchecking all: keep at least one active
        if (prev.length <= 1) return prev;
        next = prev.filter((x) => x !== d);
      } else {
        next = [...prev, d];
      }
      saveStoredSettings({
        roundLimit,
        selectedDifficulties: next,
        selectedCategories,
      });
      return next;
    });
  };

  const handleSetRoundLimit = (limit: number) => {
    setRoundLimit(limit);
    saveStoredSettings({
      roundLimit: limit,
      selectedDifficulties,
      selectedCategories,
    });
  };

  const handleAddPlayer = (name: string) => {
    setPlayers((prev) => {
      const next = [...prev, name];
      savePlayerRoster(next);
      return next;
    });
  };

  const handleRemovePlayer = (name: string) => {
    setPlayers((prev) => {
      const next = prev.filter((x) => x !== name);
      savePlayerRoster(next);
      return next;
    });
  };

  const handleClearPlayers = () => {
    setPlayers([]);
    savePlayerRoster([]);
  };

  const startGame = (roster = players) => {
    const selectedDeck = buildInterleavedDeck({
      pool,
      selectedCategories,
      selectedDifficulties,
      roundLimit,
    });
    const initialScores = Object.fromEntries(roster.map((p) => [p, 0]));

    setDeck(selectedDeck);
    setIndex(0);
    setScores(initialScores);
    setCurrentTurnIndex(0);
    setQuestionAttempts(0);
    setPhase("arena");
    setHasSavedSession(false);

    // Persist active game session
    saveActiveSession({
      phase: "arena",
      players: roster,
      deck: selectedDeck,
      index: 0,
      scores: initialScores,
      selectedCategories,
      selectedDifficulties,
      roundLimit,
      currentTurnIndex: 0,
      questionAttempts: 0,
    });
  };

  const resumeActiveSession = () => {
    const active = loadActiveSession();
    if (!active) return;
    setPlayers(active.players);
    setDeck(active.deck);
    setIndex(active.index);
    setScores(active.scores);
    setSelectedCategories(active.selectedCategories);
    setSelectedDifficulties(
      active.selectedDifficulties && active.selectedDifficulties.length > 0
        ? active.selectedDifficulties
        : active.selectedDifficulty
          ? [active.selectedDifficulty]
          : ["سهل"],
    );
    setRoundLimit(active.roundLimit);
    setCurrentTurnIndex(active.currentTurnIndex ?? active.activeTurnIndex ?? 0);
    setQuestionAttempts(active.questionAttempts ?? 0);
    setPhase(active.phase);
    setHasSavedSession(false);
    setToast("تم استئناف الجولة السابقة بنجاح");
  };

  const handleCorrectAnswer = () => {
    if (players.length === 0) return;
    const activePlayer = players[currentTurnIndex];
    const newScores = {
      ...scores,
      [activePlayer]: (scores[activePlayer] ?? 0) + 1,
    };
    setScores(newScores);

    // Continuous forward turn: ALWAYS move strictly to next player in line
    const nextTurn = (currentTurnIndex + 1) % players.length;

    if (index + 1 >= deck.length) {
      setPhase("results");
      clearActiveSession();
    } else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setCurrentTurnIndex(nextTurn);
      setQuestionAttempts(0);

      saveActiveSession({
        phase: "arena",
        players,
        deck,
        index: nextIndex,
        scores: newScores,
        selectedCategories,
        selectedDifficulties,
        roundLimit,
        currentTurnIndex: nextTurn,
        questionAttempts: 0,
      });
    }
  };

  const handleWrongAnswer = () => {
    if (players.length === 0) return;
    const nextAttempts = questionAttempts + 1;
    // Continuous forward turn: ALWAYS move strictly to next player in line
    const nextTurn = (currentTurnIndex + 1) % players.length;

    // If all players in the circle fail this exact question (attempts count === players.length)
    if (nextAttempts >= players.length) {
      setToast("لم يجب أحد بشكل صحيح — الانتقال للسؤال التالي");

      if (index + 1 >= deck.length) {
        setPhase("results");
        clearActiveSession();
      } else {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setCurrentTurnIndex(nextTurn);
        setQuestionAttempts(0);

        saveActiveSession({
          phase: "arena",
          players,
          deck,
          index: nextIndex,
          scores,
          selectedCategories,
          selectedDifficulties,
          roundLimit,
          currentTurnIndex: nextTurn,
          questionAttempts: 0,
        });
      }
    } else {
      // Do NOT change or deduct any points
      // Keep exact same question on screen
      // Move turn of this question to next player
      setCurrentTurnIndex(nextTurn);
      setQuestionAttempts(nextAttempts);

      saveActiveSession({
        phase: "arena",
        players,
        deck,
        index,
        scores,
        selectedCategories,
        selectedDifficulties,
        roundLimit,
        currentTurnIndex: nextTurn,
        questionAttempts: nextAttempts,
      });
    }
  };

  const handleSkipQuestion = () => {
    if (players.length === 0) return;
    const nextTurn = (currentTurnIndex + 1) % players.length;

    if (index + 1 >= deck.length) {
      setPhase("results");
      clearActiveSession();
    } else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setCurrentTurnIndex(nextTurn);
      setQuestionAttempts(0);

      saveActiveSession({
        phase: "arena",
        players,
        deck,
        index: nextIndex,
        scores,
        selectedCategories,
        selectedDifficulties,
        roundLimit,
        currentTurnIndex: nextTurn,
        questionAttempts: 0,
      });
    }
  };

  const handleEndGameEarly = () => {
    setPhase("results");
    clearActiveSession();
  };

  const confirmUnlock = () => {
    if (!lockTarget) return;
    const cat = CATEGORIES.find((c) => c.id === lockTarget)!;
    const ok = wallet.unlockCategory(cat.id, cat.cost);
    if (ok) {
      setSelectedCategories((prev) => [...prev, cat.id]);
      setToast(`تم فتح حزمة «${cat.name}» بنجاح واسترداد الأسئلة`);
      setLockTarget(null);
    }
  };

  const rewardAd = useCallback(() => {
    wallet.addCoins(5);
    setToast("تمت إضافة 5 $ إلى رصيدك بنجاح");
    void admobService.preloadRewardedAd();
  }, [wallet]);

  const claimDaily = () => {
    wallet.claimDaily();
    setToast("تم استلام المكافأة اليومية: +5 $ بنجاح");
  };

  const lockedCategory = lockTarget ? CATEGORIES.find((c) => c.id === lockTarget)! : null;
  const insufficient = lockedCategory ? wallet.coins < lockedCategory.cost : false;

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-background text-foreground">
      {/* الترويسة الرئيسية - التزام تام بأسلوب كانتو المسطح وبدون أي زجاجية أو ضبابية */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => {
              if (phase !== "setup") {
                if (window.confirm("العودة إلى شاشة الإعداد؟ سيتم إيقاف الجولة الحالية.")) {
                  clearActiveSession();
                  setPhase("setup");
                }
              } else {
                setPhase("setup");
              }
            }}
            className="font-display text-xl font-bold tracking-tight hover:opacity-85"
          >
            اسألني
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-bold">
              <span>🪙</span>
              <span dir="ltr">{wallet.coins} $</span>
            </div>
            <button
              onClick={() => setStoreOpen(true)}
              className="btn-base btn-solid px-3 py-1.5 text-xs font-bold"
            >
              شحن العملات +
            </button>
          </div>
        </div>
      </nav>

      {/* الشاشات الرئيسية */}
      <main className="pb-16">
        {phase === "setup" ? (
          <SetupScreen
            players={players}
            addPlayer={handleAddPlayer}
            removePlayer={handleRemovePlayer}
            clearPlayers={handleClearPlayers}
            unlocked={wallet.unlocked}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onLockedClick={setLockTarget}
            selectedDifficulties={selectedDifficulties}
            toggleDifficulty={handleToggleDifficulty}
            roundLimit={roundLimit}
            setRoundLimit={handleSetRoundLimit}
            onStart={() => startGame()}
            questionCount={pool.length}
            hasActiveSession={hasSavedSession}
            onResumeSession={resumeActiveSession}
          />
        ) : null}

        {phase === "arena" && deck[index] ? (
          <ArenaScreen
            question={deck[index]}
            index={index}
            total={deck.length}
            players={players}
            currentTurnIndex={currentTurnIndex}
            scores={scores}
            onCorrect={handleCorrectAnswer}
            onWrong={handleWrongAnswer}
            onSkip={handleSkipQuestion}
            onEnd={handleEndGameEarly}
          />
        ) : null}

        {phase === "results" ? (
          <ResultsScreen
            scores={scores}
            onReplay={() => startGame()}
            onReconfigure={() => {
              clearActiveSession();
              setPhase("setup");
            }}
          />
        ) : null}
      </main>

      {/* متجر العملات ومحاكاة الإعلانات */}
      <CoinStore
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
        coins={wallet.coins}
        onReward={rewardAd}
        dailyAvailable={wallet.dailyAvailable}
        onClaimDaily={claimDaily}
        nextDailyIn={wallet.nextDailyIn}
      />

      {/* نافذة فتح الباقة المقفلة */}
      <Modal
        open={lockedCategory !== null}
        onClose={() => setLockTarget(null)}
        title="فتح حزمة أسئلة جديدة"
      >
        {lockedCategory ? (
          <div className="space-y-4">
            <div>
              <p className="font-display text-xl font-bold text-foreground">
                {lockedCategory.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{lockedCategory.description}</p>
            </div>

            <div className="flex justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <span className="text-muted-foreground">رصيد محفظتك الحالي</span>
              <span className="font-bold text-cream">{wallet.coins} عملة</span>
            </div>
            <div className="flex justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <span className="text-muted-foreground">تكلفة الفتح الدائم</span>
              <span className="font-bold text-cream">{lockedCategory.cost} عملة</span>
            </div>

            {insufficient ? (
              <div className="space-y-2 pt-2">
                <p className="text-center text-xs text-danger font-medium">
                  رصيدك الحالي غير كافٍ. يمكنك شحن 5 عملات مجاناً بمشاهدة إعلان.
                </p>
                <button
                  onClick={() => {
                    setLockTarget(null);
                    setStoreOpen(true);
                  }}
                  className="btn-base btn-solid w-full font-bold"
                >
                  شحن رصيد الآن (إعلان مجاني)
                </button>
              </div>
            ) : (
              <button onClick={confirmUnlock} className="btn-base btn-solid w-full font-bold">
                إلغاء قفل الحزمة ({lockedCategory.cost} عملة)
              </button>
            )}
            <button onClick={() => setLockTarget(null)} className="btn-base btn-ghost w-full">
              إلغاء
            </button>
          </div>
        ) : null}
      </Modal>

      {/* التنبيهات السريعة (Toast) */}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
