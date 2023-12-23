import { User } from "../entity/User";

export class UserUpdateProfileResponseDTO {
    id!: string;
    sol_username?: string;
    sol_biography?: string;
    createdAt!: Date;
    updatedAt!: Date;

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
