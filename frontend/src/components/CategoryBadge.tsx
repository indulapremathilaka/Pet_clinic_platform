const LABELS: Record<string, string> = {
  VACCINATION: "Vaccination",
  DISEASE: "Disease & Symptoms",
  NUTRITION: "Nutrition",
  BEHAVIOR: "Behavior",
  GROOMING: "Grooming",
  GENERAL: "General",
};

const COLORS: Record<string, string> = {
  VACCINATION: "bg-violet-100 text-violet-800",
  DISEASE: "bg-rose-100 text-rose-800",
  NUTRITION: "bg-lime-100 text-lime-800",
  BEHAVIOR: "bg-sky-100 text-sky-800",
  GROOMING: "bg-fuchsia-100 text-fuchsia-800",
  GENERAL: "bg-slate-100 text-slate-700",
};

export default function CategoryBadge({ category }: { category: string }) {
  return <span className={`badge ${COLORS[category] ?? COLORS.GENERAL}`}>{LABELS[category] ?? category}</span>;
}
