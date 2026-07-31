import { Router } from "express";
import { verifyGoogleToken } from "../controller/auth.controller";

const router = Router();

router.post("/google", verifyGoogleToken);

export default router;
