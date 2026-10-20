// src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import { signJWT } from "@/lib/auth";
import { errorResponse, successResponse, handleOptions, printExceptionLog } from "@/lib/utils";
import { getCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const identifier = body.email || body.username || body.identifier;
    const password = body.password;

    if (!identifier || !password) {
      return errorResponse("Email/Username and password are required", 400, req);
    }

    const db = await getDb();
    const user = await db.collection("users").findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier.trim()}$`, "i") } },
        { username: { $regex: new RegExp(`^${identifier.trim()}$`, "i") } },
      ],
    });

    if (!user) {
      return errorResponse("Incorrect username or password.", 401, req);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Incorrect username or password.", 401, req);
    }

    const tokenPayload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = signJWT(tokenPayload);

    const response = successResponse(
      {
        message: "Login successful",
        token: token,
        user: tokenPayload,
      },
      200,
      req,
    );

    // Set cookie for browser cookie support
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    printExceptionLog("Login", error);
    return errorResponse("Internal server error during login", 500, req);
  }
}