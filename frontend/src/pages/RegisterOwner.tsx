import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, extractErrorMessage } from "../api/client";

export default function RegisterOwner() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register/pet-owner", form);
      localStorage.setItem("petclinic_token", data.token);
      await refresh();
      navigate("/owner");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Create your pet owner account</h1>
      <p className="mb-8 text-sm text-slate-600">Sign up instantly and start asking clinics your questions.</p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div>
          <label className="label">Full name</label>
          <input
            required
            className="input"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Address (optional)</label>
          <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
