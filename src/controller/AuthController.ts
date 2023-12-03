import { Request, Response } from "express";
import { BadRequestError } from "../middleware/helper/ApiError";
import { AuthServices } from "../service/AuthServices";
const { sign } = require("jsonwebtoken");

const authServices = new AuthServices();

export class AuthController {
    async discordLoginRedirect(req: Request, res: Response): Promise<Response> {
        const { code } = req.query;

        if (!code) throw new BadRequestError("No code provided.");

        const accessTokenResponse = await authServices.discordLoginRedirect(
            code.toString()
        );

        res.cookie("refresh_token", accessTokenResponse.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false
        });

        const userDataResponse =
            await authServices.discordLoginSaveUserToDatabase(
                accessTokenResponse.access_token
            );

        const userAuthToken = await sign(
            {
                discordId: userDataResponse.id
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1d"
            }
        );

        res.cookie("authToken", userAuthToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: 86400000,
            expires: new Date(Date.now() + 86400000)
        });

        return res.status(200).json({ message: "Login successful." });
    }
}
