import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-kanto-black/90 px-4">
      <div
        className={`panel fade-in-up w-full ${wide ? "max-w-2xl" : "max-w-md"} p-6`}
      >
        {title ? (
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-display text-2xl">{title}</h2>
            {onClose ? (
              <button
                onClick={onClose}
                className="btn-base btn-ghost px-3 py-1 text-xs"
              >
                إغلاق
              </button>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
