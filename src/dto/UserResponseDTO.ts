import { User, UserRole } from "../entity/User";

/**
 * Represents a Data Transfer Object (DTO) for a user response.
 */
export class UserResponseDTO {
    id!: string;
    discordUsername!: string;
    discordEmail!: string;
    discordAvatar!: string;
    sol_username!: string;
    sol_biography!: string;
    role!: UserRole;
    isBanned!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    newsSuggested?: number;
    articles?: number;
    comments?: number;
    likes?: number;

    /**
     * Creates a UserResponseDTO object from a User entity.
     *
     * @param user The User entity to create the DTO from.
     * @returns The created UserResponseDTO object.
     * @see User
     */
    static fromEntity(user: User): UserResponseDTO {
        const dto = new UserResponseDTO();

        dto.id = user.id;
        dto.discordUsername = user.discordUsername;
        dto.discordEmail = user.discordEmail;
        dto.discordAvatar = user.discordAvatar;
        dto.sol_username = user.sol_username ?? "John/Jane Doe";
        dto.sol_biography = user.sol_biography ?? "";
        dto.role = user.role;
        dto.isBanned = user.isBanned;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;

        dto.newsSuggested = user.newsSuggested?.length;
        dto.articles = user.articles?.length;
        dto.comments = user.comments?.length;
        dto.likes = user.likes?.length;

        return dto;
    }
}
