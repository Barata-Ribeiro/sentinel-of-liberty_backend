import { NextFunction, Response } from "express";
import { JsonWebTokenError, verify } from "jsonwebtoken";
import { AuthRequest, JwtPayloadWithId } from "../@types/globalTypes";
import { userRepository } from "../repository/userRepository";
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError
} from "./helper/ApiError";

/**
 * Middleware function for authentication.
 * Verifies the authentication token provided in the request headers,
 * retrieves the user associated with the token, and attaches it to the request object.
 * If the token is invalid or expired, it throws an error.
 *
 * @param req - The request object.
 * @param _res - The response object.
 * @param next - The next function to call.
 * @throws {BadRequestError} If no authentication token is provided.
 * @throws {NotFoundError} If the secret key is not found or the user is not found.
 * @throws {UnauthorizedError} If the token is invalid or expired.
 */
const authMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authToken = req.headers.authorization?.split(" ")[1];
        if (!authToken)
            throw new BadRequestError("No authentication token provided.");

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

export default authMiddleware;
