import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
import { NewsSuggestionResponseDTO } from "../dto/NewsSuggestionResponseDTO";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError
} from "../middleware/helper/ApiError";
import { newsSuggestionRepository } from "../repository/newsSuggestionRepository";
import { NewsSuggestionServices } from "../service/NewsSuggestionServices";

const newsSuggestionService = new NewsSuggestionServices();

export class NewsSuggestionController {
    async createNewsSuggestion(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const suggestionData = req.body;

        const response = await newsSuggestionService.createNewsSuggestion(
            requestingUser.id,
            suggestionData
        );

        return res.status(201).json(response);
    }

    async getAllNewsSuggestions(req: Request, res: Response) {}

    async getNewsSuggestionById(req: Request, res: Response) {
        const newsId = req.params.newsId;

        const requiredNews = await newsSuggestionRepository.findOne({
            where: { id: newsId },
            relations: ["user"]
        });
        if (!requiredNews)
            throw new NotFoundError("News suggestion not found.");

        const newsResponse =
            NewsSuggestionResponseDTO.fromEntityWithRelations(requiredNews);

        return res.status(200).json(newsResponse);
    }

    async updateNewsSuggestion(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const suggestionDataForUpdate = req.body;

        const newsId = req.params.newsId;

        const response = await newsSuggestionService.updateNewsSuggestion(
            newsId,
            suggestionDataForUpdate
        );

        return res.status(200).json(response);
    }

    async deleteNewsSuggestion(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const newsId = req.params.newsId;

        const requiredNews = await newsSuggestionRepository.findOneBy({
            id: newsId
        });
        if (!requiredNews)
            throw new NotFoundError("News suggestion not found.");

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    await transactionalEntityManager.remove(requiredNews);
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
