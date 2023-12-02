import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
    res.send("GET request to the homepage");
});

router.post("/", (_req, res) => {
    res.send("POST request to the homepage");
});

export default router;
