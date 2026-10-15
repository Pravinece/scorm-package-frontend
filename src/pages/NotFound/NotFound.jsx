import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--color-paper)] text-center px-6">
      <p className="font-display text-[52px] leading-none">404</p>
      <p className="text-[14px] text-[var(--color-ink-soft)] max-w-xs">This page doesn't exist.</p>
      <Link to="/"><Button variant="primary" className="mt-2">Back to chat</Button></Link>
    </div>
  );
}
