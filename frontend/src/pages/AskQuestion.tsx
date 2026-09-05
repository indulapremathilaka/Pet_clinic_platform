import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { Pet, QuestionCategory } from "../types";

const CATEGORIES: { value: QuestionCategory; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "DISEASE", label: "Disease & Symptoms" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "BEHAVIOR", label: "Behavior" },
  { value: "GROOMING", label: "Grooming" },
];

export default function AskQuestion() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<QuestionCategory>("GENERAL");
  const [petId, setPetId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/pets").then(({ data }) => setPets(data.pets));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/questions", { title, body, category, petId: petId || undefined });
      navigate(`/questions/${data.question.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Ask a question</h1>
      <p className="mb-8 text-sm text-slate-600">Your question will be visible to all approved clinics.</p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div>
          <label className="label">Title</label>
          <input
            required
            minLength={5}
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Is it normal for my cat to sneeze after eating?"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Related pet (optional)</label>
            <select className="input" value={petId} onChange={(e) => setPetId(e.target.value)}>
              <option value="">None</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Details</label>
          <textarea
            required
            minLength={10}
            rows={6}
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the symptoms, timeline, and anything else a clinic should know..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Posting..." : "Post question"}
        </button>
      </form>
    </div>
  );
}
