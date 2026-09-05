import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Clinic, DashboardStats, PetOwner } from "../types";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";

type Tab = "requests" | "clinics" | "owners";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("requests");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [owners, setOwners] = useState<PetOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function loadStats() {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }

  function loadClinics(status: string) {
    setLoading(true);
    api
      .get("/admin/clinics", { params: { status } })
      .then(({ data }) => setClinics(data.clinics))
      .finally(() => setLoading(false));
  }

  function loadOwners() {
    setLoading(true);
    api
      .get("/admin/pet-owners")
      .then(({ data }) => setOwners(data.petOwners))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === "requests" || tab === "clinics") {
      loadClinics(tab === "requests" ? "PENDING" : statusFilter);
    } else {
      loadOwners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  async function approve(id: string) {
    await api.patch(`/admin/clinics/${id}/approve`);
    loadClinics(tab === "requests" ? "PENDING" : statusFilter);
    loadStats();
  }

  async function reject(id: string) {
    await api.patch(`/admin/clinics/${id}/reject`, { reason: rejectReason || undefined });
    setRejectingId(null);
    setRejectReason("");
    loadClinics(tab === "requests" ? "PENDING" : statusFilter);
    loadStats();
  }

  async function suspend(id: string) {
    if (!confirm("Suspend this clinic? They will no longer be able to log in.")) return;
    await api.patch(`/admin/clinics/${id}/suspend`);
    loadClinics(statusFilter);
    loadStats();
  }

  async function deleteAccount(userId: string, label: string) {
    if (!confirm(`Permanently delete ${label}'s account and all associated data?`)) return;
    await api.delete(`/admin/users/${userId}`);
    if (tab === "owners") loadOwners();
    else loadClinics(tab === "requests" ? "PENDING" : statusFilter);
    loadStats();
  }

  async function toggleActive(userId: string) {
    await api.patch(`/admin/users/${userId}/toggle-active`);
    if (tab === "owners") loadOwners();
    else loadClinics(tab === "requests" ? "PENDING" : statusFilter);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Admin dashboard</h1>
      <p className="mb-8 text-sm text-slate-600">Review clinics and manage all accounts on the platform.</p>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Pending requests" value={stats.pendingClinics} highlight />
          <StatTile label="Approved clinics" value={stats.approvedClinics} />
          <StatTile label="Pet owners" value={stats.totalOwners} />
          <StatTile label="Questions asked" value={stats.totalQuestions} />
        </div>
      )}

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {(
          [
            { key: "requests", label: `Pending requests${stats ? ` (${stats.pendingClinics})` : ""}` },
            { key: "clinics", label: "All clinics" },
            { key: "owners", label: "Pet owners" },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : tab === "owners" ? (
        <div className="space-y-3">
          {owners.length === 0 && <div className="card p-6 text-center text-sm text-slate-500">No pet owners yet.</div>}
          {owners.map((o) => (
            <div key={o.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-slate-900">{o.fullName}</p>
                <p className="text-xs text-slate-500">
                  {o.user?.email} · {o.pets?.length ?? 0} pet(s) · {o.questionCount ?? 0} question(s)
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(o.user!.id)} className="btn-secondary text-xs">
                  {o.user?.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => deleteAccount(o.user!.id, o.fullName)} className="btn-danger text-xs">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {tab === "clinics" && (
            <div className="mb-4">
              <select className="input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          )}

          <div className="space-y-3">
            {clinics.length === 0 && (
              <div className="card p-6 text-center text-sm text-slate-500">No clinics in this view.</div>
            )}
            {clinics.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      {c.status && <StatusBadge status={c.status} />}
                    </div>
                    <p className="text-xs text-slate-500">
                      {c.user?.email} · {c.phone} · {c.address}, {c.city}
                    </p>
                    {c.description && <p className="mt-1 text-sm text-slate-600">{c.description}</p>}
                    {c.rejectionReason && (
                      <p className="mt-1 text-xs text-rose-600">Rejection reason: {c.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.status === "PENDING" && (
                      <>
                        <button onClick={() => approve(c.id)} className="btn-primary text-xs">
                          Approve
                        </button>
                        <button onClick={() => setRejectingId(c.id)} className="btn-secondary text-xs">
                          Reject
                        </button>
                      </>
                    )}
                    {c.status === "APPROVED" && (
                      <button onClick={() => suspend(c.id)} className="btn-secondary text-xs">
                        Suspend
                      </button>
                    )}
                    {c.status === "SUSPENDED" && (
                      <button onClick={() => approve(c.id)} className="btn-primary text-xs">
                        Reinstate
                      </button>
                    )}
                    <button onClick={() => toggleActive(c.user!.id)} className="btn-secondary text-xs">
                      {c.user?.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => deleteAccount(c.user!.id, c.name)} className="btn-danger text-xs">
                      Delete
                    </button>
                  </div>
                </div>

                {rejectingId === c.id && (
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <input
                      className="input"
                      placeholder="Reason for rejection (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button onClick={() => reject(c.id)} className="btn-danger text-xs">
                      Confirm reject
                    </button>
                    <button onClick={() => setRejectingId(null)} className="btn-secondary text-xs">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight && value > 0 ? "border-amber-300 bg-amber-50" : ""}`}>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
