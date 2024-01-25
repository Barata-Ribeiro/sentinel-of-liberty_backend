import { NewsSuggestion } from "../entity/NewsSuggestion";

/**
 * Represents a response DTO for a news suggestion.
 */
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

    /**
     * Converts a NewsSuggestion entity to a NewsSuggestionResponseDTO.
     *
     * @param newsSuggestion - The NewsSuggestion entity to convert.
     * @returns The converted NewsSuggestionResponseDTO.
     * @see NewsSuggestion
     */
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
