import { User, UserRole } from "../entity/User";

export class UserResponseDTO {
    id!: string;
    discordUsername!: string;
    discordEmail!: string;
    discordAvatar!: string;
    solUsername!: string;
    solBiography!: string;
    role!: UserRole;
    isBanned!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(user: User): UserResponseDTO {
        const dto = new UserResponseDTO();

        dto.id = user.id;
        dto.discordUsername = user.discordUsername;
        dto.discordEmail = user.discordEmail;
        dto.discordAvatar = user.discordAvatar;
        dto.solUsername = user.sol_username ?? "John/Jane Doe";
        dto.role = user.role;
        dto.isBanned = user.isBanned;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;

        return dto;
    }
}
