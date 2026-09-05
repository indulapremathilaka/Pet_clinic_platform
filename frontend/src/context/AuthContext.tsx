import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { api, extractErrorMessage } from "../api/client";
import { AuthUser, Clinic, PetOwner } from "../types";

interface AuthState {
  user: AuthUser | null;
  clinic: Clinic | null;
  petOwner: PetOwner | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [petOwner, setPetOwner] = useState<PetOwner | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("petclinic_token");
    if (!token) {
      setUser(null);
      setClinic(null);
      setPetOwner(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setClinic(data.clinic ?? null);
      setPetOwner(data.petOwner ?? null);
    } catch {
      localStorage.removeItem("petclinic_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("petclinic_token", data.token);
      setUser(data.user);
      setClinic(data.clinic ?? null);
      setPetOwner(data.petOwner ?? null);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }

  function logout() {
    localStorage.removeItem("petclinic_token");
    setUser(null);
    setClinic(null);
    setPetOwner(null);
  }

  return (
    <AuthContext.Provider value={{ user, clinic, petOwner, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
