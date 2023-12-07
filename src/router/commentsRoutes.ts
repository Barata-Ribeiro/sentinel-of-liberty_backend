import { Router } from "express";
import { CommentController } from "../controller/CommentController";
import authMiddleware from "../middleware/AuthMiddleware";

const router = Router();

const commentController = new CommentController();

router.post("/:articleId/comments", authMiddleware, (req, res, next) => {
    commentController.createNewComment(req, res).catch(next);
});

router.put(
    "/:articleId/comments/:commentId",
    authMiddleware,
    (req, res, next) => {
        commentController.editComment(req, res).catch(next);
    }
);

router.delete(
    "/:articleId/comments/:commentId",
    authMiddleware,
    (req, res, next) => {
        commentController.deleteComment(req, res).catch(next);
    }
);

router.post(
    "/:articleId/comments/:commentId/likes",
    authMiddleware,
    (req, res, next) => {
        commentController.toggleLike(req, res).catch(next);
    }
);

export default router;
