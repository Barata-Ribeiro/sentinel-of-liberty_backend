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
    /**
     * Creates a new comment for a specific article. It requires the article ID to be provided in the request parameters. The comment data is:
     * - message: The comment's message.
     * - parentId (OPTIONAL): The comment's parent ID.
     *
     * The parentId is provided by the client if the comment is a
     * reply to another comment. If it is not provided, it means that the comment is a reply to the article itself, that is, a top-level comment, and parentId is null.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The created comment and a success message.
     * @throws {BadRequestError} if the requesting user is missing.
     */
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

        return res
            .status(201)
            .json({ ...response, message: "Comment created successfully." });
    }

    /**
     * Edits a comment. It requires the comment ID to be provided in the request parameters. The comment data is:
     * - message: The comment's message.
     *
     * The parentId is not required since the editing operation does not change the comment's parent. The identification occurs by the comment ID provided in the route's URL.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns The updated comment and a success message.
     * @throws {BadRequestError} if the requesting user or comment id is missing.
     */
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

        return res.status(200).json({
            ...response,
            message: "Comment updated successfully."
        });
    }

    /**
     * Deletes a comment. Uses TypeORM's transactions to delete the comment and its likes to guarantee data integrity and consistency.
     * If fails, it will rollback the transaction and no data will be deleted.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A response with status 204 if the comment is deleted successfully.
     * @throws {BadRequestError} if the requesting user or comment id is missing.
     * @throws {NotFoundError} if the comment is not found.
     * @throws {UnauthorizedError} if the requesting user is not authorized to delete the comment.
     * @throws {InternalServerError} if an error occurs during the deletion process.
     */
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

        return res
            .status(204)
            .json({ message: "Comment deleted successfully." });
    }

    /**
     * Toggles the like status of a comment. If the user has already liked the comment, it will remove the like from the database.
     * Otherwise, it will add a new like to the database.
     * It requires the comment ID to be provided in the request parameters.
     *
     * @param req - The request object containing the authenticated user.
     * @param res - The response object to send the result.
     * @returns A JSON response indicating whether the like was added or removed.
     * It also returns a boolean indicating the current like status.
     * @throws {BadRequestError} if the requesting user or comment id is missing.
     */
    async toggleLike(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const commentId = req.params.commentId;
        if (!commentId) throw new BadRequestError("Missing comment id.");

        const response = await commentServices.toggleLike(
            requestingUser.id,
            commentId
        );

        return res.status(200).json({
            message: response ? "Like added." : "Like removed.",
            liked: response
        });
    }
}
