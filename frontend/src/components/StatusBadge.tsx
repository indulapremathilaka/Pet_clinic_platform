const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  SUSPENDED: "bg-slate-200 text-slate-700",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  OPEN: "bg-sky-100 text-sky-800",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STYLES[status] ?? "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
