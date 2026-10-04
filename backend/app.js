import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import departmentRouter from "./router/departmentRouter.js";
import scheduleRouter from "./router/scheduleRouter.js";
import opdRouter from "./router/opdRouter.js";
import bedRouter from "./router/bedRouter.js";
import inventoryRouter from "./router/inventoryRouter.js";
import medicalRecordRouter from "./router/medicalRecordRouter.js";
import billingRouter from "./router/billingRouter.js";
import reviewRouter from "./router/reviewRouter.js";
import notificationRouter from "./router/notificationRouter.js";

const app = express();
config({ path: "./.env" });

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(","),
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Core routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

// New feature routes
app.use("/api/v1/department", departmentRouter);
app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/opd", opdRouter);
app.use("/api/v1/bed", bedRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/medical-records", medicalRecordRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/notification", notificationRouter);

dbConnection();

app.use(errorMiddleware);
export default app;
