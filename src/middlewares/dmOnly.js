import jwt from "jsonwebtoken";

export const dmOnly = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // Allow access if the user is a DM or ADMIN (since admins need access to DM routes too)
    if (req.user.role !== "DM" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Only DM or admin can access this route" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
