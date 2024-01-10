import { Request, Response } from "express";
import { In } from "typeorm";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
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

    async getAllSummaryArticles(_req: Request, res: Response) {
        const response = userArticleSummaryRepository.find({
            order: {
                articleCreatedAt: "DESC"
            },
            take: 10
        });

        return res.status(200).json(response);
    }

    async getArticleById(req: AuthRequest, res: Response) {
        const articleId = req.params.articleId;
        if (!articleId) throw new BadRequestError("Missing requesting user.");

        const article = await articleRepository.findOne({
            where: { id: articleId },
            relations: ["user", "basedOnNewsSuggestion"]
        });
        if (!article) throw new NotFoundError("Article not found.");

        const comments = await commentRepository.find({
            where: { article: { id: articleId } },
            relations: ["user", "likes", "parent"]
        });

        // Fetch likes by the current user for these comments
        let userLikes: Like[] = [];
        if (req.user) {
            userLikes = await likeRepository.find({
                where: {
                    user: { id: req.user.id },
                    comment: { id: In(comments.map((comment) => comment.id)) }
                }
            });
        }

        // Start building the comment tree with root comments
        const nestedComments = this.buildNestedComments(comments, userLikes);

        return res.status(200).json({
            ...article,
            comments: nestedComments
        });
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

        return res.status(204).end();
    }

    private buildNestedComments(
        comments: Comment[],
        userLikes: Like[],
        parentId: string | null = null
    ): CommentResponseDTO[] {
        // Filter and map the comments
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
