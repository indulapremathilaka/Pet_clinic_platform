import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterChoice from "./pages/RegisterChoice";
import RegisterClinic from "./pages/RegisterClinic";
import RegisterOwner from "./pages/RegisterOwner";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import AskQuestion from "./pages/AskQuestion";
import ClinicsDirectory from "./pages/ClinicsDirectory";
import AdminDashboard from "./pages/AdminDashboard";
import ClinicDashboard from "./pages/ClinicDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/clinic" element={<RegisterClinic />} />
          <Route path="/register/pet-owner" element={<RegisterOwner />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/clinics" element={<ClinicsDirectory />} />

          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={["PET_OWNER"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/ask"
            element={
              <ProtectedRoute roles={["PET_OWNER"]}>
                <AskQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinic"
            element={
              <ProtectedRoute roles={["CLINIC"]}>
                <ClinicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        Built for SE204.3 — Development of Enterprise Applications I · National School of Business Management
      </footer>
    </div>
  );
}
