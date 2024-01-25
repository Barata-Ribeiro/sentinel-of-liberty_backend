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
    /**
     * Creates a new news suggestion. It takes the following data from the request body:
     * - source: The news source URL.
     * - title: The news title.
     * - content: The news content.
     * - imageUrl: The news image URL.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The response with the created news suggestion and a success message.
     * @throws {BadRequestError} if the requesting user is missing.
     */
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

    /**
     * Retrieves all news suggestions with pagination. It takes two query parameters:
     * - perPage: The number of news suggestions per page.
     * - page: The page number.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The response with the paginated news suggestions. The response contains the following properties:
     * - data: The news suggestions array.
     * - perPage: The number of news suggestions per page.
     * - page: The current page number.
     * - next: The next page URL.
     * - prev: The previous page URL.
     */
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

    /**
     * Retrieves a news suggestion by its ID. It takes the news ID from the request parameters.
     *
     * It was initially created to be used when an user decides to write an article based on a news suggestion. The client would send a request to this endpoint, passing the news ID in the URL, and the server would return the news suggestion data. The client would then use this data to pre-fill the article creation form.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The JSON response containing the news suggestion.
     * @throws {NotFoundError} if the news suggestion is not found.
     */
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

    /**
     * Updates a news suggestion. It takes the suggestion id from the request parameters,
     *  and the data from the request body. The data that can be updated are:
     * - source: The news source URL.
     * - title: The news title.
     * - content: The news content.
     * - imageUrl: The news image URL.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The updated news suggestion and a success message.
     * @throws {BadRequestError} if the requesting user is missing.
     */
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

    /**
     * Deletes a news suggestion. Uses TypeORM's transactions to delete the news suggestion and all its relations to guarantee data integrity and consistency.
     * If fails, it will rollback the transaction and no data will be deleted.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A response indicating the success of the deletion.
     * @throws {BadRequestError} if the requesting user is missing.
     * @throws {NotFoundError} if the news suggestion is not found.
     * @throws {UnauthorizedError} if the requesting user is not authorized to delete the comment.
     * @throws {InternalServerError} if an error occurs during the deletion process.
     */
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
