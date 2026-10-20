// src/app/api/course/[course_id]/enroll/route.js

import { getDb } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, handleOptions, printExceptionLog } from "@/lib/utils";
import { ObjectId } from "mongodb";

function getCourseQuery(course_id) {
  try {
    return { _id: new ObjectId(course_id) };
  } catch {
    return { _id: course_id };
  }
}

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req, { params }) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return errorResponse("Authentication required to enroll", 401, req);
    }

    // Role check: Only students can enroll
    if (user.role !== "Student") {
      return errorResponse("Forbidden: Only students can enroll in courses", 403, req);
    }

    const { course_id } = await params;
    const db = await getDb();
    const course = await db.collection("courses").findOne(getCourseQuery(course_id));

    if (!course) {
      return errorResponse("Course not found", 404, req);
    }

    // Rule 1: Course status must be Open
    // "Open: visible to Students and available for enrollment when seats remain."
    // "Close: visible to Students but not available for enrollment."
    // "Cancel: not displayed in the Student course list and not available for enrollment."
    if (course.status !== "Open") {
      return errorResponse(
        `Cannot enroll: Course is not open for enrollment (Current status: ${course.status})`,
        400,
        req,
      );
    }

    const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];

    // Rule 2: A Student cannot enroll in the same course more than once
    const alreadyEnrolled = enrolledStudents.some(
      (s) => s.studentId === user.id || s.email === user.email,
    );
    if (alreadyEnrolled) {
      return errorResponse("You are already enrolled in this course", 400, req);
    }

    // Rule 3: Seats must still be available according to Max Student
    if (enrolledStudents.length >= course.maxStudents) {
      return errorResponse(
        `Cannot enroll: Course has reached maximum capacity (${course.maxStudents} students)`,
        400,
        req,
      );
    }

    const enrollmentRecord = {
      studentId: user.id,
      username: user.username,
      email: user.email,
      enrolledAt: new Date(),
    };

    await db.collection("courses").updateOne(getCourseQuery(course_id), {
      $push: { enrolledStudents: enrollmentRecord },
      $set: { updatedAt: new Date() },
    });

    const updatedCourse = await db.collection("courses").findOne(getCourseQuery(course_id));

    return successResponse(
      {
        message: "Successfully enrolled in the course",
        course: {
          id: updatedCourse._id.toString(),
          _id: updatedCourse._id.toString(),
          ...updatedCourse,
          enrolledCount: updatedCourse.enrolledStudents.length,
          availableSeats: Math.max(
            0,
            updatedCourse.maxStudents - updatedCourse.enrolledStudents.length,
          ),
        },
      },
      200,
      req,
    );
  } catch (error) {
    printExceptionLog("Course Enrollment", error);
    return errorResponse("Failed to enroll in course", 500, req);
  }
}
