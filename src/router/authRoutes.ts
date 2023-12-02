import { Router } from "express";
import { AuthController } from "./../controller/AuthController";

const router = Router();

const authController = new AuthController();

router.get("/discord/redirect", (req, res, next) => {
    authController.discordLoginRedirect(req, res).catch(next);
});

export default router;
