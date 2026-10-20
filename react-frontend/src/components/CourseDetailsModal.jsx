// src/components/CourseDetailsModal.jsx
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import StatusBadge from "./StatusBadge";

export default function CourseDetailsModal({
  isOpen,
  onClose,
  course,
  onEdit,
  onDelete,
  onEnroll,
  enrolling,
  isEnrolled,
}) {
  const { user, isTeacher, isStudent } = useContext(UserContext);

  if (!isOpen || !course) return null;

  const enrolledStudents = Array.isArray(course.enrolledStudents)
    ? course.enrolledStudents
    : [];
  const enrolledCount = course.enrolledCount ?? enrolledStudents.length;
  const isOwner = isTeacher && (course.teacherId === user?.id || course.teacherEmail === user?.email);
  const seatsRemaining = Math.max(0, (course.maxStudents || 0) - enrolledCount);
  const isFull = seatsRemaining === 0;
  const isOpenStatus = course.status === "Open";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <StatusBadge status={course.status} />
              <span className="text-xs text-slate-500">ID: {course.id || course._id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{course.courseName}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs text-slate-500 font-medium">Instructor</div>
              <div className="text-sm font-semibold text-slate-800">{course.teacherName || "Teacher"}</div>
              <div className="text-xs text-slate-400 truncate">{course.teacherEmail}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Duration</div>
              <div className="text-sm font-semibold text-slate-800">{course.duration} Days</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tuition Price</div>
              <div className="text-sm font-semibold text-indigo-600">
                ฿{Number(course.price).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Enrollment Capacity</div>
              <div className="text-sm font-semibold text-slate-800">
                {enrolledCount} / {course.maxStudents}
              </div>
              <div className="text-xs text-slate-500">
                {seatsRemaining > 0 ? `${seatsRemaining} seats left` : "Course Full"}
              </div>
            </div>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Curriculum Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.topics && course.topics.length > 0 ? (
                course.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No topics listed</span>
              )}
            </div>
          </div>

          {/* Enrolled Students Section - Required by PDF:
              "The course details must also display the enrolled Students." */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enrolled Students ({enrolledStudents.length})
              </h3>
              {enrolledStudents.length > 0 && isOwner && (
                <span className="text-xs text-amber-600 font-medium">
                  Note: Course cannot be deleted while students are enrolled.
                </span>
              )}
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
                <p className="text-sm text-slate-500">No students enrolled in this course yet.</p>
                {isOwner && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Course can be deleted or updated freely.
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5">#</th>
                      <th className="px-3.5 py-2.5">Student Username</th>
                      <th className="px-3.5 py-2.5">Email</th>
                      <th className="px-3.5 py-2.5">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {enrolledStudents.map((st, index) => (
                      <tr key={index} className="hover:bg-slate-50/70 transition">
                        <td className="px-3.5 py-2 text-slate-400">{index + 1}</td>
                        <td className="px-3.5 py-2 font-medium text-slate-800">
                          {st.username || "Student"}
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">{st.email}</td>
                        <td className="px-3.5 py-2 text-slate-500">
                          {st.enrolledAt
                            ? new Date(st.enrolledAt).toLocaleDateString()
                            : "Enrolled"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>

          <div className="flex space-x-2">
            {/* Teacher Actions */}
            {isOwner && (
              <>
                <button
                  onClick={() => onDelete(course)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    enrolledCount > 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                  }`}
                  title={
                    enrolledCount > 0
                      ? "Cannot delete: students are enrolled"
                      : "Delete course"
                  }
                >
                  Delete Course
                </button>
                <button
                  onClick={() => onEdit(course)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition"
                >
                  Edit Course
                </button>
              </>
            )}

            {/* Student Enrollment Action */}
            {isStudent && (
              <>
                {isEnrolled ? (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-semibold flex items-center">
                    ✓ Enrolled
                  </span>
                ) : !isOpenStatus ? (
                  <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium">
                    Enrollment Closed ({course.status})
                  </span>
                ) : isFull ? (
                  <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium">
                    Course Full
                  </span>
                ) : (
                  <button
                    onClick={() => onEnroll(course)}
                    disabled={enrolling}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition disabled:opacity-50"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
