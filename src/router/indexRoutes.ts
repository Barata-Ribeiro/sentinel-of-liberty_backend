import { Router } from "express";
import authMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", authMiddleware, (_req, res) => {
    res.send("This is the Home page!");
});

export default router;
