import { Request, Response } from "express";
import { BadRequestError } from "../middleware/helper/ApiError";
import { AuthServices } from "../service/AuthServices";

const authServices = new AuthServices();

export class AuthController {
    async discordLoginRedirect(req: Request, res: Response): Promise<Response> {
        const { code } = req.query;

        if (!code) throw new BadRequestError("No code provided.");

        const accessTokenResponse = await authServices.discordLoginRedirect(
            code.toString()
        );

        res.cookie("access_token", accessTokenResponse.access_token, {
            httpOnly: true,
            maxAge: accessTokenResponse.expires_in * 1000
        });

        res.cookie("refresh_token", accessTokenResponse.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false
        });

        return res.status(200).json({ message: "Login successful." });
    }
}
