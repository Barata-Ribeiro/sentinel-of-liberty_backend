import { NextFunction, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { UnauthorizedError } from "./helper/ApiError";

/**
 * Middleware function to check if the user is a moderator or an admin.
 * If the user is not a mod or an admin, it throws an UnauthorizedError.
 *
 * @param req - The request object.
 * @param _res - The response object.
 * @param next - The next function to call.
 * @throws {UnauthorizedError} If the user is not a mod or an admin.
 */
const authModMiddleware = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    if (
        req.user &&
        (req.user.role === "admin" || req.user.role === "moderator")
    )
        next();
    else next(new UnauthorizedError("User is not a mod or an admin."));
};

export default authModMiddleware;
