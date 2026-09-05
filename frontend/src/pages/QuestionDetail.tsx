import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { QuestionItem } from "../types";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, clinic, petOwner } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!id) return;
    setLoading(true);
    api
      .get(`/questions/${id}`)
      .then(({ data }) => setQuestion(data.question))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !commentBody.trim()) return;
    setError(null);
    setPosting(true);
    try {
      await api.post(`/questions/${id}/comments`, { body: commentBody });
      setCommentBody("");
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  async function handleResolveToggle() {
    if (!id) return;
    await api.patch(`/questions/${id}/resolve`);
    load();
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this question permanently?")) return;
    await api.delete(`/questions/${id}`);
    navigate("/questions");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!question) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">Question not found.</div>;
  }

  const isAuthor = petOwner && question.owner?.id === petOwner.id;
  const canDelete = isAuthor || user?.role === "ADMIN";
  const canAnswer = user?.role === "CLINIC" && clinic?.status === "APPROVED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={question.category} />
          {question.isResolved && <StatusBadge status="RESOLVED" />}
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">{question.title}</h1>
        <p className="mb-4 whitespace-pre-wrap text-slate-700">{question.body}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span>
            Asked by {question.owner?.fullName ?? "a pet owner"}
            {question.pet ? ` about ${question.pet.name} (${question.pet.species})` : ""}
          </span>
          <div className="flex gap-2">
            {isAuthor && (
              <button onClick={handleResolveToggle} className="btn-secondary text-xs">
                Mark as {question.isResolved ? "unresolved" : "resolved"}
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="btn-danger text-xs">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {question.comments.length} Answer{question.comments.length === 1 ? "" : "s"}
        </h2>

        {question.comments.length === 0 && (
          <p className="mb-6 text-sm text-slate-500">No clinic has answered yet.</p>
        )}

        <div className="space-y-4">
          {question.comments.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm">🏥</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.clinic?.name}</p>
                  <p className="text-xs text-slate-500">{c.clinic?.city}</p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
            </div>
          ))}
        </div>

        {canAnswer && (
          <form onSubmit={handleComment} className="card mt-6 space-y-3 p-5">
            {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
            <label className="label">Answer as {clinic?.name}</label>
            <textarea
              className="input"
              rows={4}
              required
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your professional advice..."
            />
            <button type="submit" disabled={posting} className="btn-primary">
              {posting ? "Posting..." : "Post answer"}
            </button>
          </form>
        )}

        {!user && (
          <p className="mt-6 text-center text-sm text-slate-500">
            <a href="/login" className="font-semibold text-brand-700 hover:underline">
              Log in
            </a>{" "}
            as a clinic to answer this question.
          </p>
        )}
      </div>
    </div>
  );
}
