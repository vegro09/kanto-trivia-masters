export function ResultsScreen({
  scores,
  onReplay,
  onReconfigure,
}: {
  scores: Record<string, number>;
  onReplay: () => void;
  onReconfigure: () => void;
}) {
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  return (
    <div className="fade-in-up mx-auto w-full max-w-4xl space-y-10 px-4 py-12">
      <header className="text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-relaxed mb-4">
          منصة التتويج والنتائج
        </h1>
        <p className="text-sm text-muted-foreground">
          انتهى التحدي! إليكم الترتيب النهائي وجدول النقاط المعتمد.
        </p>
      </header>

      {/* منصة التتويج المعمارية لكانتو (Top 3 Architectural Flat Podium) */}
      <div className="pt-6">
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
          {/* المركز الثاني (Second Place) */}
          {second ? (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-2xl">🥈</div>
              <div className="panel w-full border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground">
                  المركز الثاني
                </span>
                <p className="font-display mt-2 truncate text-lg font-bold text-foreground sm:text-xl">
                  {second[0]}
                </p>
                <div className="mt-2 inline-block rounded-md border border-border bg-secondary px-2.5 py-0.5 font-mono text-xs font-bold text-cream">
                  {second[1]} نقطة
                </div>
              </div>
              <div className="h-16 w-full rounded-b-lg border-x border-b border-border bg-secondary/50 flex items-center justify-center font-display text-2xl font-bold text-muted-foreground">
                ٢
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* المركز الأول (First Place - Elevated Center) */}
          {first ? (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-3xl">🏆</div>
              <div className="panel-light w-full border-cream p-5 text-center sm:p-6">
                <span className="text-[11px] font-bold tracking-widest text-kanto-black/70">
                  البطل الفائز
                </span>
                <p className="font-display mt-2 truncate text-xl font-bold text-kanto-black sm:text-2xl md:text-3xl">
                  {first[0]}
                </p>
                <div className="mt-2 inline-block rounded-md border border-kanto-black/20 bg-kanto-black px-3 py-1 font-mono text-sm font-bold text-cream">
                  {first[1]} نقطة
                </div>
              </div>
              <div className="h-28 w-full rounded-b-lg border-x border-b border-border bg-cream/20 flex items-center justify-center font-display text-4xl font-bold text-cream">
                ١
              </div>
            </div>
          ) : null}

          {/* المركز الثالث (Third Place) */}
          {third ? (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-2xl">🥉</div>
              <div className="panel w-full border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground">
                  المركز الثالث
                </span>
                <p className="font-display mt-2 truncate text-lg font-bold text-foreground sm:text-xl">
                  {third[0]}
                </p>
                <div className="mt-2 inline-block rounded-md border border-border bg-secondary px-2.5 py-0.5 font-mono text-xs font-bold text-cream">
                  {third[1]} نقطة
                </div>
              </div>
              <div className="h-10 w-full rounded-b-lg border-x border-b border-border bg-secondary/30 flex items-center justify-center font-display text-xl font-bold text-muted-foreground">
                ٣
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* جدول الترتيب الشامل لجميع المتسابقين */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-xl font-bold">جدول الترتيب الكامل</h2>
          <span className="text-xs text-muted-foreground">إجمالي {ranked.length} متسابقين</span>
        </div>

        <div className="space-y-2">
          {ranked.map(([player, score], i) => (
            <div
              key={player}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                i === 0 ? "border-cream/80 bg-cream/10" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold ${
                    i === 0
                      ? "border-cream bg-cream text-kanto-black"
                      : i === 1
                        ? "border-border text-foreground"
                        : i === 2
                          ? "border-border text-muted-foreground"
                          : "border-transparent text-muted-foreground/60"
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <span className="font-bold text-foreground sm:text-base">{player}</span>
                  {i === 0 ? (
                    <span className="mr-2 text-xs font-bold text-cream">★ المتصدر</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-cream">{score}</span>
                <span className="text-xs text-muted-foreground">نقطة</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* خيارات المتابعة */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <button onClick={onReplay} className="btn-base btn-solid flex-1 py-3.5 text-base font-bold">
          جولة جديدة بنفس المتسابقين ↺
        </button>
        <button onClick={onReconfigure} className="btn-base btn-ghost py-3.5 text-sm font-bold">
          إعداد تحدٍ جديد
        </button>
      </div>
    </div>
  );
}
