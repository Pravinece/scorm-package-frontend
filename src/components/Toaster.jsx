import { useToastStore } from "../store/toastStore";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const styles = {
  success: "border-[var(--color-good)]/30 bg-white text-[var(--color-good)]",
  error: "border-[var(--color-bad)]/30 bg-white text-[var(--color-bad)]",
  info: "border-[var(--color-line)] bg-white text-[var(--color-ink)]",
};

const icons = { success: CheckCircle2, error: XCircle, info: Info };

export default function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[320px]">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`animate-rise flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm ${styles[t.type]}`}
          >
            <Icon size={18} className="mt-0.5 flex-shrink-0" />
            <p className="flex-1 font-medium">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-ink-soft hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
