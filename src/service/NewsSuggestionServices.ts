import { NewsSuggestionResponseDTO } from "../dto/NewsSuggestionResponseDTO";
import { NewsSuggestion } from "../entity/NewsSuggestion";
import { BadRequestError, NotFoundError } from "../middleware/helper/ApiError";
import { newsSuggestionRepository } from "../repository/newsSuggestionRepository";
import { userRepository } from "../repository/userRepository";

interface SuggestionDataRequest {
    title: string;
    content: string;
    imageUrl: string;
}

interface SuggestionDataUpdateRequest {
    title?: string;
    content?: string;
    imageUrl?: string;
}

export class NewsSuggestionServices {
    async createNewsSuggestion(
        requestingUserId: string,
        suggestionBody: SuggestionDataRequest
    ): Promise<NewsSuggestionResponseDTO> {
        const actualUser = await userRepository.findOneBy({
            id: requestingUserId
        });
        if (!actualUser) throw new NotFoundError("User not found");

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

        const newSuggestion = new NewsSuggestion();
        newSuggestion.title = suggestionBody.title;
        newSuggestion.content = suggestionBody.content;
        newSuggestion.image = suggestionBody.imageUrl;
        newSuggestion.user = actualUser;
        await newsSuggestionRepository.save(newSuggestion);

        return NewsSuggestionResponseDTO.fromEntity(newSuggestion, actualUser);
    }

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

        const { title, content, imageUrl } = suggestionBodyForUpdate;

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

        return NewsSuggestionResponseDTO.fromEntityWithRelations(requiredNews);
    }
}
