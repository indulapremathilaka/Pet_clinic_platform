import { Link } from "react-router-dom";

export default function RegisterChoice() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Join PetConnect Lanka</h1>
      <p className="mb-10 text-center text-sm text-slate-600">Choose the account type that fits you.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link to="/register/pet-owner" className="card group p-6 transition hover:border-brand-300 hover:shadow-md">
          <div className="mb-3 text-3xl">🐾</div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900 group-hover:text-brand-700">I'm a Pet Owner</h2>
          <p className="text-sm text-slate-600">
            Create pet profiles and ask registered clinics about symptoms, vaccines, diet, and more.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-700">Sign up instantly →</p>
        </Link>

        <Link to="/register/clinic" className="card group p-6 transition hover:border-brand-300 hover:shadow-md">
          <div className="mb-3 text-3xl">🏥</div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900 group-hover:text-brand-700">I'm a Pet Clinic</h2>
          <p className="text-sm text-slate-600">
            Register your clinic to answer pet owners' questions. Subject to admin review before activation.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-700">Submit registration →</p>
        </Link>
      </div>
    </div>
  );
}
