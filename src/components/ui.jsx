export function Card({ children, className = "" }) {
  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)]",
    accent: "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:brightness-95",
    ghost: "bg-transparent border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-paper)]",
    danger: "bg-[var(--color-bad)] text-white hover:brightness-95",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...rest }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      {label && <span className="font-medium text-[var(--color-ink)]">{label}</span>}
      <input
        className={`px-3 py-2.5 rounded-lg border bg-white text-[13.5px] outline-none transition-colors focus:border-[var(--color-ink)] ${
          error ? "border-[var(--color-bad)]" : "border-[var(--color-line)]"
        } ${className}`}
        {...rest}
      />
      {error && <span className="text-[var(--color-bad)] text-[12px]">{error}</span>}
    </label>
  );
}

export function Select({ label, className = "", children, ...rest }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      {label && <span className="font-medium text-[var(--color-ink)]">{label}</span>}
      <select
        className={`px-3 py-2.5 rounded-lg border border-[var(--color-line)] bg-white text-[13.5px] outline-none focus:border-[var(--color-ink)] ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--color-line)]/40 flex items-center justify-center mb-4">
          <Icon size={20} className="text-[var(--color-ink-soft)]" />
        </div>
      )}
      <p className="font-display text-[18px] mb-1">{title}</p>
      {description && <p className="text-[13px] text-[var(--color-ink-soft)] max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-[var(--color-line)] border-t-[var(--color-ink)]" />
    </div>
  );
}
