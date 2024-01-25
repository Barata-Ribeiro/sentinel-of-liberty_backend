import { Request, Response } from "express";
import { NewsSuggestionResponseDTO } from "../dto/NewsSuggestionResponseDTO";
import { userArticleSummaryRepository } from "../repository/articleSummariesRepository";
import { newsSuggestionRepository } from "../repository/newsSuggestionRepository";

export class HomeController {
    /**
     * Retrieves the home-page content. It returns the first 10 articles and the first 10 news suggestions. The articles are ordered by creation date, descending.
     * If not data exists, it returns an empty array and the client should handle it.
     *
     * @param _req - The request object.
     * @param res - The response object.
     * @returns A JSON containing two arrays: The latest 10 articles and the latests 10 news suggestions.
     */
    async getHomeContent(_req: Request, res: Response): Promise<Response> {
        const firstTenArticles = await userArticleSummaryRepository.find({
            take: 10,
            order: { articleCreatedAt: "DESC" }
        });

        const firstTenSuggestionsEntities = await newsSuggestionRepository.find(
            {
                take: 10,
                order: { createdAt: "DESC" },
                relations: ["user", "articles"]
            }
        );

        const firstTenSuggestions = firstTenSuggestionsEntities.map(
            (suggestion) => NewsSuggestionResponseDTO.fromEntity(suggestion)
        );

        return res.status(200).json({
            articles: firstTenArticles,
            suggestions: firstTenSuggestions
        });
    }
}
