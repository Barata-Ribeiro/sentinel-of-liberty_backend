import { NextFunction, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { UnauthorizedError } from "./helper/ApiError";

const authAdminMiddleware = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    if (req.user && req.user.role === "admin") next();
    else next(new UnauthorizedError("User is not an admin."));
};

export default authAdminMiddleware;
