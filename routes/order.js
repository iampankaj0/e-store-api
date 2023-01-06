import express from "express";
import {
  getAdminOrders,
  getMyOrders,
  getOrderDetails,
  paymentVerification,
  placeOrder,
  placeOrderOnline,
  processOrder,
} from "../controllers/orderController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/createorder", placeOrder); // CREATE NEW ORDER
router.post("/createorderonline", isAuthenticated, placeOrderOnline); // CREATE NEW ORDER ONLINE PAY
router.post("/paymentverification", isAuthenticated, paymentVerification); // PAYMENT VERIFICATION
router.get("/myorders", isAuthenticated, getMyOrders); // MY ORDERS - USER
router.get("/order/:id", isAuthenticated, getOrderDetails); // GET ORDER DETAILS

// ADMIN ROUTES
router.get("/admin/orders", isAuthenticated, authorizedAdmin, getAdminOrders); // GET ALL ORDERS - ADMIN
router.get("/admin/order/:id", isAuthenticated, authorizedAdmin, processOrder); // PROCESS ORDER - ADMIN

export default router;
