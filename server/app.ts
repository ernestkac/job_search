import express from "express";
import routes from "./routes/index";

const app = express();

// JSON Body Parser with 10mb payload limit for base64 CV files
app.use(express.json({ limit: "10mb" }));

app.use("/api", routes);

export default app;
