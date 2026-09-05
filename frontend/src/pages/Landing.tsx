import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "Verified clinics only",
    body: "Every clinic on the platform is manually reviewed and approved by an administrator before they can answer a single question.",
    icon: "🩺",
  },
  {
    title: "Ask, don't guess",
    body: "Post a question about symptoms, vaccines, or diet and get a real answer from a registered veterinary clinic — not a forum stranger.",
    icon: "💬",
  },
  {
    title: "Track your pets",
    body: "Keep a simple profile for each of your pets so clinics have the context they need to give you better advice.",
    icon: "🐾",
  },
];

const STEPS = [
  { label: "Clinics apply", body: "A clinic submits its registration details for review." },
  { label: "Admin approves", body: "Our administrators verify and approve legitimate clinics." },
  { label: "Owners ask", body: "Pet owners post questions about their pet's health and care." },
  { label: "Clinics answer", body: "Approved clinics respond directly with expert guidance." },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <span className="w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              Sri Lanka's pet care network
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Connecting pet owners with{" "}
              <span className="text-brand-600">trusted veterinary clinics</span>
            </h1>
            <p className="text-lg text-slate-600">
              Ask about symptoms, vaccines, and diet — and get real answers from clinics that have been verified by
              our administrators. No guesswork, no anonymous advice.
            </p>
            <div className="flex flex-wrap gap-3">
              {!user && (
                <>
                  <Link to="/register" className="btn-primary px-6 py-3 text-base">
                    Get started free
                  </Link>
                  <Link to="/questions" className="btn-secondary px-6 py-3 text-base">
                    Browse Q&amp;A
                  </Link>
                </>
              )}
              {user && (
                <Link to="/questions" className="btn-primary px-6 py-3 text-base">
                  Browse Community Q&amp;A
                </Link>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="card w-full max-w-sm p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg">🐕</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nimal P.</p>
                  <p className="text-xs text-slate-500">Pet owner · Colombo</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-slate-700">
                "Is it normal for my dog to skip a vaccine dose? He missed his rabies booster by two weeks."
              </p>
              <div className="rounded-xl bg-brand-50 p-3">
                <p className="mb-1 text-xs font-semibold text-brand-700">Happy Paws Veterinary Clinic</p>
                <p className="text-sm text-slate-700">
                  "A short delay is generally fine — bring him in and we'll update his schedule."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-slate-900 sm:text-3xl">Why PetConnect Lanka?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-white sm:text-3xl">How it works</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.label} className="rounded-2xl bg-slate-800 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mb-1 font-semibold text-white">{step.label}</h3>
                <p className="text-sm text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">Are you a pet clinic?</h2>
        <p className="mb-6 text-slate-600">
          Register your clinic to answer questions from pet owners across Sri Lanka. Your application is reviewed by
          our admin team before you go live.
        </p>
        <Link to="/register/clinic" className="btn-primary px-6 py-3 text-base">
          Register your clinic
        </Link>
      </section>
    </div>
  );
}
