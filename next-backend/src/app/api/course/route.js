// src/app/api/course/route.js

import { getDb } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, handleOptions, printExceptionLog } from "@/lib/utils";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const mine = searchParams.get("mine") === "true";
    const enrolledOnly = searchParams.get("enrolled") === "true";

    const user = verifyJWT(req);
    const db = await getDb();
    let query = {};

    if (mine || enrolledOnly) {
      if (!user) {
        return errorResponse("Authentication required to view your courses", 401, req);
      }

      if (user.role === "Teacher") {
        // Teacher views their own courses
        query.teacherId = user.id;
      } else if (user.role === "Student") {
        // Student views courses they are enrolled in
        query["enrolledStudents.studentId"] = user.id;
      }
    } else {
      // General course list (Student / Public view)
      // Per requirements: Cancel courses must NOT be displayed in student course list
      query.status = { $ne: "Cancel" };
    }

    // Filter by part of course name or teacher name
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      const searchCondition = {
        $or: [{ courseName: regex }, { teacherName: regex }],
      };

      if (Object.keys(query).length > 0) {
        query = { $and: [query, searchCondition] };
      } else {
        query = searchCondition;
      }
    }

    const courses = await db
      .collection("courses")
      .find(query)
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
      availableSeats: Math.max(
        0,
        (c.maxStudents || 0) - (Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0),
      ),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return successResponse({ courses: formattedCourses }, 200, req);
  } catch (error) {
    printExceptionLog("Get Courses", error);
    return errorResponse("Failed to fetch courses", 500, req);
  }
}

export async function POST(req) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return errorResponse("Authentication required", 401, req);
    }

    // Role check: Only authenticated Teachers can create courses
    if (user.role !== "Teacher") {
      return errorResponse("Forbidden: Only teachers can create courses", 403, req);
    }

    const body = await req.json();
    const { courseName, duration, topics, price, maxStudents, status = "Open" } = body;

    // Validate inputs
    if (!courseName || typeof courseName !== "string" || !courseName.trim()) {
      return errorResponse("Course name is required", 400, req);
    }

    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return errorResponse("Duration must be a positive number of days", 400, req);
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return errorResponse("Price must be a non-negative number", 400, req);
    }

    const parsedMaxStudents = parseInt(maxStudents, 10);
    if (isNaN(parsedMaxStudents) || parsedMaxStudents <= 0) {
      return errorResponse("Max students must be a positive integer", 400, req);
    }

    const validStatuses = ["Open", "Close", "Cancel"];
    if (!validStatuses.includes(status)) {
      return errorResponse("Status must be one of: Open, Close, Cancel", 400, req);
    }

    // Normalize topics into array of strings
    let topicsArray = [];
    if (Array.isArray(topics)) {
      topicsArray = topics.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof topics === "string") {
      topicsArray = topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (topicsArray.length === 0) {
      return errorResponse("At least one topic is required", 400, req);
    }

    const newCourse = {
      courseName: courseName.trim(),
      duration: parsedDuration,
      topics: topicsArray,
      price: parsedPrice,
      maxStudents: parsedMaxStudents,
      status: status,
      teacherId: user.id,
      teacherName: user.username,
      teacherEmail: user.email,
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection("courses").insertOne(newCourse);

    return successResponse(
      {
        message: `Course "${newCourse.courseName}" created successfully!`,
        course: {
          id: result.insertedId.toString(),
          _id: result.insertedId.toString(),
          ...newCourse,
          enrolledCount: 0,
          availableSeats: parsedMaxStudents,
        },
      },
      201,
      req,
    );
  } catch (error) {
    printExceptionLog("Create Course", error);
    return errorResponse("Failed to create course", 500, req);
  }
}