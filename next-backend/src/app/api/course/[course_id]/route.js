// src/app/api/course/[course_id]/route.js

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

export async function GET(req, { params }) {
  try {
    const { course_id } = await params;
    const db = await getDb();
    const course = await db.collection("courses").findOne(getCourseQuery(course_id));

    if (!course) {
      return errorResponse("Course not found", 404, req);
    }

    const user = verifyJWT(req);

    // If course is Cancelled, only the owner Teacher can view it
    if (course.status === "Cancel") {
      if (!user || user.id !== course.teacherId) {
        return errorResponse("Course not found or has been cancelled", 404, req);
      }
    }

    const formattedCourse = {
      id: course._id.toString(),
      _id: course._id.toString(),
      courseName: course.courseName,
      duration: course.duration,
      topics: Array.isArray(course.topics) ? course.topics : [],
      price: course.price,
      maxStudents: course.maxStudents,
      status: course.status,
      teacherId: course.teacherId,
      teacherName: course.teacherName,
      teacherEmail: course.teacherEmail,
      enrolledStudents: Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [],
      enrolledCount: Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0,
      availableSeats: Math.max(
        0,
        (course.maxStudents || 0) -
          (Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0),
      ),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return successResponse({ course: formattedCourse }, 200, req);
  } catch (error) {
    printExceptionLog("Get Course Details", error);
    return errorResponse("Failed to fetch course details", 500, req);
  }
}

export async function PUT(req, { params }) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return errorResponse("Authentication required", 401, req);
    }

    // Role check: Only Teachers can update courses
    if (user.role !== "Teacher") {
      return errorResponse("Forbidden: Only teachers can update courses", 403, req);
    }

    const { course_id } = await params;
    const db = await getDb();
    const course = await db.collection("courses").findOne(getCourseQuery(course_id));

    if (!course) {
      return errorResponse("Course not found", 404, req);
    }

    // Ownership check: Teachers can update only their own courses
    if (course.teacherId !== user.id) {
      return errorResponse("Forbidden: You can only update your own courses", 403, req);
    }

    const body = await req.json();
    const updateFields = {
      updatedAt: new Date(),
    };

    if (body.courseName !== undefined) {
      if (!body.courseName || !body.courseName.trim()) {
        return errorResponse("Course name cannot be empty", 400, req);
      }
      updateFields.courseName = body.courseName.trim();
    }

    if (body.duration !== undefined) {
      const dur = Number(body.duration);
      if (isNaN(dur) || dur <= 0) {
        return errorResponse("Duration must be a positive number of days", 400, req);
      }
      updateFields.duration = dur;
    }

    if (body.price !== undefined) {
      const pr = Number(body.price);
      if (isNaN(pr) || pr < 0) {
        return errorResponse("Price must be a non-negative number", 400, req);
      }
      updateFields.price = pr;
    }

    if (body.maxStudents !== undefined) {
      const ms = parseInt(body.maxStudents, 10);
      const enrolledCount = Array.isArray(course.enrolledStudents)
        ? course.enrolledStudents.length
        : 0;
      if (isNaN(ms) || ms <= 0) {
        return errorResponse("Max students must be a positive integer", 400, req);
      }
      if (ms < enrolledCount) {
        return errorResponse(
          `Max students (${ms}) cannot be less than currently enrolled students (${enrolledCount})`,
          400,
          req,
        );
      }
      updateFields.maxStudents = ms;
    }

    if (body.status !== undefined) {
      const validStatuses = ["Open", "Close", "Cancel"];
      if (!validStatuses.includes(body.status)) {
        return errorResponse("Status must be one of: Open, Close, Cancel", 400, req);
      }
      updateFields.status = body.status;
    }

    if (body.topics !== undefined) {
      let topicsArray = [];
      if (Array.isArray(body.topics)) {
        topicsArray = body.topics.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof body.topics === "string") {
        topicsArray = body.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      if (topicsArray.length === 0) {
        return errorResponse("At least one topic is required", 400, req);
      }
      updateFields.topics = topicsArray;
    }

    await db.collection("courses").updateOne(getCourseQuery(course_id), {
      $set: updateFields,
    });

    const updatedCourse = await db.collection("courses").findOne(getCourseQuery(course_id));

    return successResponse(
      {
        message: `Course "${updatedCourse.courseName}" updated successfully!`,
        course: {
          id: updatedCourse._id.toString(),
          _id: updatedCourse._id.toString(),
          ...updatedCourse,
          enrolledCount: Array.isArray(updatedCourse.enrolledStudents)
            ? updatedCourse.enrolledStudents.length
            : 0,
        },
      },
      200,
      req,
    );
  } catch (error) {
    printExceptionLog("Update Course", error);
    return errorResponse("Failed to update course", 500, req);
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return errorResponse("Authentication required", 401, req);
    }

    // Role check: Only Teachers can delete courses
    if (user.role !== "Teacher") {
      return errorResponse("Forbidden: Only teachers can delete courses", 403, req);
    }

    const { course_id } = await params;
    const db = await getDb();
    const course = await db.collection("courses").findOne(getCourseQuery(course_id));

    if (!course) {
      return errorResponse("Course not found", 404, req);
    }

    // Ownership check: Teachers can delete only their own courses
    if (course.teacherId !== user.id) {
      return errorResponse("Forbidden: You can only delete your own courses", 403, req);
    }

    // Rule: "Delete the Teacher's own course only when no Student has enrolled."
    const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
    if (enrolledStudents.length > 0) {
      return errorResponse(
        `Cannot delete course: ${enrolledStudents.length} student(s) are already enrolled. Only courses with no enrolled students can be deleted.`,
        400,
        req,
      );
    }

    await db.collection("courses").deleteOne(getCourseQuery(course_id));

    return successResponse({ message: "Course deleted successfully" }, 200, req);
  } catch (error) {
    printExceptionLog("Delete Course", error);
    return errorResponse("Failed to delete course", 500, req);
  }
}

export async function POST(req, { params }) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return errorResponse("Authentication required to enroll", 401, req);
    }

    if (user.role !== "Student") {
      return errorResponse("Forbidden: Only students can enroll in courses", 403, req);
    }

    const { course_id } = await params;
    const db = await getDb();
    const course = await db.collection("courses").findOne(getCourseQuery(course_id));

    if (!course) {
      return errorResponse("Course not found", 404, req);
    }

    if (course.status !== "Open") {
      return errorResponse(
        `Cannot enroll: Course is not open for enrollment (Current status: ${course.status})`,
        400,
        req,
      );
    }

    const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];

    const alreadyEnrolled = enrolledStudents.some(
      (s) => s.studentId === user.id || s.email === user.email,
    );
    if (alreadyEnrolled) {
      return errorResponse("You are already enrolled in this course", 400, req);
    }

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