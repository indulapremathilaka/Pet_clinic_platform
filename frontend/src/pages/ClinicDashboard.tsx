import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { CommentItem } from "../types";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function ClinicDashboard() {
  const { clinic, refresh } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: clinic?.phone ?? "",
    address: clinic?.address ?? "",
    city: clinic?.city ?? "",
    description: clinic?.description ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/clinics/me/comments")
      .then(({ data }) => setComments(data.comments))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.patch("/clinics/me", form);
      await refresh();
      setEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!clinic) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">{clinic.name}</h1>
      <p className="mb-8 text-sm text-slate-600">Clinic dashboard</p>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Clinic profile</h2>
            <button onClick={() => setEditing((s) => !s)} className="btn-secondary text-sm">
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="card space-y-3 p-4">
              {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          ) : (
            <div className="card space-y-2 p-5 text-sm">
              <p>
                <span className="font-medium text-slate-700">Status: </span>
                <span className="text-emerald-600">{clinic.status}</span>
              </p>
              <p>
                <span className="font-medium text-slate-700">Phone: </span>
                {clinic.phone}
              </p>
              <p>
                <span className="font-medium text-slate-700">Address: </span>
                {clinic.address}, {clinic.city}
              </p>
              <p>
                <span className="font-medium text-slate-700">Description: </span>
                {clinic.description || "—"}
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Questions I've answered</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : comments.length === 0 ? (
            <div className="card p-6 text-center text-sm text-slate-500">
              You haven't answered any questions yet.{" "}
              <Link to="/questions" className="font-semibold text-brand-700 hover:underline">
                Browse open questions
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <Link key={c.id} to={`/questions/${c.question?.id}`} className="card block p-4 hover:border-brand-300">
                  <p className="font-medium text-slate-900">{c.question?.title}</p>
                  <p className="line-clamp-2 text-xs text-slate-500">{c.body}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
