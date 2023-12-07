import { NewsSuggestion } from "../entity/NewsSuggestion";
import { User } from "../entity/User";

export class NewsSuggestionResponseDTO {
    id!: string;
    user!: {
        id: string;
        username: string;
    };
    title!: string;
    content!: string;
    image!: string;
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(
        newsSuggestion: NewsSuggestion,
        user: User
    ): NewsSuggestionResponseDTO {
        const dto = new NewsSuggestionResponseDTO();

        dto.id = newsSuggestion.id;
        dto.user.id = user.id;
        dto.user.username = user.sol_username ?? user.discordUsername;
        dto.title = newsSuggestion.title;
        dto.content = newsSuggestion.content;
        dto.image = newsSuggestion.image;
        dto.createdAt = newsSuggestion.createdAt;
        dto.updatedAt = newsSuggestion.updatedAt;

        return dto;
    }

    static fromEntityWithRelations(
        newsSuggestion: NewsSuggestion
    ): NewsSuggestionResponseDTO {
        const dto = new NewsSuggestionResponseDTO();

        dto.user = {
            id: newsSuggestion.user.id,
            username:
                newsSuggestion.user.sol_username ??
                newsSuggestion.user.discordUsername
        };

        dto.id = newsSuggestion.id;
        dto.user.id = newsSuggestion.user.id;
        dto.user.username =
            newsSuggestion.user.sol_username ??
            newsSuggestion.user.discordUsername;
        dto.title = newsSuggestion.title;
        dto.content = newsSuggestion.content;
        dto.image = newsSuggestion.image;
        dto.createdAt = newsSuggestion.createdAt;
        dto.updatedAt = newsSuggestion.updatedAt;

        return dto;
    }
}