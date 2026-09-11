import { useEffect, useState } from "react";
import { CATEGORIES, type Question } from "@/data/questions";

export function ArenaScreen({
  question,
  index,
  total,
  players,
  currentTurnIndex,
  scores,
  onCorrect,
  onWrong,
  onSkip,
  onEnd,
}: {
  question: Question;
  index: number;
  total: number;
  players: string[];
  currentTurnIndex: number;
  scores: Record<string, number>;
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: () => void;
  onEnd: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showStandings, setShowStandings] = useState(false);

  // Hide answer whenever a new question is loaded
  useEffect(() => {
    setRevealed(false);
  }, [question.id]);

  const activePlayer = players[currentTurnIndex] ?? players[0] ?? "";
  const categoryName =
    CATEGORIES.find((c) => c.id === question.category || c.name === question.category)?.name ??
    question.category;

  // Sort standings descending
  const sortedStandings = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div key={question.id} className="fade-in-up mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      {/* الترويسة العلوية */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cream">
            السؤال {index + 1} من {total}
          </span>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => setShowStandings(!showStandings)}
            className="text-xs font-bold text-cream underline underline-offset-4 hover:opacity-80"
          >
            {showStandings ? "إخفاء الترتيب" : "عرض الترتيب اللحظي"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-border bg-surface px-3 py-1 font-medium">
            {categoryName}
          </span>
          <span className="rounded-lg border border-border bg-surface px-3 py-1 font-medium">
            {question.difficulty}
          </span>
          <span className="rounded-lg border border-cream bg-cream px-3 py-1 font-bold text-kanto-black">
            +1 نقطة
          </span>
        </div>
      </header>

      {/* شريط الدور الحالي */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cream/70 bg-cream/10 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 rounded-full bg-cream animate-pulse" />
          <span className="text-xs font-bold text-muted-foreground">صاحب الإجابة الآن:</span>
          <span className="text-base font-bold text-cream underline decoration-cream/40 underline-offset-4">
            {activePlayer}
          </span>
        </div>
      </div>

      {/* لوحة الترتيب اللحظي (قابلة للتبديل) */}
      {showStandings ? (
        <div className="fade-in-up panel p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold text-muted-foreground">
              الترتيب اللحظي للمتسابقين
            </span>
            <span className="text-xs text-muted-foreground">{sortedStandings.length} لاعبين</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {sortedStandings.map(([player, score], rank) => (
              <div
                key={player}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                  rank === 0 ? "border-cream bg-cream/10 text-cream" : "border-border bg-secondary"
                }`}
              >
                <span className="font-bold">
                  {rank + 1}. {player}
                </span>
                <span className="font-mono font-bold text-cream">{score}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* بطاقة السؤال */}
      <div className="panel px-6 py-10 text-center sm:py-14">
        <span className="text-[11px] font-bold tracking-[0.3em] text-muted-foreground">
          سؤال التحكيم
        </span>
        <p className="font-sans mt-4 text-2xl font-bold leading-relaxed text-foreground sm:text-3xl md:text-4xl">
          {question.question}
        </p>
      </div>

      {/* كشف / إخفاء الإجابة */}
      <div className="space-y-3">
        {revealed ? (
          <div className="fade-in-up panel-light px-6 py-6 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.2em] text-kanto-black/60">
                الإجابة النموذجية
              </span>
              <button
                onClick={() => setRevealed(false)}
                className="text-xs font-bold text-kanto-black/70 hover:underline"
              >
                إخفاء الإجابة
              </button>
            </div>
            <p className="mt-2 text-2xl font-bold text-kanto-black sm:text-3xl">
              {question.answer}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="btn-base btn-ghost w-full py-4 text-base font-bold"
          >
            كشف الإجابة للحكم 👁
          </button>
        )}
      </div>

      {/* زرا القرار المركزيان للحكم */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* الزر الأيمن: إجابة صحيحة (أخضر) */}
        <button
          type="button"
          onClick={() => {
            setRevealed(false);
            onCorrect();
          }}
          className="btn-base flex flex-col items-center justify-center gap-1 border-2 border-success bg-success/15 py-4 text-center text-success transition-colors hover:bg-success hover:text-kanto-black"
        >
          <span className="text-xl font-bold">✓ إجابة صحيحة</span>
          <span className="text-xs font-bold text-success/90">{activePlayer}</span>
        </button>

        {/* الزر الأيسر: إجابة خاطئة (أحمر) */}
        <button
          type="button"
          onClick={onWrong}
          className="btn-base flex flex-col items-center justify-center gap-1 border-2 border-danger bg-danger/15 py-4 text-center text-danger transition-colors hover:bg-danger hover:text-kanto-white"
        >
          <span className="text-xl font-bold">✕ إجابة خاطئة</span>
          <span className="text-xs font-bold text-danger/90">{activePlayer}</span>
        </button>
      </div>

      {/* لوحة المتسابقين والنتائج المباشرة */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">لوحة المتسابقين والنتائج</h2>
          <span className="text-xs text-muted-foreground">
            المتسابق المميّز باللون العاجي هو صاحب الدور الحالي
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {players.map((player, idx) => {
            const isActive = idx === currentTurnIndex;
            return (
              <div
                key={player}
                className={`flex items-center justify-between rounded-lg border p-3.5 transition-all ${
                  isActive
                    ? "border-cream bg-cream text-kanto-black font-bold shadow-none"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono ${
                      isActive ? "text-kanto-black/70" : "text-muted-foreground"
                    }`}
                  >
                    {idx + 1}.
                  </span>
                  <span className="text-base font-bold">{player}</span>
                  {isActive ? (
                    <span className="rounded-md border border-kanto-black/30 bg-kanto-black px-2 py-0.5 text-[11px] font-bold text-cream">
                      🎯 دور: {player}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-mono font-bold ${
                      isActive
                        ? "border-kanto-black/40 bg-kanto-black/10 text-kanto-black"
                        : "border-border bg-secondary text-cream"
                    }`}
                  >
                    {scores[player] ?? 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* خيارات التحكم الإضافية */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <button
          onClick={() => {
            setRevealed(false);
            onSkip();
          }}
          className="btn-base btn-ghost py-3 px-4 text-xs text-muted-foreground hover:text-cream"
          title="تخطي هذا السؤال دون احتساب نقاط"
        >
          تخطي السؤال الحالي →
        </button>
        <button
          onClick={onEnd}
          className="btn-base btn-ghost py-3 px-4 text-xs text-danger hover:border-danger"
        >
          إنهاء التحدي الآن
        </button>
      </div>
    </div>
  );
}
