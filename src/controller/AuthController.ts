import { Request, Response } from "express";
import { BadRequestError } from "../middleware/helper/ApiError";
import { AuthServices } from "../service/AuthServices";

export class AuthController {
    async discordLoginRedirect(req: Request, res: Response): Promise<Response> {
        const { code } = req.query;

        if (!code) throw new BadRequestError("No code provided.");

        const accessTokenResponse = await AuthServices.discordLoginRedirect(
            code.toString()
        );

        return res.status(200).json(accessTokenResponse);
    }
}
