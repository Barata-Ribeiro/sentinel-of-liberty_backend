import { NextFunction, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { UnauthorizedError } from "./helper/ApiError";

/**
 * Middleware that checks if the user is an admin.
 * If the user is an admin, the next middleware is called.
 * Otherwise, an UnauthorizedError is thrown.
 *
 * @param req - The request object.
 * @param _res - The response object.
 * @param next - The next function to call.
 * @throws {UnauthorizedError} If the user is not an admin.
 */
const authAdminMiddleware = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    if (req.user && req.user.role === "admin") next();
    else next(new UnauthorizedError("User is not an admin."));
};

export default authAdminMiddleware;
