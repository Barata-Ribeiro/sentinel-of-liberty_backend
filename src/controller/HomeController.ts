import { Request, Response } from "express";
import { NewsSuggestionResponseDTO } from "../dto/NewsSuggestionResponseDTO";
import { userArticleSummaryRepository } from "../repository/articleSummariesRepository";
import { newsSuggestionRepository } from "../repository/newsSuggestionRepository";

export class HomeController {
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
