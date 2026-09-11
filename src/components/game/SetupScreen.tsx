import { useState } from "react";
import { CATEGORIES, DIFFICULTIES, type CategoryId, type Difficulty } from "@/data/questions";

export function SetupScreen({
  players,
  addPlayer,
  removePlayer,
  clearPlayers,
  unlocked,
  selectedCategories,
  toggleCategory,
  onLockedClick,
  selectedDifficulties,
  toggleDifficulty,
  roundLimit,
  setRoundLimit,
  onStart,
  questionCount,
  hasActiveSession,
  onResumeSession,
}: {
  players: string[];
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  clearPlayers: () => void;
  unlocked: CategoryId[];
  selectedCategories: CategoryId[];
  toggleCategory: (id: CategoryId) => void;
  onLockedClick: (id: CategoryId) => void;
  selectedDifficulties: Difficulty[];
  toggleDifficulty: (d: Difficulty) => void;
  roundLimit: number;
  setRoundLimit: (limit: number) => void;
  onStart: () => void;
  questionCount: number;
  hasActiveSession: boolean;
  onResumeSession: () => void;
}) {
  const [name, setName] = useState("");

  const submit = () => {
    const clean = name.trim();
    if (!clean || players.length >= 15 || players.includes(clean)) return;
    addPlayer(clean);
    setName("");
  };

  const ROUND_LIMIT_OPTIONS = [
    { label: "5 أسئلة", value: 5 },
    { label: "10 أسئلة", value: 10 },
    { label: "15 سؤالاً", value: 15 },
    { label: "20 سؤالاً", value: 20 },
    { label: "جميع الأسئلة", value: 0 },
  ];

  const canStart =
    players.length >= 2 &&
    selectedCategories.length > 0 &&
    selectedDifficulties.length > 0 &&
    questionCount > 0;

  return (
    <div className="fade-in-up mx-auto w-full max-w-4xl space-y-10 px-4 py-10">
      <header className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-[0.5em] text-muted-foreground">KANTO EMPIRE</p>
          {hasActiveSession ? (
            <button
              onClick={onResumeSession}
              className="btn-base btn-ghost border-cream text-xs font-bold text-cream"
            >
              استئناف الجولة السابقة ↺
            </button>
          ) : null}
        </div>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">اسألني</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          لعبة أسئلة جماعية بدون تسجيل أو اتصال خارجي — أضف اللاعبين، اختر الفئات، وابدأ التحدي.
        </p>
      </header>

      {/* اللاعبون */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">اللاعبون (٢ - ١٥)</h2>
          <div className="flex items-center gap-3">
            {players.length > 0 ? (
              <button
                onClick={clearPlayers}
                className="text-xs text-muted-foreground hover:text-danger"
              >
                مسح الكل
              </button>
            ) : null}
            <span className="text-xs font-bold text-muted-foreground">{players.length} / 15</span>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="اكتب اسم المتسابق ثم اضغط إضافة"
            maxLength={25}
            className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-cream"
          />
          <button
            onClick={submit}
            disabled={!name.trim() || players.length >= 15 || players.includes(name.trim())}
            className="btn-base btn-solid"
          >
            إضافة لاعب
          </button>
        </div>
        {players.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {players.map((p, idx) => (
              <div
                key={p}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
              >
                <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                <span className="font-bold">{p}</span>
                <button
                  onClick={() => removePlayer(p)}
                  className="mr-1 text-xs text-muted-foreground hover:text-danger"
                  title="حذف اللاعب"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            أضف متسابقين اثنين على الأقل لبدء التحدي وتفعيل ساحة الأسئلة.
          </p>
        )}
      </section>

      {/* باقات وفئات الأسئلة */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">باقات الأسئلة</h2>
          <span className="text-xs text-muted-foreground">
            {selectedCategories.length} باقات مختارة
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const isUnlocked = unlocked.includes(cat.id);
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => (isUnlocked ? toggleCategory(cat.id) : onLockedClick(cat.id))}
                className={`rounded-lg border p-4 text-right transition-colors ${
                  isSelected
                    ? "border-cream bg-cream text-kanto-black"
                    : isUnlocked
                      ? "border-border bg-surface hover:border-cream/80"
                      : "border-border/60 bg-surface/40 opacity-80 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold">{cat.name}</span>
                  {isUnlocked ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-current text-xs">
                      {isSelected ? "✓" : ""}
                    </span>
                  ) : (
                    <span className="rounded-lg border border-border bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      🔒 15 عملة
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs ${
                    isSelected ? "text-kanto-black/75" : "text-muted-foreground"
                  }`}
                >
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* مستوى الصعوبة */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">مستوى الصعوبة</h2>
          <span className="text-xs text-muted-foreground">
            {selectedDifficulties.length === DIFFICULTIES.length
              ? "جميع المستويات مختارة"
              : `${selectedDifficulties.length} مستويات مختارة`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => {
            const active = selectedDifficulties.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDifficulty(d)}
                className={`btn-base flex items-center gap-2 transition-all ${
                  active ? "btn-solid" : "btn-ghost"
                }`}
                aria-pressed={active}
              >
                <span>{d}</span>
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-bold ${
                    active ? "bg-kanto-black text-cream" : "border border-border text-transparent"
                  }`}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          يمكنك تحديد أكثر من مستوى صعوبة معاً لتنويع التحدي بين السهل والمتوسط والصعب بشكل ذكي
          ومتناغم.
        </p>
      </section>

      {/* طول التحدي (عدد الأسئلة) */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl">طول التحدي (عدد الأسئلة)</h2>
        <div className="flex flex-wrap gap-2">
          {ROUND_LIMIT_OPTIONS.map((opt) => {
            const active = roundLimit === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setRoundLimit(opt.value)}
                className={`btn-base ${active ? "btn-solid" : "btn-ghost"}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* زر البدء */}
      <div className="space-y-3 border-t border-border pt-6">
        <button
          onClick={onStart}
          disabled={!canStart}
          className="btn-base btn-solid w-full py-4 text-lg font-bold"
        >
          ابدأ التحدي الآن
        </button>
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <span>{questionCount} سؤال متوفر يطابق تصفياتك</span>
          {!canStart ? (
            <span className="text-danger">
              {players.length < 2
                ? "يلزم إضافة لاعبين على الأقل"
                : selectedCategories.length === 0
                  ? "يلزم اختيار باقة واحدة على الأقل"
                  : selectedDifficulties.length === 0
                    ? "يلزم تحديد مستوى صعوبة واحد على الأقل"
                    : "لا توجد أسئلة تطابق التصفيات"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
