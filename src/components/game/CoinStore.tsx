import { useEffect, useState } from "react";
import { Modal } from "./Modal";

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

  useEffect(() => {
    if (!adOpen) return;
    setCount(5);
    const timer = setInterval(() => {
      setCount((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [adOpen]);

  const finishAd = () => {
    setAdOpen(false);
    onReward();
  };

  return (
    <>
      <Modal open={open && !adOpen} onClose={onClose} title="متجر الشحن">
        <div className="space-y-4">
          <div className="panel-light flex items-center justify-between px-4 py-3">
            <span className="text-sm font-bold">رصيدك الحالي</span>
            <span className="font-display text-2xl">{coins} عملة</span>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="text-lg font-bold">مشاهدة إعلان مكافأة</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              +5 عملات مقابل مشاهدة إعلان قصير مدته 5 ثوانٍ.
            </p>
            <button
              onClick={() => setAdOpen(true)}
              className="btn-base btn-solid mt-4 w-full"
            >
              مشاهدة الإعلان
            </button>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="text-lg font-bold">المكافأة اليومية</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {dailyAvailable
                ? "+5 عملات مجاناً، مرة واحدة كل 24 ساعة."
                : `متاحة بعد ${formatRemaining(nextDailyIn)}`}
            </p>
            <button
              onClick={onClaimDaily}
              disabled={!dailyAvailable}
              className="btn-base btn-ghost mt-4 w-full"
            >
              استلام المكافأة اليومية
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={adOpen} wide>
        <div className="flex min-h-[46vh] flex-col items-center justify-center gap-6 text-center">
          <span className="text-xs tracking-[0.4em] text-muted-foreground">
            إعلان
          </span>
          <div className="font-display text-7xl">{count > 0 ? count : "✓"}</div>
          <p className="text-sm text-muted-foreground">
            {count > 0
              ? "يرجى الانتظار حتى انتهاء الإعلان..."
              : "انتهى الإعلان، استلم مكافأتك"}
          </p>
          <button
            onClick={finishAd}
            disabled={count > 0}
            className="btn-base btn-solid w-56"
          >
            إغلاق واستلام 5 عملات
          </button>
        </div>
      </Modal>
    </>
  );
}
