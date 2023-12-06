import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { BadRequestError } from "../middleware/helper/ApiError";
import { NewsSuggestionServices } from "../service/NewsSuggestionServices";

const newsSuggestionService = new NewsSuggestionServices();

export class NewsSuggestionController {
    async createNewsSuggestion(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const suggestionData = req.body;

        const response = await newsSuggestionService.createNewsSuggestion(
            requestingUser.id,
            suggestionData
        );

        return res.status(201).json(response);
    }

    async getAllNewsSuggestions(req: Request, res: Response) {}

    async getNewsSuggestionById(req: Request, res: Response) {}

    async updateNewsSuggestion(req: AuthRequest, res: Response) {}

    async deleteNewsSuggestion(req: AuthRequest, res: Response) {}
}
