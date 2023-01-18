import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { connectPassport } from "./utils/Provider.js";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import cors from "cors";
// IMPORTING ROUTES START
import userRoute from "./routes/user.js";
import orderRoute from "./routes/order.js";
// IMPORTING ROUTES ENDS

const app = express();
dotenv.config({ path: "./config/config.env" });

connectPassport();

app.use(
  session({
    secret: process.env.SESSION_SECERT,
    resave: false,
    saveUninitialized: false,

    // cookie: {
    //   secure: process.env.NODE_ENV === "development" ? false : true,
    //   httpOnly: process.env.NODE_ENV === "development" ? false : true,
    //   sameSite: process.env.NODE_ENV === "development" ? false : "none",
    // },
  })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(
  urlencoded({
    extended: true,
  })
);

app.enable("trust proxy");

app.use(
  cors({
    // credentials: true,
    // origin: process.env.FRONTEND_URL,
    // methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

// using Error middleware
app.use(errorMiddleware);

export default app;
