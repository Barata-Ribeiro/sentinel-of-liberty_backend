import { ArticleResponseDTO } from "../dto/ArticleResponseDTO";
import { Article } from "../entity/Article";
import { BadRequestError, NotFoundError } from "../middleware/helper/ApiError";
import { articleRepository } from "../repository/articleRepository";
import { newsSuggestionRepository } from "../repository/newsSuggestionRepository";
import { userRepository } from "../repository/userRepository";

interface ArticleDataRequest {
    title: string;
    content: string;
    imageUrl: string;
    references: string;
    basedOnNewsSuggestionId?: string;
}

interface ArticleDataUpdateRequest {
    title?: string;
    content?: string;
    imageUrl?: string;
    references?: string;
}

export class ArticleServices {
    async createNewArticle(
        requestingUserId: string,
        articleBody: ArticleDataRequest
    ): Promise<ArticleResponseDTO> {
        const actualUser = await userRepository.findOneBy({
            id: requestingUserId
        });
        if (!actualUser) throw new NotFoundError("User not found");

        if (articleBody.title.length <= 10)
            throw new BadRequestError("Title too short.");

        if (
            articleBody.content.length < 1500 ||
            articleBody.content.length > 2500
        )
            throw new BadRequestError(
                "Article content must be between 1500 and 2500 characters."
            );

        if (articleBody.references.length <= 0)
            throw new BadRequestError("No references.");

        if (articleBody.imageUrl.length <= 0)
            throw new BadRequestError("No image url.");

        const parsingReferences = articleBody.references.split(",");
        const parsingContentSummary =
            articleBody.content.substring(0, 150) + "...";

        const newArticle = new Article();
        newArticle.user = actualUser;
        newArticle.title = articleBody.title;
        newArticle.content = articleBody.content;
        newArticle.image = articleBody.imageUrl;
        newArticle.contentSummary = parsingContentSummary;
        newArticle.references = parsingReferences;
        if (articleBody.basedOnNewsSuggestionId) {
            const newsSuggestion = await newsSuggestionRepository.findOneBy({
                id: articleBody.basedOnNewsSuggestionId
            });
            if (!newsSuggestion)
                throw new NotFoundError("News suggestion not found");

            newArticle.basedOnNewsSuggestion = newsSuggestion;
        }

        await articleRepository.save(newArticle);

        return ArticleResponseDTO.fromEntity(newArticle);
    }

    async updateArticle(
        articleId: string,
        articleBodyForUpdate: ArticleDataUpdateRequest
    ): Promise<ArticleResponseDTO> {
        const requiredArticle = await articleRepository.findOne({
            where: { id: articleId },
            relations: ["user", "basedOnNewsSuggestion"]
        });
        if (!requiredArticle)
            throw new NotFoundError("News suggestion not found.");

        const { title, content, imageUrl, references } = articleBodyForUpdate;

        if (title) {
            if (title.length <= 10)
                throw new BadRequestError("Title too short.");

            requiredArticle.title = title;
        }

        if (content) {
            if (content.length < 1500 || content.length > 2500)
                throw new BadRequestError(
                    "Article content must be between 1500 and 2500 characters."
                );

            const parsingContentSummary = content.substring(0, 150) + "...";

            requiredArticle.content = content;
            requiredArticle.contentSummary = parsingContentSummary;
        }

        if (imageUrl) {
            if (imageUrl.length <= 0)
                throw new BadRequestError("No image url.");

            requiredArticle.image = imageUrl;
        }

        if (references) {
            if (references.length <= 0)
                throw new BadRequestError("No references.");

            const parsingReferences = references.split(",");

            requiredArticle.references = parsingReferences;
        }

        await articleRepository.save(requiredArticle);

        return ArticleResponseDTO.fromEntity(requiredArticle);
    }
}
