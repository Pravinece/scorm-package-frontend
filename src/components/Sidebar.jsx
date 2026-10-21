import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MessageCircle, PackageSearch, Users, X, Sparkles, Video } from "lucide-react";
import { canUpload, isAdmin } from "../lib/roles";

export default function Sidebar({ open, onClose }) {
  const navItems = [
    { path: "/", icon: MessageCircle, label: "Chat", visible: true, end: true },
    { path: "/packages", icon: PackageSearch, label: "Packages", visible: canUpload() },
    { path: "/users", icon: Users, label: "Users", visible: isAdmin() },
    { path: "/scromplayer", icon: Video, label: "Scorm Player", visible:  isAdmin() }
  ];

  const location = useLocation();
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState(null);
  const visibleItems = navItems.filter((i) => i.visible);

  useEffect(() => {
    const activeIndex = visibleItems.findIndex((item) =>
      item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    const el = itemRefs.current[activeIndex];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navTop = nav.getBoundingClientRect().top;
    const elRect = el.getBoundingClientRect();
    setIndicatorStyle({ top: elRect.top - navTop, height: elRect.height });
  }, [location.pathname, visibleItems.length]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 hidden max-[900px]:block" onClick={onClose} />}
      <aside
        className={`h-full w-[230px] flex-shrink-0 flex flex-col py-7 px-4 bg-[var(--color-ink)] text-white
        max-[900px]:fixed max-[900px]:z-50 max-[900px]:top-0 max-[900px]:left-0 max-[900px]:h-screen max-[900px]:transition-transform
        ${open ? "max-[900px]:translate-x-0" : "max-[900px]:-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-accent)]" />
            <div>
              <p className="font-display text-[16px] leading-none">SCORM Tutor</p>
              <p className="text-[10.5px] tracking-[0.12em] uppercase text-white/50 mt-1">Avatar Chat</p>
            </div>
          </div>
          <button className="hidden max-[900px]:block text-white/70" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav ref={navRef} className="relative flex flex-col gap-1 flex-1">
          {indicatorStyle && (
            <div
              className="absolute left-0 right-0 rounded-lg bg-[var(--color-accent)] transition-all duration-300 ease-in-out"
              style={indicatorStyle}
            />
          )}
          {visibleItems.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              ref={(el) => (itemRefs.current[i] = el)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
                  isActive ? "text-white font-semibold" : "text-white/70 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="text-[11px] text-white/35 px-1">Learn by talking, not scrolling.</div>
      </aside>
    </>
  );
}
