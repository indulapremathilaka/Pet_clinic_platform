import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-6xl font-extrabold text-brand-600">404</h1>
      <p className="text-lg text-slate-600">We couldn't find that page.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
