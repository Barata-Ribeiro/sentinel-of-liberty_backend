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

export class NewsSuggestionServices {
    async createNewsSuggestion(
        requestingUserId: string,
        suggestionBody: SuggestionDataRequest
    ) {
        const actualUser = await userRepository.findOneBy({
            id: requestingUserId
        });
        if (!actualUser) throw new NotFoundError("User not found");

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
}
