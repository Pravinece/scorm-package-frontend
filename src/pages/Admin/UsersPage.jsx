import { useState } from "react";
import { createUser } from "../../api/authApi";
import { Card, Button, Input, Select } from "../../components/ui";
import { toast } from "../../store/toastStore";
import { UserPlus } from "lucide-react";

const initialForm = { name: "", empId: "", password: "", role: "user" };

export default function UsersPage() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState([]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.empId || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSaving(true);
    const res = await createUser(form);
    setSaving(false);
    if (res.success) {
      toast.success(`User ${res.data?.user?.empId || form.empId} created`);
      setCreated((c) => [res.data?.user || { ...form, password: undefined }, ...c]);
      setForm(initialForm);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto animate-rise grid lg:grid-cols-[1fr_1fr] gap-6">
      <Card className="h-fit">
        <p className="font-display text-[16px] mb-4 flex items-center gap-2"><UserPlus size={16} /> Create a user</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
          <Input label="Employee ID" placeholder="EMP002" value={form.empId} onChange={set("empId")} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
          <Select label="Role" value={form.role} onChange={set("role")}>
            <option value="user">Viewer — chat only</option>
            {/* <option value="uploader">Uploader — upload + chat</option> */}
            <option value="admin">Admin — everything</option>
          </Select>
          <Button type="submit" variant="accent" className="self-start" disabled={saving}>
            {saving ? "Creating…" : "Create user"}
          </Button>
        </form>
      </Card>

      <div>
        <p className="font-display text-[16px] mb-4">Created this session</p>
        <p className="text-[12.5px] text-[var(--color-ink-soft)] mb-3">
          The API has no endpoint to list existing users, so this is just a running log of users you've created here.
        </p>
        {created.length === 0 ? (
          <p className="text-[13px] text-[var(--color-ink-soft)]">Nothing yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {created.map((u, i) => (
              <Card key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13.5px] font-semibold">{u.name}</p>
                  <p className="text-[11.5px] text-[var(--color-ink-soft)] font-mono">{u.empId}</p>
                </div>
                <span className="font-mono text-[11px] uppercase px-2 py-1 rounded-full bg-[var(--color-paper)] border border-[var(--color-line)]">
                  {u.role}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
