import { Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
import { UserRole } from "../entity/User";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError
} from "../middleware/helper/ApiError";
import { commentRepository } from "../repository/commentRepository";
import { CommentServices } from "../service/CommentServices";

const commentServices = new CommentServices();

export class CommentController {
    async createNewComment(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleId = req.params.articleId;

        const commentData = req.body;

        const response = await commentServices.createNewComment(
            requestingUser.id,
            articleId,
            commentData
        );

        return res.status(201).json(response);
    }

    async editComment(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const commentId = req.params.commentId;
        if (!commentId) throw new BadRequestError("Missing comment id.");

        const commentDataForUpdate = req.body;

        const response = await commentServices.updateComment(
            requestingUser.id,
            commentId,
            commentDataForUpdate
        );

        return res.status(200).json(response);
    }

    async deleteComment(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const commentId = req.params.commentId;
        if (!commentId) throw new BadRequestError("Missing comment id.");

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    const requiredComment = await commentRepository.findOne({
                        where: { id: commentId },
                        relations: ["user"]
                    });

                    if (!requiredComment)
                        throw new NotFoundError("Comment not found.");

                    if (
                        requiredComment.user.id !== requestingUser.id &&
                        requestingUser.role !== UserRole.ADMIN &&
                        requestingUser.role !== UserRole.MODERATOR
                    ) {
                        throw new UnauthorizedError(
                            "You are not authorized to delete this comment."
                        );
                    }

                    await transactionalEntityManager.remove(requiredComment);
                } catch (error) {
                    console.error("Transaction failed:", error);
                    throw new InternalServerError(
                        "An error occurred during the deletion process."
                    );
                }
            }
        );

        return res.status(204).json();
    }

    async toggleLike(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const commentId = req.params.commentId;

        const response = await commentServices.toggleLike(
            requestingUser.id,
            commentId
        );

        return res.status(200).json({
            message: response ? "Like added." : "Like removed."
        });
    }
}
