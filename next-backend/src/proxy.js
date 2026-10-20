import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import corsHeaders, { getCorsHeaders } from "./lib/cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
} from "./lib/constant";

export function proxy(request) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  const user = verifyJWT(request);

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized Request",
      },
      {
        status: 401,
        headers: getCorsHeaders(request),
      },
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(X_HEADER_USER_ID, user.id || "");
  requestHeaders.set(X_HEADER_USER_EMAIL, user.email || "");
  requestHeaders.set(X_HEADER_USER_NAME, user.username || "");
  if (user.role) {
    requestHeaders.set("x-user-role", user.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [],
};
