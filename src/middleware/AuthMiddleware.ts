import { NextFunction, Response } from "express";
import { JsonWebTokenError, verify } from "jsonwebtoken";
import { AuthRequest, JwtPayloadWithId } from "../@types/globalTypes";
import { userRepository } from "../repository/userRepository";
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError
} from "./helper/ApiError";

const authMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const { discordId } = req.cookies?.authToken;
    if (!discordId)
        throw new UnauthorizedError("No authenthication token provided.");

    const splitUserToken = discordId.split(" ")[1];

    try {
        const secretKey = process.env.JWT_SECRET_KEY!;
        if (!secretKey) throw new BadRequestError("Secret key not found");

        const { discordId } = verify(
            splitUserToken,
            secretKey
        ) as JwtPayloadWithId;

        const actualUser = await userRepository.findOneBy({ discordId });
        if (!actualUser) throw new NotFoundError("User not found.");

        req.user = actualUser;
        await next();
    } catch (error) {
        if (error instanceof JsonWebTokenError)
            await next(new UnauthorizedError("Invalid or expired token."));
        else await next(error);
    }
};

export default authMiddleware;
