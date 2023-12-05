import { Router } from "express";
import { NewsSuggestionController } from "../controller/NewsSuggestionController";
import authAdminMiddleware from "../middleware/AuthAdminMiddleware";
import authMiddleware from "../middleware/AuthMiddleware";
import authModMiddleware from "../middleware/AuthModMiddleware";

const router = Router();

const newsSuggestionController = new NewsSuggestionController();

router.post("/", authMiddleware, (req, res, next) => {
    newsSuggestionController.createNewsSuggestion(req, res).catch(next);
});

router.get("/", (req, res, next) => {
    newsSuggestionController.getAllNewsSuggestions(req, res).catch(next);
});

router.get("/:newsId", (req, res, next) => {
    newsSuggestionController.getNewsSuggestionById(req, res).catch(next);
});

router.put("/:newsId", authMiddleware, authModMiddleware, (req, res, next) => {
    newsSuggestionController.updateNewsSuggestion(req, res).catch(next);
});

router.delete(
    "/:newsId",
    authMiddleware,
    authAdminMiddleware,
    (req, res, next) => {
        newsSuggestionController.deleteNewsSuggestion(req, res).catch(next);
    }
);

export default router;
