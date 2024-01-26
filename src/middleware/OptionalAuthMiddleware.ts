import { NextFunction, Response } from "express";
import { JsonWebTokenError, verify } from "jsonwebtoken";
import { AuthRequest, JwtPayloadWithId } from "../@types/globalTypes";
import { userRepository } from "../repository/userRepository";
import { NotFoundError, UnauthorizedError } from "./helper/ApiError";

/**
 * Middleware function that handles optional authentication.
 * If an authorization token is provided in the request headers, it verifies the token,
 * retrieves the corresponding user, and attaches it to the request object.
 * If no token is provided, it simply calls the next middleware.
 * It functions similarly to the authMiddleware function, but it does not throw an error if no token is provided.
 * @see authMiddleware
 *
 * @param req - The request object.
 * @param _res - The response object.
 * @param next - The next middleware function.
 * @throws {NotFoundError} If the secret key is not found or the user is not found.
 * @throws {UnauthorizedError} If the token is invalid or expired.
 */
const OptionalAuthMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authToken = req.headers.authorization?.split(" ")[1];
        if (!authToken) {
            await next();
            return;
        }

        const secretKey = process.env.JWT_SECRET_KEY!;
        if (!secretKey) throw new NotFoundError("Secret key not found");

        const verifiedToken = verify(authToken!, secretKey) as JwtPayloadWithId;

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
