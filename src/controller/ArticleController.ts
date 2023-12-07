import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError
} from "../middleware/helper/ApiError";
import { articleRepository } from "../repository/articleRepository";
import { ArticleServices } from "../service/ArticleServices";

const articleService = new ArticleServices();

export class ArticleController {
    async createNewArticle(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleData = req.body;

        const response = await articleService.createNewArticle(
            requestingUser.id,
            articleData
        );

        return res.status(201).json(response);
    }

    async getAllArticles(req: Request, res: Response) {
        return res.status(200).json();
    }

    async getAllSummaryArticles(req: Request, res: Response) {
        return res.status(200).json();
    }

    async getArticleById(req: Request, res: Response) {
        return res.status(200).json();
    }

    async updateArticle(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleDataForUpdate = req.body;

        const articleId = req.params.articleId;

        const response = await articleService.updateArticle(
            articleId,
            articleDataForUpdate
        );

        return res.status(200).json(response);
    }

    async deleteArticle(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleId = req.params.articleId;

        const requiredArticle = await articleRepository.findOneBy({
            id: articleId
        });
        if (!requiredArticle) throw new NotFoundError("Article not found.");

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    await transactionalEntityManager.remove(requiredArticle);
                } catch (error) {
                    console.error("Transaction failed:", error);
                    throw new InternalServerError(
                        "An error occurred during the deletion process."
                    );
                }
            }
        );

        return res.status(204).end();
    }
}
