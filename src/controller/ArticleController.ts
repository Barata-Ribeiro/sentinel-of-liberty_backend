import { Request, Response } from "express";
import { In } from "typeorm";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
import { ArticleResponseDTO } from "../dto/ArticleResponseDTO";
import { CommentResponseDTO } from "../dto/CommentResponseDTO";
import { Comment } from "../entity/Comment";
import { Like } from "../entity/Like";
import { UserRole } from "../entity/User";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError
} from "../middleware/helper/ApiError";
import { articleRepository } from "../repository/articleRepository";
import { userArticleSummaryRepository } from "../repository/articleSummariesRepository";
import { commentRepository } from "../repository/commentRepository";
import { likeRepository } from "../repository/likeRepository";
import { ArticleServices } from "../service/ArticleServices";

const articleService = new ArticleServices();

export class ArticleController {
    /**
     * Creates a new article. It takes the article data from the request body. The article data must be as the following:
     * - title: The article title.
     * - content: The article content.
     * - imageUrl: The article image url.
     * - references: The article references.
     * - basedOnNewsSuggestionId (OPTIONAL): The ID of the news suggestion that the article is based on.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The response with the created article and a success message.
     * @throws {BadRequestError} if the requesting user is missing.
     */
    async createNewArticle(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleData = req.body;

        const response = await articleService.createNewArticle(
            requestingUser.id,
            articleData
        );

        return res
            .status(201)
            .json({ ...response, message: "Article created successfully." });
    }

    /**
     * Retrieves all articles with pagination. It takes two query parameters:
     * - perPage: The number of articles per page.
     * - page: The page number.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The response with the paginated articles. The response contains the following properties:
     * - data: The articles.
     * - perPage: The number of articles per page.
     * - page: The page number.
     * - next: The next page url.
     * - prev: The previous page url.
     */
    async getAllArticles(req: Request, res: Response) {
        let { perPage, page } = req.query;
        let realPage: number;
        let realTake: number;

        if (perPage) realTake = +perPage;
        else {
            perPage = "12";
            realTake = 12;
        }

        if (page) realPage = +page === 1 ? 0 : (+page - 1) * realTake;
        else {
            realPage = 0;
            page = "1";
        }

        const queryBuilder = userArticleSummaryRepository
            .createQueryBuilder("articleSummary")
            .orderBy("articleSummary.articleCreatedAt", "DESC")
            .take(realTake)
            .skip(realPage);

        const [result, total] = await queryBuilder.getManyAndCount();
        const hasNextPage = realPage + realTake < total;
        const backendOrigin =
            process.env.BACKEND_ORIGIN || "http://localhost:3000";

        return res.status(200).json({
            data: result,
            perPage: realTake,
            page: +page || 1,
            next: hasNextPage
                ? `${backendOrigin}/api/v1/articles?perPage=${realTake}&page=${
                      +page + 1
                  }`
                : null,
            prev:
                realPage !== 0
                    ? `${backendOrigin}/api/v1/articles?perPage=${realTake}&page=${
                          +page - 1
                      }`
                    : null
        });
    }

    /**
     * Retrieves all summary articles. It will return all articles with a limit of 10.
     * But it does not contain any pagination. The summary articles are
     *  resummarized articles that are created by the users.
     *
     * @param _req - The request object.
     * @param res - The response object.
     * @returns The response object with the summary articles.
     */
    async getAllSummaryArticles(_req: Request, res: Response) {
        const response = userArticleSummaryRepository.find({
            order: {
                articleCreatedAt: "DESC"
            },
            take: 10
        });

        return res.status(200).json(response);
    }

    /**
     * Retrieves an article by its ID. It may contain comments and nested comments that are related to the article, using a private method to build the nested structure.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A JSON response containing the article and its comments plus its nested comments if they exist.
     * @throws {BadRequestError} If the article ID is missing.
     * @throws {NotFoundError} If the article is not found.
     */
    async getArticleById(req: AuthRequest, res: Response) {
        const requestingUser = req.user;

        const articleId = req.params.articleId;
        if (!articleId) throw new BadRequestError("Missing article id.");

        const article = await articleRepository.findOne({
            where: { id: articleId },
            relations: ["user", "basedOnNewsSuggestion"]
        });
        if (!article) throw new NotFoundError("Article not found.");

        const articleToDTO = ArticleResponseDTO.fromEntity(article);

        const comments = await commentRepository.find({
            where: { article: { id: articleId } },
            relations: ["user", "likes", "parent"]
        });

        let userLikes: Like[] = [];
        if (requestingUser) {
            userLikes = await likeRepository.find({
                where: {
                    user: { id: requestingUser.id },
                    comment: { id: In(comments.map((comment) => comment.id)) }
                },
                relations: ["comment", "user"]
            });
        }

        const nestedComments = this.buildNestedComments(comments, userLikes);

        return res.status(200).json({
            ...articleToDTO,
            comments: nestedComments
        });
    }

    /**
     * Updates an article. It takes the article id from the request params,
     * and the article data from the request body. The article data can be
     * one of the following:
     * - title: The article title.
     * - content: The article content.
     * - imageUrl: The article image url.
     * - references: The article references.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The updated article response.
     * @throws {BadRequestError} If the requesting user is missing.
     */
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

        return res
            .status(200)
            .json({ ...response, message: "Article updated successfully." });
    }

    /**
     * Deletes an article. Uses TypeORM's transactions to delete the article and its comments to guarantee data integrity and consistency.
     * If fails, it will rollback the transaction and no data will be deleted.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A response with status 204 if the article is deleted successfully.
     * @throws {BadRequestError} if the requesting user is missing.
     * @throws {NotFoundError} if the article is not found.
     * @throws {UnauthorizedError} if the requesting user is not authorized to delete the article.
     * @throws {InternalServerError} if an error occurs during the deletion process.
     */
    async deleteArticle(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleId = req.params.articleId;

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    const requiredArticle = await articleRepository.findOne({
                        where: { id: articleId },
                        relations: ["user", "comments"]
                    });
                    if (!requiredArticle)
                        throw new NotFoundError("Article not found.");

                    if (
                        requestingUser.role !== UserRole.ADMIN &&
                        requestingUser.role !== UserRole.MODERATOR
                    )
                        throw new UnauthorizedError(
                            "You are not authorized to delete this comment."
                        );

                    await transactionalEntityManager.remove(requiredArticle);
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
            .end({ message: "Article deleted successfully." });
    }

    /**
     * Builds a nested comment structure based on the provided comments, user likes, and parent ID.
     *
     * @param comments - The array of comments to build the nested structure from.
     * @param userLikes - The array of user likes for the comments.
     * @param parentId - The ID of the parent comment. If null, root comments will be built.
     * @returns An array of CommentResponseDTO objects representing the nested comment structure.
     */
    private buildNestedComments(
        comments: Comment[],
        userLikes: Like[],
        parentId: string | null = null
    ): CommentResponseDTO[] {
        return comments
            .filter((comment) => {
                // If parentId is null, find root comments, else find children of the given parentId
                return parentId === null
                    ? !comment.parent
                    : comment.parent?.id === parentId;
            })
            .map((comment) => {
                const likedByCurrentUser = userLikes.some(
                    (like) => like.comment.id === comment.id
                );
                const commentDTO = CommentResponseDTO.fromEntity(
                    comment,
                    likedByCurrentUser
                );

                // Recursive call to build children comments
                commentDTO.children = this.buildNestedComments(
                    comments,
                    userLikes,
                    comment.id
                );

                return commentDTO;
            });
    }
}
