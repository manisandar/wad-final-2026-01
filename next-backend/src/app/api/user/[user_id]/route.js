// src/app/api/user/[user_id]/route.js

import { getDb } from "@/lib/mongodb";
import { errorResponse, successResponse, handleOptions, printExceptionLog } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req, { params }) {
  try {
    const { user_id } = await params;
    let query;
    try {
      query = { _id: new ObjectId(user_id) };
    } catch {
      query = { _id: user_id };
    }

    const db = await getDb();
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
          createdAt: user.createdAt,
        },
      },
      200,
      req,
    );
  } catch (error) {
    printExceptionLog("Get User By ID", error);
    return errorResponse("Failed to fetch user", 500, req);
  }
}
