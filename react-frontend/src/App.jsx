// src/App.jsx

import { useContext } from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentCatalog from "./pages/StudentCatalog";
import StudentEnrolled from "./pages/StudentEnrolled";
import ProtectedRoute from "./components/ProtectedRoute";

function HomeRedirect() {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "Teacher") {
    return <Navigate to="/teacher/courses" replace />;
  }

  return <Navigate to="/student/catalog" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Teacher Routes */}
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/catalog"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/enrolled"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentEnrolled />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </HashRouter>
  );
}
