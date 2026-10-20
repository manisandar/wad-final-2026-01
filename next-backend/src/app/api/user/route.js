// src/app/api/user/route.js

import { getDb } from "@/lib/mongodb";
import { errorResponse, successResponse, handleOptions, printExceptionLog } from "@/lib/utils";
import bcrypt from "bcrypt";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query = {};
    if (role) {
      query.role = role;
    }

    const db = await getDb();
    const users = await db
      .collection("users")
      .find(query, { projection: { password: 0 } })
      .toArray();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return successResponse({ users: formattedUsers }, 200, req);
  } catch (error) {
    printExceptionLog("Get Users", error);
    return errorResponse("Failed to fetch users", 500, req);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, password, role } = body;

    if (!username || !email || !password || !role) {
      return errorResponse("Username, email, password, and role are required", 400, req);
    }

    if (!["Student", "Teacher"].includes(role)) {
      return errorResponse("Role must be either 'Student' or 'Teacher'", 400, req);
    }

    const db = await getDb();
    const existing = await db.collection("users").findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() },
      ],
    });

    if (existing) {
      return errorResponse("User with this email or username already exists", 400, req);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return successResponse(
      {
        message: "User registered successfully",
        user: {
          id: result.insertedId.toString(),
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      },
      201,
      req,
    );
  } catch (error) {
    printExceptionLog("Create User", error);
    return errorResponse("Failed to create user", 500, req);
  }
}