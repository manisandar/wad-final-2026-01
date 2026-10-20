// src/app/api/auth/logout/route.js

import { successResponse, handleOptions } from "@/lib/utils";

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  const response = successResponse(
    {
      message: "Logged out successfully",
    },
    200,
    req,
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}