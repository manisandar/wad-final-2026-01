// src/components/CreateCourseModal.jsx
import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function CreateCourseModal({ isOpen, onClose, onCourseCreated }) {
  const { authFetch } = useContext(UserContext);
  const [formData, setFormData] = useState({
    courseName: "",
    duration: 30,
    topicsInput: "",
    price: 3000,
    maxStudents: 20,
    status: "Open",
  });
  const [topics, setTopics] = useState(["Web Development", "React"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (formData.topicsInput.trim()) {
      if (!topics.includes(formData.topicsInput.trim())) {
        setTopics([...topics, formData.topicsInput.trim()]);
      }
      setFormData({ ...formData, topicsInput: "" });
    }
  };

  const handleRemoveTopic = (indexToRemove) => {
    setTopics(topics.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.courseName.trim()) {
      setError("Course name is required");
      return;
    }

    if (topics.length === 0) {
      setError("Please add at least one topic");
      return;
    }

    if (formData.duration <= 0) {
      setError("Duration must be greater than 0");
      return;
    }

    if (formData.maxStudents <= 0) {
      setError("Max students must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch("/course", {
        method: "POST",
        body: JSON.stringify({
          courseName: formData.courseName.trim(),
          duration: Number(formData.duration),
          topics: topics,
          price: Number(formData.price),
          maxStudents: Number(formData.maxStudents),
          status: formData.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create course");
      }

      onCourseCreated(data.course);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 transition-all">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-800">Create New Course</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. Modern Full-Stack Development"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Days) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Price (THB) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Max Student Capacity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm bg-white"
              >
                <option value="Open">Open (Enrollable)</option>
                <option value="Close">Close (Visible, No enrollment)</option>
                <option value="Cancel">Cancel (Hidden from students)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Topics (Multiple Allowed) *
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={formData.topicsInput}
                onChange={(e) => setFormData({ ...formData, topicsInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="Type a topic and click Add"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition text-sm"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
              >
                Add Topic
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {topics.length === 0 ? (
                <span className="text-xs text-slate-400">No topics added yet</span>
              ) : (
                topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(idx)}
                      className="ml-1.5 text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
