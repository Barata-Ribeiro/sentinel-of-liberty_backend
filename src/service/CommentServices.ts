import { CommentResponseDTO } from "../dto/CommentResponseDTO";
import { Comment } from "../entity/Comment";
import {
    InternalServerError,
    NotFoundError
} from "../middleware/helper/ApiError";
import { articleRepository } from "../repository/articleRepository";
import { commentRepository } from "../repository/commentRepository";
import { likeRepository } from "../repository/likeRepository";
import { userRepository } from "../repository/userRepository";

interface CommentDataRequest {
    message: string;
    parentId?: string;
}

export class CommentServices {
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
