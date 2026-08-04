import express from "express";
import path from "path";
import routes from "./routes/index";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middleware/verifytoken";

const app = express();

// JSON Body Parser with 10mb payload limit for base64 CV files
app.use(express.json({ limit: "10mb" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

//Mount the authentication routes under auth
app.use("/auth", authRoutes);

app.use("/api", authenticate, routes);

export default app;
