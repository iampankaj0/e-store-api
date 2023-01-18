import { asyncError } from "../middlewares/errorMiddleware.js";
import { Order } from "../models/Order.js";
import errorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";

// CREATE NEW ORDER
export const placeOrder = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  const user = req.user._id;

  const orderOptions = {
    shippingInfo,
    orderItems,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
    user,
  };

  const order = await Order.create(orderOptions);
  res.status(201).json({
    success: true,
    message: "Order Placed Successfully via Cash On Delivery",
  });
});

// CREATE NEW ORDER ONLINE PAY
export const placeOrderOnline = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  const user = req.user._id;

  const orderOptions = {
    shippingInfo,
    orderItems,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
    user,
  };

  const options = {
    amount: Number(totalAmount) * 100,
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  await Order.create(orderOptions);
  res.status(201).json({
    success: true,
    order,
    orderOptions,
  });
});

// PAYMENT VERIFICATION
export const paymentVerification = asyncError(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    orderOptions,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const payment = await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await Order.create({
      ...orderOptions,
      paidAt: new Date(Date.now()),
      paymentInfo: payment._id,
    });

    res.status(201).json({
      success: true,
      message: `Order Placed Successfully. Payment ID: ${payment._id}`,
    });
  } else {
    return next(new errorHandler("Payment Failed", 400));
  }
});

// GET ALL ORDERS CREATED BY ME (SELF USER)
export const getMyOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({
    user: req.user._id,
  }).populate("user", "name");

  if (!orders) {
    return next(new errorHandler("Order Not Found", 404));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

// DELETE ORDER CREATED BY ME (SELF USER)
export const deleteOrder = asyncError(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new errorHandler("Order Not Found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted Successfully",
  });
});

// GET ORDER DETAILS
export const getOrderDetails = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    return next(new errorHandler("Order Not Found With This ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// GET ALL ORDERS - ADMIN
export const getAdminOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name");

  if (!orders) {
    return next(new errorHandler("Order Not Found", 404));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

// PROCESS ORDER - ADMIN
export const processOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new errorHandler("Order Not Found With This ID", 404));
  }

  if (order.orderStatus === "Preparing") {
    order.orderStatus = "Shipped";
  } else if (order.orderStatus === "Shipped") {
    order.orderStatus = "Delivered";
    order.deliveredAt = Date.now();
  } else if (order.orderStatus === "Delivered") {
    return next(new errorHandler("Order Already Delivered", 400));
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order Successfully ${order.orderStatus}`,
  });
});
