import { User } from "../entity/User";

/**
 * Represents the response DTO for updating a user's profile.
 */
export class UserUpdateProfileResponseDTO {
    id!: string;
    sol_username?: string;
    sol_biography?: string;
    createdAt!: Date;
    updatedAt!: Date;

    /**
     * Creates a UserUpdateProfileResponseDTO instance from a User entity.
     *
     * @param user The User entity to create the DTO from.
     * @returns The created UserUpdateProfileResponseDTO instance.
     * @see User
     */
    static fromEntity(user: User): UserUpdateProfileResponseDTO {
        const dto = new UserUpdateProfileResponseDTO();

        dto.id = user.id;
        dto.sol_username = user.sol_username ?? "";
        dto.sol_biography = user.sol_biography ?? "";
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;

        return dto;
    }
}
