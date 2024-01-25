import { NewsSuggestionResponseDTO } from "../dto/NewsSuggestionResponseDTO";
import { NewsSuggestion } from "../entity/NewsSuggestion";
import { BadRequestError, NotFoundError } from "../middleware/helper/ApiError";
import { newsSuggestionRepository } from "../repository/newsSuggestionRepository";
import { userRepository } from "../repository/userRepository";

interface SuggestionDataRequest {
    source: string;
    title: string;
    content: string;
    imageUrl: string;
}

interface SuggestionDataUpdateRequest {
    source?: string;
    title?: string;
    content?: string;
    imageUrl?: string;
}

export class NewsSuggestionServices {
    /**
     * Creates a news suggestion.
     *
     * @param requestingUserId - The ID of the user making the suggestion.
     * @param suggestionBody - The data for the suggestion.
     * @returns A promise that resolves to the created news suggestion.
     * @throws {NotFoundError} If the user is not found.
     * @throws {BadRequestError} If the source URL is invalid, the title is too short, the content length is invalid, or the image URL is invalid.
     */
    async createNewsSuggestion(
        requestingUserId: string,
        suggestionBody: SuggestionDataRequest
    ): Promise<NewsSuggestionResponseDTO> {
        const actualUser = await userRepository.findOneBy({
            id: requestingUserId
        });
        if (!actualUser) throw new NotFoundError("User not found");

        if (suggestionBody.source.length <= 0)
            throw new BadRequestError("No source url.");

        const sourceUrl = new URL(suggestionBody.source);
        if (sourceUrl.protocol !== "https:")
            throw new BadRequestError("Invalid source url.");

        if (suggestionBody.title.length <= 10)
            throw new BadRequestError("Title too short.");

        if (
            suggestionBody.content.length < 10 ||
            suggestionBody.content.length > 100
        )
            throw new BadRequestError(
                "Suggestion content must be between 10 and 100 characters"
            );

        if (suggestionBody.imageUrl.length <= 0)
            throw new BadRequestError("No image url.");

        const newImageUrl = new URL(suggestionBody.imageUrl);
        if (newImageUrl.protocol !== "https:")
            throw new BadRequestError("Invalid image url.");

        const newSuggestion = new NewsSuggestion();
        newSuggestion.source = suggestionBody.source;
        newSuggestion.title = suggestionBody.title;
        newSuggestion.content = suggestionBody.content;
        newSuggestion.image = newImageUrl.toString();
        newSuggestion.user = actualUser;
        await newsSuggestionRepository.save(newSuggestion);

        return NewsSuggestionResponseDTO.fromEntity(newSuggestion);
    }

    /**
     * Updates a news suggestion with the provided data.
     *
     * @param newsId - The ID of the news suggestion to update.
     * @param suggestionBodyForUpdate - The data to update the news suggestion with.
     * @returns A promise that resolves to the updated news suggestion.
     * @throws {NotFoundError} If the news suggestion is not found.
     * @throws {BadRequestError} If the provided data is invalid.
     */
    async updateNewsSuggestion(
        newsId: string,
        suggestionBodyForUpdate: SuggestionDataUpdateRequest
    ): Promise<NewsSuggestionResponseDTO> {
        const requiredNews = await newsSuggestionRepository.findOne({
            where: { id: newsId },
            relations: ["user"]
        });
        if (!requiredNews)
            throw new NotFoundError("News suggestion not found.");

        const { source, title, content, imageUrl } = suggestionBodyForUpdate;

        if (source) {
            const sourceUrl = new URL(source);
            if (sourceUrl.protocol !== "https:")
                throw new BadRequestError("Invalid source url.");

            requiredNews.source = sourceUrl.toString();
        }

        if (title) {
            if (title.length <= 10)
                throw new BadRequestError("Title too short.");

            requiredNews.title = title;
        }

        if (content) {
            if (content.length < 10 || content.length > 100)
                throw new BadRequestError(
                    "Suggestion content must be between 10 and 100 characters"
                );

            requiredNews.content = content;
        }

        if (imageUrl) {
            if (imageUrl.length <= 0)
                throw new BadRequestError("No image url.");

            requiredNews.image = imageUrl;
        }

        await newsSuggestionRepository.save(requiredNews);

        return NewsSuggestionResponseDTO.fromEntity(requiredNews);
    }
}
