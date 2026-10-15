import { useEffect, useRef } from "react";

// state: "idle" | "listening" | "speaking"
export default function AvatarStage({ avatar, state }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const wantSrc = state === "speaking" && avatar.talk ? avatar.talk : avatar.idle;
    if (!el.src.endsWith(wantSrc)) {
      el.src = wantSrc;
    }
    el.loop = true;
    el.play().catch(() => {});
  }, [avatar, state]);

  return (
    <div className="relative bg-[var(--color-ink)] rounded-xl overflow-hidden aspect-[9/16] w-full">
      <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline />

      <span className="absolute top-3 left-3 font-display font-semibold text-[13px] text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
        {avatar.name}
      </span>

      <span
        className={`absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm ${
          state === "speaking"
            ? "bg-[var(--color-accent)] text-white"
            : state === "listening"
            ? "bg-white text-[var(--color-ink)]"
            : "bg-black/40 text-white"
        }`}
      >
        {(state === "speaking" || state === "listening") && (
          <span className="waveform">
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </span>
        )}
        {state}
      </span>
    </div>
  );
}
