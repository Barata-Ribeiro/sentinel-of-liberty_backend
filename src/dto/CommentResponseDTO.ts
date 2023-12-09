import { Comment } from "../entity/Comment";

export class CommentResponseDTO {
    id!: string;
    user!: {
        id: string;
        username: string;
    };
    message!: string;
    parentId?: string;
    likeCount!: number;
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(comment: Comment): CommentResponseDTO {
        const dto = new CommentResponseDTO();

        dto.user = {
            id: comment.user.id,
            username: comment.user.sol_username ?? comment.user.discordUsername
        };

        dto.id = comment.id;
        dto.user.id = comment.user.id;
        dto.user.username =
            comment.user.sol_username ?? comment.user.discordUsername;
        dto.message = comment.message;
        dto.likeCount = comment.likeCount;
        dto.parentId = comment.parent?.id;
        dto.createdAt = comment.createdAt;
        dto.updatedAt = comment.updatedAt;

        return dto;
    }
}
