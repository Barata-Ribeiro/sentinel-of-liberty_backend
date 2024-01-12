import { Router } from "express";
import { ArticleController } from "../controller/ArticleController";
import authMiddleware from "../middleware/AuthMiddleware";
import authModMiddleware from "../middleware/AuthModMiddleware";
import OptionalAuthMiddleware from "../middleware/OptionalAuthMiddleware";

const router = Router();

const articleController = new ArticleController();

router.post("/", authMiddleware, (req, res, next) => {
    articleController.createNewArticle(req, res).catch(next);
});

router.get("/", (req, res, next) => {
    articleController.getAllArticles(req, res).catch(next);
});

router.get("/", (req, res, next) => {
    articleController.getAllSummaryArticles(req, res).catch(next);
});

router.get("/:articleId", OptionalAuthMiddleware, (req, res, next) => {
    articleController.getArticleById(req, res).catch(next);
});

router.put(
    "/:articleId/admin",
    authMiddleware,
    authModMiddleware,
    (req, res, next) => {
        articleController.updateArticle(req, res).catch(next);
    }
);

router.delete(
    "/:articleId/admin",
    authMiddleware,
    authModMiddleware,
    (req, res, next) => {
        articleController.deleteArticle(req, res).catch(next);
    }
);

export default router;
