// src/pages/TeacherDashboard.jsx
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import CreateCourseModal from "../components/CreateCourseModal";
import EditCourseModal from "../components/EditCourseModal";
import CourseDetailsModal from "../components/CourseDetailsModal";

export default function TeacherDashboard() {
  const { user, authFetch } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "info" });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch teacher's own courses
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authFetch("/course?mine=true");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to load courses");
      }
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleOpenDetails = (course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleDeleteCourse = async (course) => {
    const enrolledCount = course.enrolledCount ?? course.enrolledStudents?.length ?? 0;
    if (enrolledCount > 0) {
      alert(`Cannot delete "${course.courseName}" because ${enrolledCount} student(s) are enrolled.`);
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete the course "${course.courseName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await authFetch(`/course/${course.id || course._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete course");
      }

      setIsDetailsOpen(false);
      fetchMyCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCourseCreated = () => {
    fetchMyCourses();
  };

  const handleCourseUpdated = () => {
    fetchMyCourses();
  };

  const totalEnrolled = courses.reduce(
    (sum, c) => sum + (c.enrolledCount ?? c.enrolledStudents?.length ?? 0),
    0,
  );
  const openCoursesCount = courses.filter((c) => c.status === "Open").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Stats Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-700">{user?.username}</span>. Manage your created courses and inspect student enrollments.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <span className="mr-1.5 text-base font-bold">+</span> Create New Course
          </button>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Courses
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">{courses.length}</div>
            <div className="text-xs text-slate-500 mt-1">Created under your account</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Open for Enrollment
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{openCoursesCount}</div>
            <div className="text-xs text-slate-500 mt-1">Accepting student applications</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Students Enrolled
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{totalEnrolled}</div>
            <div className="text-xs text-slate-500 mt-1">Across all your courses</div>
          </div>
        </div>

        {/* Courses Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">My Course Offerings</h2>
            <button
              onClick={fetchMyCourses}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading your courses...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600">
              <p className="font-semibold">Failed to load courses</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                +
              </div>
              <h3 className="text-base font-bold text-slate-800">No courses yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                You haven&apos;t created any courses yet. Start by clicking the button below.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Course Name & Topics</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Enrollments</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => {
                    const enrolledCount =
                      course.enrolledCount ?? course.enrolledStudents?.length ?? 0;
                    const canDelete = enrolledCount === 0;

                    return (
                      <tr key={course.id || course._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm">
                            {course.courseName}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {course.topics?.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                            {course.topics?.length > 3 && (
                              <span className="px-1.5 py-0.5 text-slate-400 text-[11px]">
                                +{course.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={course.status} />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {course.duration} days
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                          ฿{Number(course.price).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700">
                              {enrolledCount} / {course.maxStudents}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                enrolledCount >= course.maxStudents
                                  ? "bg-rose-50 text-rose-600 font-semibold"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {course.maxStudents - enrolledCount} seats left
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleOpenDetails(course)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                          >
                            Details & Students ({enrolledCount})
                          </button>

                          <button
                            onClick={() => handleOpenEdit(course)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course)}
                            disabled={!canDelete}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              canDelete
                                ? "text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                                : "text-slate-300 bg-slate-50 cursor-not-allowed"
                            }`}
                            title={
                              canDelete
                                ? "Delete course"
                                : "Cannot delete course: Students are currently enrolled."
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateCourseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      <EditCourseModal
        isOpen={isEditOpen}
        course={selectedCourse}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCourse(null);
        }}
        onCourseUpdated={handleCourseUpdated}
      />

      <CourseDetailsModal
        isOpen={isDetailsOpen}
        course={selectedCourse}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCourse(null);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCourse}
      />
    </div>
  );
}
