import { Router } from "express";
import { HomeController } from "../controller/HomeController";

const router = Router();

const homeController = new HomeController();

router.get("/", (req, res, next) => {
    homeController.getHomeContent(req, res).catch(next);
});

export default router;
