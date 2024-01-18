import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
import { NewsSuggestionResponseDTO } from "../dto/NewsSuggestionResponseDTO";
import { UserRole } from "../entity/User";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError
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

        return res.status(201).json({
            ...response,
            message: "News suggestion created successfully."
        });
    }

    async getAllNewsSuggestions(req: Request, res: Response) {
        let { perPage, page } = req.query;
        let realPage: number;
        let realTake: number;

        if (perPage) realTake = +perPage;
        else {
            perPage = "10";
            realTake = 10;
        }

        if (page) realPage = +page === 1 ? 0 : (+page - 1) * realTake;
        else {
            realPage = 0;
            page = "1";
        }

        const queryBuilder = newsSuggestionRepository
            .createQueryBuilder("newsSuggestion")
            .leftJoinAndSelect("newsSuggestion.user", "user")
            .orderBy("newsSuggestion.createdAt", "DESC")
            .take(realTake)
            .skip(realPage);

        const [result, total] = await queryBuilder.getManyAndCount();
        const resultToDTO = result.map((newsSuggestion) =>
            NewsSuggestionResponseDTO.fromEntity(newsSuggestion)
        );
        const hasNextPage = realPage + realTake < total;
        const backendOrigin =
            process.env.BACKEND_ORIGIN || "http://localhost:3000";

        return res.status(200).json({
            data: resultToDTO,
            perPage: realTake,
            page: +page || 1,
            next: hasNextPage
                ? `${backendOrigin}/api/v1/suggestions?perPage=${realTake}&page=${
                      +page + 1
                  }`
                : null,
            prev:
                realPage !== 0
                    ? `${backendOrigin}/api/v1/suggestions?perPage=${realTake}&page=${
                          +page - 1
                      }`
                    : null
        });
    }

    async getNewsSuggestionById(req: Request, res: Response) {
        const newsId = req.params.newsId;

        const requiredNews = await newsSuggestionRepository.findOne({
            where: { id: newsId },
            relations: ["user"]
        });
        if (!requiredNews)
            throw new NotFoundError("News suggestion not found.");

        const newsResponse = NewsSuggestionResponseDTO.fromEntity(requiredNews);

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

        return res.status(200).json({
            ...response,
            message: "News suggestion updated successfully."
        });
    }

    async deleteNewsSuggestion(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const newsId = req.params.newsId;

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    const requiredNews = await newsSuggestionRepository.findOne(
                        {
                            where: { id: newsId },
                            relations: ["user"]
                        }
                    );
                    if (!requiredNews)
                        throw new NotFoundError("News suggestion not found.");

                    if (
                        requestingUser.role !== UserRole.ADMIN &&
                        requestingUser.role !== UserRole.MODERATOR
                    )
                        throw new UnauthorizedError(
                            "You are not authorized to delete this comment."
                        );

                    await transactionalEntityManager.remove(requiredNews);
                } catch (error) {
                    console.error("Transaction failed:", error);
                    throw new InternalServerError(
                        "An error occurred during the deletion process."
                    );
                }
            }
        );

        return res
            .status(204)
            .end({ message: "News suggestion deleted successfully." });
    }
}
