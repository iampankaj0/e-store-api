import express from "express";
import passport from "passport";
import {
  getAdminStats,
  getAdminUsers,
  logout,
  myProfile,
} from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/googlelogin",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get(
  "/login",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL,
  }),
  (req, res, next) => {
    if (req.user.googleId) {
      res.redirect(process.env.FRONTEND_URL);
    }
  }
);

router.get("/me", isAuthenticated, myProfile);

router.get("/logout", isAuthenticated, logout);

// ADMIN ROUTES
router.get("/admin/users", isAuthenticated, authorizedAdmin, getAdminUsers);
router.get("/admin/stats", isAuthenticated, authorizedAdmin, getAdminStats);

export default router;
