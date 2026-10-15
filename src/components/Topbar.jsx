import { Menu, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LABELS = { "": "Chat", packages: "Packages", users: "Users" };

function useCrumb() {
  const segments = useLocation().pathname.split("/").filter(Boolean);
  if (segments.length === 0) return LABELS[""];
  return segments.map((s) => LABELS[s] || s).join(" / ");
}

export default function Topbar({ onMenuToggle }) {
  const crumb = useCrumb();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between py-4 mb-4 border-b border-[var(--color-line)]">
      <div className="flex items-center gap-3">
        <button className="hidden max-[900px]:block" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <p className="font-display text-[20px] leading-none">{crumb}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-semibold leading-none">{user?.name}</p>
          <p className="text-[11px] text-[var(--color-ink-soft)] mt-1 uppercase tracking-wide font-mono">{user?.role}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          title="Log out"
          className="w-9 h-9 rounded-full border border-[var(--color-line)] bg-white flex items-center justify-center hover:bg-[var(--color-paper)] transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
