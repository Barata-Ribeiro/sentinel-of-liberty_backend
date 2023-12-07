import { Response } from "express";
import { AuthRequest } from "../@types/globalTypes";

export class CommentController {
    async createNewComment(req: AuthRequest, res: Response) {
        return res.status(201).json();
    }

    async editComment(req: AuthRequest, res: Response) {
        return res.status(200).json();
    }

    async deleteComment(req: AuthRequest, res: Response) {
        return res.status(204).json();
    }

    async toggleLike(req: AuthRequest, res: Response) {
        return res.status(200).json();
    }
}
