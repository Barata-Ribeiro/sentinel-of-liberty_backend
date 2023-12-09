import { InternalServerError } from "../middleware/helper/ApiError";
import { likeRepository } from "../repository/likeRepository";

export class CommentServices {
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
