import { Article } from "../entity/Article";

/**
 * Represents a Data Transfer Object (DTO) for an article response.
 */
export class ArticleResponseDTO {
    id!: string;
    user!: {
        id: string;
        username: string;
        avatar: string;
    };
    title!: string;
    content!: string;
    image!: string;
    contentSummary!: string;
    references!: string[];
    basedOnNewsSuggestion?: {
        id: string;
        title: string;
        source: string;
    };
    createdAt!: Date;
    updatedAt!: Date;

    /**
     * Converts an Article entity to an ArticleResponseDTO.
     *
     * @param article - The Article entity to convert.
     * @returns The converted ArticleResponseDTO.
     * @see Article
     */
    static fromEntity(article: Article): ArticleResponseDTO {
        const dto = new ArticleResponseDTO();

        dto.user = {
            id: article.user.id,
            username: article.user.sol_username ?? article.user.discordUsername,
            avatar: article.user.discordAvatar
        };

        dto.id = article.id;
        dto.user.id = article.user.id;
        dto.user.username =
            article.user.sol_username ?? article.user.discordUsername;
        dto.title = article.title;
        dto.content = article.content;
        dto.image = article.image;
        dto.contentSummary = article.contentSummary;
        dto.references = article.references;
        if (article.basedOnNewsSuggestion) {
            dto.basedOnNewsSuggestion = {
                id: article.basedOnNewsSuggestion.id,
                title: article.basedOnNewsSuggestion.title,
                source: article.basedOnNewsSuggestion.source
            };
        }
        dto.createdAt = article.createdAt;
        dto.updatedAt = article.updatedAt;

        return dto;
    }
}
