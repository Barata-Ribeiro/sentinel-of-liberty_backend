import axios from "axios";
import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import {
    BadRequestError,
    InternalServerError
} from "../middleware/helper/ApiError";
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

        return res.status(200).json({
            authToken: userAuthToken,
            refreshToken: accessTokenResponse.refresh_token,
            message: "Login successful."
        });
    }

    async discordLogout(req: AuthRequest, res: Response): Promise<Response> {
        const refreshTokenCookie = req.cookies?.refresh_token;
        if (!refreshTokenCookie)
            throw new BadRequestError("No refresh token provided.");

        try {
            await axios.post(
                "https://discord.com/api/v10/oauth2/token/revoke",
                {
                    token: refreshTokenCookie,
                    token_type_hint: "refresh_token"
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: process.env.DISCORD_CLIENT_ID ?? "",
                        password: process.env.DISCORD_CLIENT_SECRET ?? ""
                    }
                }
            );
        } catch (error) {
            if (axios.isAxiosError(error) && error.response)
                throw new Error(error.response.data.message);
            throw new InternalServerError("Something went wrong.");
        }

        res.clearCookie("refresh_token");
        res.clearCookie("authToken");

        return res
            .status(200)
            .json({ message: "You have successfully logged out!" });
    }
}
