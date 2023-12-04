import { Router } from "express";
import authMiddleware from "../middleware/AuthMiddleware";
import { AuthController } from "./../controller/AuthController";

const router = Router();

const authController = new AuthController();

router.get("/discord/login", (_req, res, _next) => {
    res.redirect(process.env.DISCORD_CLIENT_LOGIN_URL || "");
});

router.get("/discord/redirect", (req, res, next) => {
    authController.discordLoginRedirect(req, res).catch(next);
});

router.get("/discord/logout", authMiddleware, (req, res, next) => {
    authController.discordLogout(req, res).catch(next);
});

export default router;
