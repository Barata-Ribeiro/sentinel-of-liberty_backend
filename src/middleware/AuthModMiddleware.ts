import { NextFunction, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { UnauthorizedError } from "./helper/ApiError";

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
