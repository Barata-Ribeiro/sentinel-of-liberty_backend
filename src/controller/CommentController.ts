import { Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { BadRequestError } from "../middleware/helper/ApiError";
import { CommentServices } from "../service/CommentServices";

const commentServices = new CommentServices();

export class CommentController {
    async createNewComment(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const articleId = req.params.articleId;

        const commentData = req.body;

        const response = await commentServices.createNewComment(
            requestingUser.id,
            articleId,
            commentData
        );

        return res.status(201).json(response);
    }

    async editComment(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const commentId = req.params.commentId;
        if (!commentId) throw new BadRequestError("Missing comment id.");

        const commentDataForUpdate = req.body;

        const response = await commentServices.updateComment(
            requestingUser.id,
            commentId,
            commentDataForUpdate
        );

        return res.status(200).json(response);
    }

    async deleteComment(req: AuthRequest, res: Response) {
        return res.status(204).json();
    }

    async toggleLike(req: AuthRequest, res: Response) {
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const commentId = req.params.commentId;

        const response = await commentServices.toggleLike(
            requestingUser.id,
            commentId
        );

        return res.status(200).json({
            message: response ? "Like added." : "Like removed."
        });
    }
}
