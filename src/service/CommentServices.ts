import { CommentResponseDTO } from "../dto/CommentResponseDTO";
import { Comment } from "../entity/Comment";
import {
    InternalServerError,
    NotFoundError,
    UnauthorizedError
} from "../middleware/helper/ApiError";
import { articleRepository } from "../repository/articleRepository";
import { commentRepository } from "../repository/commentRepository";
import { likeRepository } from "../repository/likeRepository";
import { userRepository } from "../repository/userRepository";

interface CommentDataRequest {
    message: string;
    parentId?: string;
}

interface CommentDataUpdateRequest {
    message: string;
}

export class CommentServices {
    /**
     * Creates a new comment.
     *
     * @param userId - The ID of the user creating the comment.
     * @param articleId - The ID of the article the comment belongs to.
     * @param commentData - The data for the new comment.
     * @returns A promise that resolves to the created comment response DTO.
     * @throws {NotFoundError} If the user, article, or parent comment (if specified) is not found.
     */
    async createNewComment(
        userId: string,
        articleId: string,
        commentData: CommentDataRequest
    ): Promise<CommentResponseDTO> {
        const actualUser = await userRepository.findOneBy({
            id: userId
        });
        if (!actualUser) throw new NotFoundError("User not found");

        const actualArticle = await articleRepository.findOneBy({
            id: articleId
        });
        if (!actualArticle) throw new NotFoundError("Article not found");

        const newComment = new Comment();
        newComment.user = actualUser;
        newComment.article = actualArticle;
        newComment.message = commentData.message;

        if (commentData.parentId) {
            const parentComment = await commentRepository.findOneBy({
                id: commentData.parentId
            });
            if (!parentComment)
                throw new NotFoundError("Parent comment not found");

            newComment.parent = parentComment;
        }

        await commentRepository.save(newComment);

        return CommentResponseDTO.fromEntity(newComment);
    }

    /**
     * Updates a comment.
     *
     * @param userId - The ID of the user making the update.
     * @param commentId - The ID of the comment to be updated.
     * @param commentDataForUpdate - The updated comment data.
     * @returns A promise that resolves to the updated comment response DTO.
     * @throws {NotFoundError} If the comment is not found.
     * @throws {UnauthorizedError} If the user is not authorized to update the comment.
     */
    async updateComment(
        userId: string,
        commentId: string,
        commentDataForUpdate: CommentDataUpdateRequest
    ): Promise<CommentResponseDTO> {
        const actualComment = await commentRepository.findOne({
            where: { id: commentId },
            relations: ["user"]
        });
        if (!actualComment) throw new NotFoundError("Comment not found");

        if (actualComment.user.id !== userId)
            throw new UnauthorizedError("This is not your comment.");

        actualComment.message = commentDataForUpdate.message;
        actualComment.wasEdited = true;

        await commentRepository.save(actualComment);

        return CommentResponseDTO.fromEntity(actualComment);
    }

    /**
     * Toggles the like status of a comment for a given user.
     * If the user has already liked the comment, the like is removed.
     * If the user has not liked the comment, a new like is created.
     *
     * @param {string} userId - The ID of the user.
     * @param {string} commentId - The ID of the comment.
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the comment is liked or not.
     * @throws {InternalServerError} - If an error occurs while toggling the like.
     */
    async toggleLike(userId: string, commentId: string): Promise<boolean> {
        let like;
        let liked;

        try {
            like = await likeRepository.findOne({
                where: { user: { id: userId }, comment: { id: commentId } }
            });

            if (like) {
                await likeRepository.remove(like);
                liked = false;
            } else {
                like = likeRepository.create({
                    user: { id: userId },
                    comment: { id: commentId }
                });
                await likeRepository.save(like);
                liked = true;
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            throw new InternalServerError("Error toggling like.");
        }

        return liked;
    }
}
