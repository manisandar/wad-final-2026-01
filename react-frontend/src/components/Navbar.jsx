// src/components/Navbar.jsx
import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Navbar() {
  const { user, logout, isTeacher, isStudent } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              C
            </div>
            <div>
              <Link to="/" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition">
                CourseService
              </Link>
            </div>
          </div>

          {/* Navigation Links based on role */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {isTeacher && (
                <>
                  <Link
                    to="/teacher/courses"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive("/teacher/courses") || isActive("/")
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    My Courses
                  </Link>
                </>
              )}

              {isStudent && (
                <>
                  <Link
                    to="/student/catalog"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive("/student/catalog") || isActive("/")
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Browse Courses
                  </Link>
                  <Link
                    to="/student/enrolled"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive("/student/enrolled")
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    My Enrolled Courses
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800">{user.username}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    isTeacher
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {user.role}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition"
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
