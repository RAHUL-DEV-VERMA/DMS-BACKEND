import jwt from "jsonwebtoken";

export const adminOnly = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Authorization token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // Allow access if user is ADMIN or DM (since admin can access DM routes too)
    if (req.user.role !== "ADMIN" ) {
      return res.status(403).json({ message: "Access denied: Only admin can access this route" });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
