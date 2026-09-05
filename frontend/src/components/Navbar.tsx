import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PawLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-brand-600">
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="12" cy="4.5" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <circle cx="20.5" cy="12.5" r="2.2" />
      <path d="M12 10c-3.6 0-7 2.7-7 6.2 0 2 1.6 3.8 3.7 3.8.9 0 1.6-.3 2.3-.7.6-.4 1.3-.4 2 0 .7.4 1.4.7 2.3.7 2.1 0 3.7-1.8 3.7-3.8 0-3.5-3.4-6.2-7-6.2z" />
    </svg>
  );
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-brand-700" : "text-slate-600 hover:text-brand-700"}`;

export default function Navbar() {
  const { user, clinic, petOwner, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  function dashboardPath() {
    if (user?.role === "ADMIN") return "/admin";
    if (user?.role === "CLINIC") return "/clinic";
    if (user?.role === "PET_OWNER") return "/owner";
    return "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <PawLogo />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            PetConnect <span className="text-brand-600">Lanka</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/questions" className={linkClass}>
            Community Q&amp;A
          </NavLink>
          <NavLink to="/clinics" className={linkClass}>
            Find a Clinic
          </NavLink>
          {user && (
            <NavLink to={dashboardPath()} className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">
                {clinic?.name ?? petOwner?.fullName ?? user.email}
              </span>
              <button onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
