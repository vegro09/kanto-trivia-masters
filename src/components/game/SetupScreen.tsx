import { useState } from "react";
import {
  CATEGORIES,
  DIFFICULTIES,
  type CategoryId,
  type Difficulty,
} from "@/data/questions";

export function SetupScreen({
  players,
  addPlayer,
  removePlayer,
  unlocked,
  selectedCategories,
  toggleCategory,
  onLockedClick,
  selectedDifficulties,
  toggleDifficulty,
  onStart,
  questionCount,
}: {
  players: string[];
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  unlocked: CategoryId[];
  selectedCategories: CategoryId[];
  toggleCategory: (id: CategoryId) => void;
  onLockedClick: (id: CategoryId) => void;
  selectedDifficulties: Difficulty[];
  toggleDifficulty: (d: Difficulty) => void;
  onStart: () => void;
  questionCount: number;
}) {
  const [name, setName] = useState("");

  const submit = () => {
    const clean = name.trim();
    if (!clean || players.length >= 10 || players.includes(clean)) return;
    addPlayer(clean);
    setName("");
  };

  const canStart =
    players.length >= 2 &&
    selectedCategories.length > 0 &&
    selectedDifficulties.length > 0 &&
    questionCount > 0;

  return (
    <div className="fade-in-up mx-auto w-full max-w-4xl space-y-10 px-4 py-10">
      <header className="border-b border-border pb-6">
        <p className="text-xs tracking-[0.5em] text-muted-foreground">KANTO</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">تحدي الأسئلة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          لعبة أسئلة جماعية — أضف اللاعبين، اختر الفئات، وابدأ التحدي.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">اللاعبون</h2>
          <span className="text-xs text-muted-foreground">
            {players.length} / 10
          </span>
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="اسم اللاعب"
            className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-cream"
          />
          <button onClick={submit} className="btn-base btn-solid">
            إضافة
          </button>
        </div>
        {players.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <button
                key={p}
                onClick={() => removePlayer(p)}
                className="btn-base btn-ghost px-3 py-1.5 text-xs"
              >
                {p} <span className="text-muted-foreground">×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            أضف لاعبين اثنين على الأقل لبدء التحدي.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">الفئات</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const isUnlocked = unlocked.includes(cat.id);
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() =>
                  isUnlocked ? toggleCategory(cat.id) : onLockedClick(cat.id)
                }
                className={`rounded-lg border p-4 text-right transition-colors ${
                  isSelected
                    ? "border-cream bg-cream text-kanto-black"
                    : "border-border bg-surface hover:border-cream"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold">{cat.name}</span>
                  {isUnlocked ? (
                    <span className="text-sm">{isSelected ? "✓" : ""}</span>
                  ) : (
                    <span className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      🔒 15 عملة
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs ${isSelected ? "text-kanto-black/70" : "text-muted-foreground"}`}
                >
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">مستوى الصعوبة</h2>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => {
            const active = selectedDifficulties.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDifficulty(d)}
                className={`btn-base ${active ? "btn-solid" : "btn-ghost"}`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>

      <div className="space-y-2 border-t border-border pt-6">
        <button
          onClick={onStart}
          disabled={!canStart}
          className="btn-base btn-solid w-full py-4 text-lg"
        >
          ابدأ التحدي
        </button>
        <p className="text-center text-xs text-muted-foreground">
          {questionCount} سؤال جاهز حسب اختيارك
        </p>
      </div>
    </div>
  );
}
