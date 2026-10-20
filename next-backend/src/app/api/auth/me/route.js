// src/app/api/auth/me/route.js

import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, handleOptions } from "@/lib/utils";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  const decoded = verifyJWT(req);
  if (!decoded) {
    return errorResponse("Unauthorized", 401, req);
  }

  try {
    const db = await getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(decoded.id) };
    } catch {
      query = { email: decoded.email };
    }

    const user = await db.collection("users").findOne(query, {
      projection: { password: 0 },
    });

    if (!user) {
      return errorResponse("User not found", 404, req);
    }

    return successResponse(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      200,
      req,
    );
  } catch (error) {
    return errorResponse("Failed to fetch current user", 500, req);
  }
}
