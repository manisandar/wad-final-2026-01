// src/pages/StudentCatalog.jsx
import { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import CourseDetailsModal from "../components/CourseDetailsModal";

export default function StudentCatalog() {
  const { user, authFetch } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [enrollingId, setEnrollingId] = useState(null);

  // Modal
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Load available courses and student's current enrollments
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch available courses (backend filters out Cancel courses automatically for general listing)
      const resCourses = await authFetch("/course");
      const dataCourses = await resCourses.json();

      if (!resCourses.ok) {
        throw new Error(dataCourses.message || "Failed to load courses");
      }

      // 2. Fetch my enrolled courses to know which ones I already enrolled in
      const resEnrolled = await authFetch("/course/enrolled");
      if (resEnrolled.ok) {
        const dataEnrolled = await resEnrolled.json();
        const ids = new Set((dataEnrolled.courses || []).map((c) => c.id || c._id));
        setEnrolledCourseIds(ids);
      }

      setCourses(dataCourses.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter courses by part of course name or teacher name in real time
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const term = searchTerm.toLowerCase().trim();
    return courses.filter((c) => {
      const matchName = (c.courseName || "").toLowerCase().includes(term);
      const matchTeacher = (c.teacherName || "").toLowerCase().includes(term);
      const matchTopic = (c.topics || []).some((t) => t.toLowerCase().includes(term));
      return matchName || matchTeacher || matchTopic;
    });
  }, [courses, searchTerm]);

  const handleEnroll = async (course) => {
    const courseId = course.id || course._id;
    const enrolledCount = course.enrolledCount ?? course.enrolledStudents?.length ?? 0;
    const isFull = enrolledCount >= course.maxStudents;

    // Frontend validations according to business rules
    if (course.status !== "Open") {
      alert(`Cannot enroll: "${course.courseName}" has status "${course.status}". Only Open courses allow enrollment.`);
      return;
    }

    if (isFull) {
      alert(`Cannot enroll: "${course.courseName}" has reached maximum capacity (${course.maxStudents} students).`);
      return;
    }

    if (enrolledCourseIds.has(courseId)) {
      alert(`You are already enrolled in "${course.courseName}".`);
      return;
    }

    try {
      setEnrollingId(courseId);
      const res = await authFetch(`/course/${courseId}/enroll`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Enrollment failed");
      }

      // Update local state
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      if (selectedCourse && (selectedCourse.id === courseId || selectedCourse._id === courseId)) {
        setIsDetailsOpen(false);
      }
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrollingId(null);
    }
  };

  const handleOpenDetails = (course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Course Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and enroll in available online courses. Filter by course title or instructor.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter courses by name, topic, or teacher..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Open (Enrollable)
            </span>
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
              Close (View Only)
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-700">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading available courses...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-white rounded-2xl border border-rose-200">
            <p className="font-semibold">Error Loading Courses</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="text-base font-bold text-slate-800">No courses match your filter</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try searching for another term or clear the search filter.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const courseId = course.id || course._id;
              const enrolledCount =
                course.enrolledCount ?? course.enrolledStudents?.length ?? 0;
              const seatsLeft = Math.max(0, (course.maxStudents || 0) - enrolledCount);
              const isFull = seatsLeft === 0;
              const isAlreadyEnrolled = enrolledCourseIds.has(courseId);
              const isOpen = course.status === "Open";
              const canEnroll = isOpen && !isFull && !isAlreadyEnrolled;

              return (
                <div
                  key={courseId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header: Status & Price */}
                    <div className="flex justify-between items-center mb-3">
                      <StatusBadge status={course.status} />
                      <span className="text-base font-black text-indigo-600">
                        ฿{Number(course.price).toLocaleString()}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                      {course.courseName}
                    </h3>

                    {/* Instructor & Duration */}
                    <div className="flex items-center text-xs text-slate-500 space-x-2 mb-3">
                      <span className="font-semibold text-slate-700">
                        👨‍🏫 {course.teacherName || "Instructor"}
                      </span>
                      <span>•</span>
                      <span>⏱️ {course.duration} days</span>
                    </div>

                    {/* Topics chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                      {course.topics?.slice(0, 3).map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          {topic}
                        </span>
                      ))}
                      {course.topics?.length > 3 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[11px]">
                          +{course.topics.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Capacity Indicator */}
                    <div className="pt-3 border-t border-slate-100 mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Class Capacity</span>
                        <span className="font-bold text-slate-800">
                          {enrolledCount} / {course.maxStudents} enrolled
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull
                              ? "bg-rose-500"
                              : seatsLeft <= 2
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              ((enrolledCount || 0) / (course.maxStudents || 1)) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[11px]">
                        <span
                          className={
                            isFull
                              ? "text-rose-600 font-semibold"
                              : seatsLeft <= 2
                              ? "text-amber-600 font-semibold"
                              : "text-slate-500"
                          }
                        >
                          {isFull ? "No seats left" : `${seatsLeft} seats available`}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleOpenDetails(course)}
                        className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition"
                      >
                        View Details
                      </button>

                      {isAlreadyEnrolled ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 cursor-not-allowed"
                        >
                          ✓ Enrolled
                        </button>
                      ) : !isOpen ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed"
                          title="Course is closed for enrollment"
                        >
                          Closed
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-200 cursor-not-allowed"
                          title="All seats are booked"
                        >
                          Full
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course)}
                          disabled={enrollingId === courseId}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
                        >
                          {enrollingId === courseId ? "Enrolling..." : "Enroll Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Details Modal */}
      <CourseDetailsModal
        isOpen={isDetailsOpen}
        course={selectedCourse}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCourse(null);
        }}
        onEnroll={handleEnroll}
        enrolling={enrollingId === (selectedCourse?.id || selectedCourse?._id)}
        isEnrolled={enrolledCourseIds.has(selectedCourse?.id || selectedCourse?._id)}
      />
    </div>
  );
}
