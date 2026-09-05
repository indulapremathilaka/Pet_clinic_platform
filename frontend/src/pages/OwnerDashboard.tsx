import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { Pet, QuestionItem } from "../types";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";

const emptyPet = { name: "", species: "", breed: "", ageYears: "", gender: "", notes: "" };

export default function OwnerDashboard() {
  const { petOwner } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPetForm, setShowPetForm] = useState(false);
  const [petForm, setPetForm] = useState(emptyPet);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    Promise.all([api.get("/pets"), api.get("/questions")]).then(([petsRes, qRes]) => {
      setPets(petsRes.data.pets);
      setQuestions(qRes.data.questions.filter((q: QuestionItem) => q.owner?.id === petOwner?.id));
      setLoading(false);
    });
  }

  useEffect(loadAll, [petOwner?.id]);

  async function handleAddPet(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/pets", {
        ...petForm,
        ageYears: petForm.ageYears ? Number(petForm.ageYears) : undefined,
        breed: petForm.breed || undefined,
        gender: petForm.gender || undefined,
        notes: petForm.notes || undefined,
      });
      setPetForm(emptyPet);
      setShowPetForm(false);
      loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePet(id: string) {
    if (!confirm("Remove this pet profile?")) return;
    await api.delete(`/pets/${id}`);
    loadAll();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Welcome, {petOwner?.fullName}</h1>
      <p className="mb-8 text-sm text-slate-600">Manage your pets and track your questions.</p>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My Pets</h2>
            <button onClick={() => setShowPetForm((s) => !s)} className="btn-secondary text-sm">
              {showPetForm ? "Cancel" : "+ Add pet"}
            </button>
          </div>

          {showPetForm && (
            <form onSubmit={handleAddPet} className="card mb-4 space-y-3 p-4">
              {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Name"
                  className="input"
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                />
                <input
                  required
                  placeholder="Species (e.g. Dog)"
                  className="input"
                  value={petForm.species}
                  onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                />
                <input
                  placeholder="Breed"
                  className="input"
                  value={petForm.breed}
                  onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Age (years)"
                  className="input"
                  value={petForm.ageYears}
                  onChange={(e) => setPetForm({ ...petForm, ageYears: e.target.value })}
                />
              </div>
              <select
                className="input"
                value={petForm.gender}
                onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}
              >
                <option value="">Gender (optional)</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? "Saving..." : "Save pet"}
              </button>
            </form>
          )}

          {pets.length === 0 ? (
            <div className="card p-6 text-center text-sm text-slate-500">No pets added yet.</div>
          ) : (
            <div className="space-y-3">
              {pets.map((p) => (
                <div key={p.id} className="card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.species}
                      {p.breed ? ` · ${p.breed}` : ""}
                      {p.ageYears ? ` · ${p.ageYears}y` : ""}
                    </p>
                  </div>
                  <button onClick={() => handleDeletePet(p.id)} className="text-xs font-medium text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My Questions</h2>
            <Link to="/owner/ask" className="btn-primary text-sm">
              + Ask a question
            </Link>
          </div>

          {questions.length === 0 ? (
            <div className="card p-6 text-center text-sm text-slate-500">You haven't asked anything yet.</div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <Link key={q.id} to={`/questions/${q.id}`} className="card block p-4 hover:border-brand-300">
                  <div className="mb-1 flex items-center gap-2">
                    <CategoryBadge category={q.category} />
                    {q.isResolved && <StatusBadge status="RESOLVED" />}
                  </div>
                  <p className="font-medium text-slate-900">{q.title}</p>
                  <p className="text-xs text-slate-500">{q.comments.length} answer(s)</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
