import "dotenv/config";
import express from "express";
import app from "./server/app";
import { initializeDatabase } from "./server/config/db";
import path from "path";
import { createServer as createViteServer } from "vite";

try {
  await initializeDatabase();
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

async function startServer() {
  const PORT = 3000;

  // ==========================================
  // VITE & STATIC FILES MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
