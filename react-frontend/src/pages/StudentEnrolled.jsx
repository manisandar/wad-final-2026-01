// src/pages/StudentEnrolled.jsx
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import CourseDetailsModal from "../components/CourseDetailsModal";

export default function StudentEnrolled() {
  const { user, authFetch } = useContext(UserContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authFetch("/course/enrolled");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load enrolled courses");
      }
      setEnrolledCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const handleOpenDetails = (course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              My Enrolled Courses
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Courses you have successfully enrolled in as{" "}
              <span className="font-semibold text-slate-700">{user?.username}</span>.
            </p>
          </div>

          <Link
            to="/student/catalog"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Browse More Courses
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading your enrollments...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-white rounded-2xl border border-rose-200">
            <p className="font-semibold">Error Loading Enrolled Courses</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="text-base font-bold text-slate-800">You haven&apos;t enrolled in any courses yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              Explore available courses and join classes that match your interests.
            </p>
            <Link
              to="/student/catalog"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
            >
              Browse Course Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const myEnrollment =
                course.myEnrollment ||
                course.enrolledStudents?.find(
                  (s) => s.studentId === user?.id || s.email === user?.email,
                );

              return (
                <div
                  key={course.id || course._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <StatusBadge status={course.status} />
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Enrolled
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                      {course.courseName}
                    </h3>

                    <div className="flex items-center text-xs text-slate-500 space-x-2 mb-3">
                      <span className="font-semibold text-slate-700">
                        👨‍🏫 {course.teacherName || "Instructor"}
                      </span>
                      <span>•</span>
                      <span>⏱️ {course.duration} days</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                      {course.topics?.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 mb-4 text-xs text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Enrollment Date:</span>
                        <span className="font-semibold text-slate-700">
                          {myEnrollment?.enrolledAt
                            ? new Date(myEnrollment.enrolledAt).toLocaleDateString()
                            : "Enrolled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tuition Paid:</span>
                        <span className="font-bold text-indigo-600">
                          ฿{Number(course.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenDetails(course)}
                      className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition"
                    >
                      View Course Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CourseDetailsModal
        isOpen={isDetailsOpen}
        course={selectedCourse}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCourse(null);
        }}
        isEnrolled={true}
      />
    </div>
  );
}
