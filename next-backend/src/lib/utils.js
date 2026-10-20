// src/lib/utils.js

import { NextResponse } from "next/server";
import corsHeaders, { getCorsHeaders } from "./cors";

export function printExceptionLog(logMessage, error) {
  console.log(`==>${logMessage} Exception`);
  console.log(error);
}

export function errorResponse(message, status = 400, req = null) {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return NextResponse.json(
    {
      message: message,
      error: message,
    },
    {
      status: status,
      headers: headers,
    },
  );
}

export function successResponse(jsonData, status = 200, req = null) {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return NextResponse.json(jsonData, {
    status: status,
    headers: headers,
  });
}

export function handleOptions(req = null) {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new NextResponse(null, {
    status: 204,
    headers: headers,
  });
}
