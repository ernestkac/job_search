import { Router } from "express";
import {
  verifyGoogleToken,
  verifyGmailAuthorization,
} from "../controller/auth.controller";
import { authenticate } from "../middleware/verifytoken";

const router = Router();

router.post("/google", verifyGoogleToken);
router.post("/google/gmail", authenticate, verifyGmailAuthorization);

export default router;
