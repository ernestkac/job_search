import { Router } from "express";
import { sendGmail } from "../controller/gmail.controller";

const router = Router();

router.post("/send", sendGmail);

export default router;
