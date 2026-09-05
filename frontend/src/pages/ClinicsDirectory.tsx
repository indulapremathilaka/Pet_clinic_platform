import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Clinic } from "../types";
import Spinner from "../components/Spinner";

export default function ClinicsDirectory() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/clinics")
      .then(({ data }) => setClinics(data.clinics))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Find a clinic</h1>
      <p className="mb-8 text-sm text-slate-600">Browse verified veterinary clinics registered on PetConnect Lanka.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : clinics.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">No approved clinics yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clinics.map((c) => (
            <div key={c.id} className="card p-5">
              <h2 className="mb-1 text-lg font-semibold text-slate-900">{c.name}</h2>
              <p className="mb-3 text-sm text-slate-600">{c.description || "No description provided."}</p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>📍 {c.address}, {c.city}</p>
                <p>📞 {c.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
