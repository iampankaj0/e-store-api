import errorHandler from "../utils/errorHandler.js";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies["connect.sid"];
  if (!token) {
    return next(new errorHandler("Please Login First", 401));
  }
  next();
};

export const authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new errorHandler("Only Admin Allowed", 405));
  }
  next();
};
