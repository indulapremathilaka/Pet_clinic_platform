import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";

const initialState = {
  name: "",
  email: "",
  password: "",
  registrationNo: "",
  phone: "",
  address: "",
  city: "",
  description: "",
};

export default function RegisterClinic() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof typeof initialState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/register/clinic", form);
      setSubmitted(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Request submitted</h1>
        <p className="mb-8 text-sm text-slate-600">
          Thanks! Your clinic registration is now pending review. You'll be able to log in as soon as an
          administrator approves your request.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Register your clinic</h1>
      <p className="mb-8 text-sm text-slate-600">
        Submit your details below. An administrator will review your request before you can log in.
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Clinic name</label>
            <input required className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label className="label">Registration number (optional)</label>
            <input
              className="input"
              value={form.registrationNo}
              onChange={(e) => update("registrationNo", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input required className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label className="label">City</label>
            <input required className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <input required className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Tell pet owners what services your clinic offers..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Submitting..." : "Submit registration request"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
