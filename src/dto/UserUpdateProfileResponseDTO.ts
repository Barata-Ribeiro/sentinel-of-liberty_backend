import { User } from "../entity/User";

export class UserUpdateProfileResponseDTO {
    id!: string;
    sol_username?: string;
    solBiography?: string;
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(user: User): UserUpdateProfileResponseDTO {
        const dto = new UserUpdateProfileResponseDTO();

        dto.id = user.id;
        dto.sol_username = user.sol_username ?? "";
        dto.solBiography = user.sol_biography ?? "";
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;

        return dto;
    }
}
