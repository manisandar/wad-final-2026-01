import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "csx4107_wad_final_2026_super_secret_jwt_key";

export function signJWT(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJWT(req) {
  try {
    let token = null;

    if (req?.cookies?.get) {
      token = req.cookies.get("token")?.value;
    } else if (req?.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token && req?.headers) {
      const authHeader = req.headers.get
        ? req.headers.get("authorization") || req.headers.get("Authorization")
        : req.headers["authorization"] || req.headers["Authorization"];
      if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error("verifyJWT error:", err.message);
    return null;
  }
}