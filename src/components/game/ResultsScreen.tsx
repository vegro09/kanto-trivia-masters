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
  const winner = ranked[0];

  return (
    <div className="fade-in-up mx-auto w-full max-w-3xl space-y-8 px-4 py-12">
      <header className="text-center">
        <p className="text-xs tracking-[0.5em] text-muted-foreground">
          النتيجة النهائية
        </p>
        <h1 className="mt-4 text-4xl">لوحة الصدارة</h1>
      </header>

      {winner ? (
        <div className="panel-light px-6 py-10 text-center">
          <div className="text-4xl">🏆</div>
          <p className="mt-3 text-xs tracking-[0.3em]">الفائز</p>
          <p className="font-display mt-2 text-4xl">{winner[0]}</p>
          <p className="mt-1 text-sm font-bold">{winner[1]} نقطة</p>
        </div>
      ) : null}

      <div className="space-y-2">
        {ranked.map(([player, score], i) => (
          <div
            key={player}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-muted-foreground">{i + 1}</span>
              <span className="font-bold">{player}</span>
            </div>
            <span className="font-display text-xl">{score}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <button onClick={onReplay} className="btn-base btn-solid flex-1 py-3">
          جولة جديدة بنفس اللاعبين
        </button>
        <button onClick={onReconfigure} className="btn-base btn-ghost py-3">
          إعداد جديد
        </button>
      </div>
    </div>
  );
}
