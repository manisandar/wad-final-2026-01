# CSX4107 Web Application Development - Final Examination

## Student Information
- **Student Name:** Min Khant Tin
- **Student ID:** 6726033
- **Section:** 542

---

## Live Deployments
- **Frontend App:** [https://react-frontend-weld-beta.vercel.app](https://react-frontend-weld-beta.vercel.app)
- **Backend API:** [https://next-backend-sandy.vercel.app](https://next-backend-sandy.vercel.app)
- **GitHub Repository:** [https://github.com/manisandar/wad-final-2026-01](https://github.com/manisandar/wad-final-2026-01)

---

## Test Credentials

### 1. Teachers (Role: `Teacher` • Password: `teacher123`)
| # | Username | Email | Password | Role |
|---|----------|-------|----------|------|
| 1 | `teacher-1` | `teacher-1@wad.ac.th` | `teacher123` | Teacher |
| 2 | `teacher-2` | `teacher-2@wad.ac.th` | `teacher123` | Teacher |
| 3 | `teacher-3` | `teacher-3@wad.ac.th` | `teacher123` | Teacher |
| 4 | `teacher-4` | `teacher-4@wad.ac.th` | `teacher123` | Teacher |
| 5 | `teacher-5` | `teacher-5@wad.ac.th` | `teacher123` | Teacher |

### 2. Students (Role: `Student` • Password: `student123`)
| # | Username | Email | Password | Role |
|---|----------|-------|----------|------|
| 1 | `student-1` | `student-1@wad.ac.th` | `student123` | Student |
| 2 | `student-2` | `student-2@wad.ac.th` | `student123` | Student |
| 3 | `student-3` | `student-3@wad.ac.th` | `student123` | Student |
| 4 | `student-4` | `student-4@wad.ac.th` | `student123` | Student |
| 5 | `student-5` | `student-5@wad.ac.th` | `student123` | Student |

---

## How to Run & Test

### 1. Backend Setup (`next-backend/`)
```bash
cd next-backend
npm install
# Set MONGODB_URI and JWT_SECRET in .env.local
npm run seed  # Populates MongoDB with test users and courses
npm run dev   # Runs API server on http://localhost:3000
```

### 2. Frontend Setup (`react-frontend/`)
```bash
cd react-frontend
npm install
# Ensure VITE_API_URL=http://localhost:3000/api in .env
npm run dev   # Runs Vite client on http://localhost:5173
```

---

## Testing Walkthrough

### Authentication
- Unauthenticated visitors are redirected to the Login page.
- Sign in using any test username/email and password.
- The navigation bar displays your username and role badge.
- Click **Logout** at any time to clear the session token.

### Teacher Flow (e.g. `teacher-1`)
- **My Courses:** Lists only the courses authored by the logged-in teacher.
- **Create Course:** Click **+ New Course**, specify title, duration, topics, price, seat capacity, and status.
- **Student Roster:** Click a course to inspect its details and view enrolled students.
- **Edit Restrictions:** Capacity cannot be set lower than the current number of enrolled students.
- **Delete Restrictions:** Deletion is blocked if any students are enrolled.
- **Ownership Security:** Logging in as `teacher-2` prevents viewing, modifying, or deleting courses created by `teacher-1` (returns `403 Forbidden`).

### Student Flow (e.g. `student-1`)
- **Course Catalog:** Displays all active courses (`Cancel` status courses are hidden).
- **Search & Filter:** Filter courses in real-time by course title or instructor name.
- **Enrollment Rules:**
  - Enrolling is permitted only when status is `Open` and seats remain.
  - Duplicate enrollment in the same course is blocked.
  - Courses with `Close` status cannot be enrolled in.
- **My Enrollments:** Displays the list of courses the student has enrolled in.
- **Verification:** Log back in as the teacher to verify that the student appears in the course's enrolled students table.
