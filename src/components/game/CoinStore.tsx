import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { admobService } from "@/lib/admob-service";

function formatRemaining(ms: number) {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours} ساعة و ${minutes} دقيقة`;
}

export function CoinStore({
  open,
  onClose,
  coins,
  onReward,
  dailyAvailable,
  onClaimDaily,
  nextDailyIn,
}: {
  open: boolean;
  onClose: () => void;
  coins: number;
  onReward: () => void;
  dailyAvailable: boolean;
  onClaimDaily: () => void;
  nextDailyIn: number;
}) {
  const [adOpen, setAdOpen] = useState(false);
  const [count, setCount] = useState(5);
  const [remainingTime, setRemainingTime] = useState(nextDailyIn);

  // Sync remaining time when prop changes
  useEffect(() => {
    setRemainingTime(nextDailyIn);
  }, [nextDailyIn]);

  // Tick down remaining daily reward time every minute or when open
  useEffect(() => {
    if (!open || dailyAvailable) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, dailyAvailable]);

  // Rewarded Ad 5-second countdown for web fallback
  useEffect(() => {
    if (!adOpen) return;
    setCount(5);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adOpen]);

  const handleWatchAd = () => {
    void admobService.showRewardedAd({
      onReward: () => {
        onReward();
      },
      onDismiss: () => {
        // Native ad dismissed
      },
      onFallback: () => {
        // Web fallback simulation modal
        setAdOpen(true);
      },
    });
  };

  const finishAd = () => {
    setAdOpen(false);
    onReward();
  };

  return (
    <>
      <Modal open={open && !adOpen} onClose={onClose} title="متجر العملات والشحن">
        <div className="space-y-4">
          {/* الرصيد الحالي */}
          <div className="panel-light flex items-center justify-between p-4">
            <div className="text-center mr-[115px]">
              <span className="text-xs font-bold text-kanto-black/70">محفظة العملات المتاحة</span>
              <p className="font-display text-2xl font-bold text-kanto-black text-center" dir="ltr">
                {coins} $
              </p>
            </div>
          </div>

          {/* مشاهدة إعلان مكافأة */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">مشاهدة إعلان (+5 $)</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  شاهد إعلاناً قصيراً للحصول على 5 $ إضافية لمحفظتك مباشرة.
                </p>
              </div>
              <span
                className="rounded-md border border-cream/40 bg-cream/10 px-2 py-0.5 text-xs font-bold text-cream"
                dir="ltr"
              >
                +5 $
              </span>
            </div>
            <button onClick={handleWatchAd} className="btn-base btn-solid mt-4 w-full">
              مشاهدة إعلان (+5 $)
            </button>
          </div>

          {/* المكافأة اليومية */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">المكافأة اليومية المجانية (+5 $)</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dailyAvailable
                    ? "المكافأة جاهزة للاستلام الآن!"
                    : `متاحة للاستلام بعد: ${formatRemaining(remainingTime)}`}
                </p>
              </div>
              <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-bold text-muted-foreground">
                24 ساعة
              </span>
            </div>
            <button
              onClick={onClaimDaily}
              disabled={!dailyAvailable}
              className="btn-base btn-ghost mt-4 w-full"
            >
              {dailyAvailable ? "استلام +5 $ الآن 🎁" : "تم الاستلام لهذا اليوم"}
            </button>
          </div>
        </div>
      </Modal>

      {/* شاشة محاكاة الإعلان الأنيقة ذات التوقيت التنازلي (البديل للويب) */}
      <Modal open={adOpen} wide>
        <div className="flex min-h-[46vh] flex-col items-center justify-center gap-6 p-4 text-center">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-bold tracking-[0.3em] text-muted-foreground">
              محاكاة إعلان مكافأة
            </span>
          </div>

          {/* مؤشرات تقدم الثواني الخمس */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const passed = 5 - count >= step;
              return (
                <div
                  key={step}
                  className={`h-1.5 w-8 rounded-full border transition-all duration-300 ${
                    passed ? "border-cream bg-cream" : "border-border bg-secondary"
                  }`}
                />
              );
            })}
          </div>

          <div className="font-display text-7xl font-bold text-cream sm:text-8xl">
            {count > 0 ? count : "✓"}
          </div>

          <p className="text-sm text-muted-foreground">
            {count > 0
              ? `يرجى الانتظار ${count} ثوانٍ لإكمال المشاهدة واستحقاق المكافأة...`
              : "اكتملت المشاهدة بنجاح! اضغط بالأسفل لإيداع 5 $ في محفظتك."}
          </p>

          <button
            onClick={finishAd}
            disabled={count > 0}
            className="btn-base btn-solid w-64 py-3 font-bold"
          >
            {count > 0 ? `انتظر (${count} ثوانٍ)` : "استلام +5 $ وإغلاق"}
          </button>
        </div>
      </Modal>
    </>
  );
}
