import { Comment } from "../entity/Comment";

/**
 * Represents a comment response data transfer object.
 */
export class CommentResponseDTO {
    id!: string;
    user!: {
        id: string;
        username: string;
        avatar: string;
    };
    textBody!: string;
    parentId?: string | null;
    likedByMe?: boolean;
    likeCount!: number;
    wasEdited!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    children?: CommentResponseDTO[];

    /**
     * Creates a CommentResponseDTO instance from a Comment entity.
     *
     * @param comment - The Comment entity.
     * @param likedByCurrentUser - Indicates if the comment is liked by the current user.
     * @returns The CommentResponseDTO instance.
     * @see Comment
     */
    static fromEntity(
        comment: Comment,
        likedByCurrentUser?: boolean
    ): CommentResponseDTO {
        const dto = new CommentResponseDTO();

        dto.user = {
            id: comment.user.id,
            username: comment.user.sol_username ?? comment.user.discordUsername,
            avatar: comment.user.discordAvatar
        };

        dto.id = comment.id;
        dto.user.id = comment.user.id;
        dto.user.username =
            comment.user.sol_username ?? comment.user.discordUsername;
        dto.user.avatar = comment.user.discordAvatar;
        dto.textBody = comment.textBody;
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
