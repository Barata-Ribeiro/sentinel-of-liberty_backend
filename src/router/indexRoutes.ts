import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.send("GET request to the homepage");
});

router.post("/", (req, res) => {
    res.send("POST request to the homepage");
});

export default router;
