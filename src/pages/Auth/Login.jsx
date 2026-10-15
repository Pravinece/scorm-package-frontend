import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, seedAdmin } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { toast } from "../../store/toastStore";
import { Button, Input } from "../../components/ui";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!empId.trim()) nextErrors.empId = "Employee ID is required";
    if (!password.trim()) nextErrors.password = "Password is required";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setErrors({});
    setLoading(true);

    const res = await loginUser({ empId: empId.trim(), password: password.trim() });
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    login(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user?.name || "there"}`);
    navigate(location.state?.from?.pathname || "/", { replace: true });
  };

  const handleSeed = async () => {
    setSeeding(true);
    const res = await seedAdmin();
    setSeeding(false);
    if (res.success) {
      toast.success("Admin account seeded — sign in with the credentials from the server's .env");
    } else if (res.status === 409) {
      toast.info("Admin is already seeded — just sign in");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-paper)]">
      <div className="hidden md:flex flex-col justify-between w-[42%] bg-[var(--color-ink)] text-white p-12">
        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-[var(--color-accent)]" />
          <span className="text-[13px] uppercase tracking-[0.16em] text-white/60">SCORM Tutor</span>
        </div>
        <div>
          <p className="font-display text-[32px] leading-[1.2] max-w-sm">
            Talk to your training content like it's a person.
          </p>
          <p className="text-white/50 text-[13px] mt-4 max-w-xs">
            Admins upload and process SCORM packages. Everyone else just asks the avatar.
          </p>
        </div>
        <p className="text-white/30 text-[11px]">&copy; {new Date().getFullYear()} SCORM Tutor</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-[380px] animate-rise">
          <p className="font-display text-[26px] mb-1">Sign in</p>
          <p className="text-[13px] text-[var(--color-ink-soft)] mb-8">Enter your employee ID and password.</p>

          <div className="flex flex-col gap-4">
            <Input
              label="Employee ID"
              placeholder="EMP001"
              value={empId}
              error={errors.empId}
              onChange={(e) => {
                setEmpId(e.target.value);
                if (errors.empId) setErrors((p) => ({ ...p, empId: null }));
              }}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: null }));
              }}
            />
          </div>

          <Button type="submit" variant="accent" className="w-full mt-6" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="text-[12px] text-center w-full mt-5 text-[var(--color-ink-soft)] underline underline-offset-2"
          >
            {seeding ? "Seeding admin…" : "First time setup — seed the admin account"}
          </button>
        </form>
      </div>
    </div>
  );
}
