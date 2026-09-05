import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { QuestionItem, QuestionCategory } from "../types";
import Spinner from "../components/Spinner";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const CATEGORIES: { value: QuestionCategory | ""; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "DISEASE", label: "Disease & Symptoms" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "BEHAVIOR", label: "Behavior" },
  { value: "GROOMING", label: "Grooming" },
  { value: "GENERAL", label: "General" },
];

export default function Questions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<QuestionCategory | "">("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (search) params.search = search;

    const timeout = setTimeout(() => {
      api
        .get("/questions", { params })
        .then(({ data }) => setQuestions(data.questions))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [category, search]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Q&amp;A</h1>
          <p className="text-sm text-slate-600">Questions from pet owners, answered by verified clinics.</p>
        </div>
        {user?.role === "PET_OWNER" && (
          <Link to="/owner/ask" className="btn-primary">
            Ask a question
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input sm:max-w-xs" value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory | "")}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">No questions found yet.</div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Link key={q.id} to={`/questions/${q.id}`} className="card block p-5 transition hover:border-brand-300 hover:shadow-md">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <CategoryBadge category={q.category} />
                {q.isResolved && <StatusBadge status="RESOLVED" />}
              </div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">{q.title}</h2>
              <p className="mb-3 line-clamp-2 text-sm text-slate-600">{q.body}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Asked by {q.owner?.fullName ?? "a pet owner"}
                  {q.pet ? ` about ${q.pet.name} (${q.pet.species})` : ""}
                </span>
                <span>{q.comments.length} answer{q.comments.length === 1 ? "" : "s"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
