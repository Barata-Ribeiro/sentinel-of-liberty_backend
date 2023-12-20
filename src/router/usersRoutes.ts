import { Router } from "express";
import { UserController } from "../controller/UserController";
import authAdminMiddleware from "../middleware/AuthAdminMiddleware";
import authMiddleware from "../middleware/AuthMiddleware";
import authModMiddleware from "../middleware/AuthModMiddleware";

const router = Router();

const userController = new UserController();

router.get("/", (req, res, next) => {
    userController.getAllUsers(req, res).catch(next);
});

router.get("/:userId", (req, res, next) => {
    userController.getUserById(req, res).catch(next);
});

router.put("/:userId", authMiddleware, (req, res, next) => {
    userController.updateOwnAccount(req, res).catch(next);
});

router.put("/:userId/admin", authMiddleware, authModMiddleware, (req, res, next) => {
    userController.banUserById(req, res).catch(next);
});

router.delete("/:userId", authMiddleware, (req, res, next) => {
    userController.deleteOwnAccount(req, res).catch(next);
});

router.delete(
    "/:userId/admin",
    authMiddleware,
    authAdminMiddleware,
    (req, res, next) => {
        userController.deleteUserAccount(req, res).catch(next);
    }
);

export default router;
