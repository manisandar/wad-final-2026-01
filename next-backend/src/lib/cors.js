// src/lib/cors.js

export function getCorsHeaders(req) {
  const origin = req?.headers?.get?.("origin") || req?.headers?.origin;
  const allowedOrigin = origin || (process.env.NODE_ENV === "development" ? "http://localhost:5173" : "*");

  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id, x-user-email, x-user-username",
    "Access-Control-Max-Age": "86400",
  };
}

const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin":
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : "*"),
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id, x-user-email, x-user-username",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;
