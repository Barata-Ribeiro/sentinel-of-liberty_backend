import { NextFunction, Response } from "express";
import { JsonWebTokenError, verify } from "jsonwebtoken";
import { AuthRequest, JwtPayloadWithId } from "../@types/globalTypes";
import { userRepository } from "../repository/userRepository";
import { NotFoundError, UnauthorizedError } from "./helper/ApiError";

const OptionalAuthMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authToken = req.cookies?.authToken;
        if (!authToken) return next();

        const secretKey = process.env.JWT_SECRET_KEY!;
        if (!secretKey) throw new NotFoundError("Secret key not found");

        const verifiedToken = verify(authToken, secretKey) as JwtPayloadWithId;

        const actualUser = await userRepository.findOneBy({
            discordId: verifiedToken.discordId
        });
        if (!actualUser) throw new NotFoundError("User not found.");

        req.user = actualUser;
        await next();
    } catch (error) {
        if (error instanceof JsonWebTokenError)
            await next(new UnauthorizedError("Invalid or expired token."));
        else await next(error);
    }
};

export default OptionalAuthMiddleware;
