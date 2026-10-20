// src/app/api/course/enrolled/route.js

import { getDb } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, handleOptions, printExceptionLog } from "@/lib/utils";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return errorResponse("Authentication required", 401, req);
    }

    if (user.role !== "Student") {
      return errorResponse("Forbidden: Only students have enrolled courses", 403, req);
    }

    const db = await getDb();
    const courses = await db
      .collection("courses")
      .find({ "enrolledStudents.studentId": user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedCourses = courses.map((c) => ({
      id: c._id.toString(),
      _id: c._id.toString(),
      courseName: c.courseName,
      duration: c.duration,
      topics: Array.isArray(c.topics) ? c.topics : [],
      price: c.price,
      maxStudents: c.maxStudents,
      status: c.status,
      teacherId: c.teacherId,
      teacherName: c.teacherName,
      teacherEmail: c.teacherEmail,
      enrolledStudents: Array.isArray(c.enrolledStudents) ? c.enrolledStudents : [],
      enrolledCount: Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0,
      myEnrollment: c.enrolledStudents?.find((s) => s.studentId === user.id) || null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return successResponse({ courses: formattedCourses }, 200, req);
  } catch (error) {
    printExceptionLog("Get Enrolled Courses", error);
    return errorResponse("Failed to fetch enrolled courses", 500, req);
  }
}
