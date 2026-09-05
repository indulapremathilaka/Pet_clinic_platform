import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petclinic_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: { path: string; message: string }[] } | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(", ");
    if (data?.message) return data.message;
  }
  return "Something went wrong. Please try again.";
}
