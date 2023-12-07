import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";

export class ArticleController {
    async createNewArticle(req: AuthRequest, res: Response) {
        return res.status(201).json();
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

    async updateArticle(req: Request, res: Response) {
        return res.status(200).json();
    }

    async deleteArticle(req: Request, res: Response) {
        return res.status(204).end();
    }
}
