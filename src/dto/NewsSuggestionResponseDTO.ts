import { NewsSuggestion } from "../entity/NewsSuggestion";

export class NewsSuggestionResponseDTO {
    id!: string;
    user!: {
        id: string;
        username: string;
    };
    source!: string;
    title!: string;
    content!: string;
    image!: string;
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(
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
        dto.source = newsSuggestion.source;
        dto.title = newsSuggestion.title;
        dto.content = newsSuggestion.content;
        dto.image = newsSuggestion.image;
        dto.createdAt = newsSuggestion.createdAt;
        dto.updatedAt = newsSuggestion.updatedAt;

        return dto;
    }
}
