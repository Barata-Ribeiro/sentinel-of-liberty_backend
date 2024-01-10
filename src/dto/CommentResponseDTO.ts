import { Comment } from "../entity/Comment";

export class CommentResponseDTO {
    id!: string;
    user!: {
        id: string;
        username: string;
    };
    message!: string;
    parentId?: string | null;
    likedByMe?: boolean;
    likeCount!: number;
    wasEdited!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    children?: CommentResponseDTO[];

    static fromEntity(
        comment: Comment,
        likedByCurrentUser?: boolean
    ): CommentResponseDTO {
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
        dto.parentId = comment.parent ? comment.parent.id : null;
        dto.likedByMe = likedByCurrentUser;
        dto.likeCount = comment.likeCount;
        dto.wasEdited = comment.wasEdited;
        dto.createdAt = comment.createdAt;
        dto.updatedAt = comment.updatedAt;
        dto.children = comment.children
            ? comment.children.map((child) =>
                  CommentResponseDTO.fromEntity(child)
              )
            : [];

        return dto;
    }
}
