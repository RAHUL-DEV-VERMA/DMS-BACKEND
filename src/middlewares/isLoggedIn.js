import jwt from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("Token expired:", error);
      return res.status(403).json({ message: "Token expired. Please log in again." });
    }
    console.error("Invalid token:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
