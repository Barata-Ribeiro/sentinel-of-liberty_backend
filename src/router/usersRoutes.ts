import { Router } from "express";
import authMiddleware from "../middleware/AuthMiddleware";

const router = Router();

const userController = new UserController();

router.get("/", (req, res, next) => {
    userController.getAllUsers(req, res).catch(next);
});

router.get("/:id", (req, res, next) => {
    userController.getUserById(req, res).catch(next);
});

router.put("/:id", authMiddleware, (req, res, next) => {
    userController.updateOwnAccount(req, res).catch(next);
});

router.delete("/:id", authMiddleware, (req, res, next) => {
    userController.deleteOwnAccount(req, res).catch(next);
});

export default router;
