const map = {
  ready: "bg-[var(--color-good)]/10 text-[var(--color-good)]",
  failed: "bg-[var(--color-bad)]/10 text-[var(--color-bad)]",
  queued: "bg-[var(--color-wait)]/10 text-[var(--color-wait)]",
  unzipping: "bg-[var(--color-wait)]/10 text-[var(--color-wait)]",
  extracting: "bg-[var(--color-wait)]/10 text-[var(--color-wait)]",
  indexing: "bg-[var(--color-wait)]/10 text-[var(--color-wait)]",
  transcribing: "bg-[var(--color-wait)]/10 text-[var(--color-wait)]",
};

export default function StatusBadge({ status }) {
  const cls = map[status] || "bg-[var(--color-line)] text-[var(--color-ink-soft)]";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase font-mono ${cls}`}>
      {status}
    </span>
  );
}
