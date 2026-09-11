import { useState } from "react";
import {
  CATEGORIES,
  DIFFICULTY_POINTS,
  type Question,
} from "@/data/questions";

export function ArenaScreen({
  question,
  index,
  total,
  scores,
  onScore,
  onNext,
  onEnd,
}: {
  question: Question;
  index: number;
  total: number;
  scores: Record<string, number>;
  onScore: (player: string, delta: number) => void;
  onNext: () => void;
  onEnd: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [awarded, setAwarded] = useState<string | null>(null);
  const points = DIFFICULTY_POINTS[question.difficulty];
  const categoryName =
    CATEGORIES.find((c) => c.id === question.category)?.name ?? "";

  const next = () => {
    setRevealed(false);
    setAwarded(null);
    onNext();
  };

  return (
    <div key={question.id} className="fade-in-up mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs">
        <span className="text-muted-foreground">
          الجولة {index + 1} من {total}
        </span>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-border px-3 py-1">
            {categoryName}
          </span>
          <span className="rounded-lg border border-border px-3 py-1">
            {question.difficulty}
          </span>
          <span className="rounded-lg border border-cream bg-cream px-3 py-1 font-bold text-kanto-black">
            {points} نقطة
          </span>
        </div>
      </header>

      <div className="panel px-6 py-12 text-center">
        <p className="font-display text-3xl leading-relaxed sm:text-4xl">
          {question.question}
        </p>
      </div>

      {revealed ? (
        <div className="panel-light fade-in-up px-6 py-6 text-center">
          <p className="text-xs tracking-[0.3em]">الإجابة</p>
          <p className="mt-2 text-2xl font-bold">{question.answer}</p>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="btn-base btn-ghost w-full py-4 text-base"
        >
          كشف الإجابة
        </button>
      )}

      <section className="space-y-3">
        <h2 className="text-xl">لوحة التنقيط</h2>
        <div className="space-y-2">
          {Object.keys(scores).map((player) => (
            <div
              key={player}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold">{player}</span>
                <span className="text-xs text-muted-foreground">
                  {scores[player]} نقطة
                </span>
                {awarded === player ? (
                  <span className="text-xs text-success">✓ تم المنح</span>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onScore(player, points);
                    setAwarded(player);
                    setRevealed(true);
                  }}
                  className="btn-base px-3 py-1.5 text-xs"
                  style={{ borderColor: "#10B981", color: "#10B981" }}
                >
                  + {points}
                </button>
                <button
                  onClick={() => onScore(player, -points)}
                  className="btn-base px-3 py-1.5 text-xs"
                  style={{ borderColor: "#EF4444", color: "#EF4444" }}
                >
                  − {points}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <button onClick={next} className="btn-base btn-solid flex-1 py-3">
          {index + 1 === total ? "عرض النتائج" : "السؤال التالي"}
        </button>
        <button onClick={onEnd} className="btn-base btn-ghost py-3">
          إنهاء التحدي
        </button>
      </div>
    </div>
  );
}
