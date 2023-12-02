import { NextFunction, Request, Response } from "express";
import { ApiError } from "./helper/ApiError";

const errorMiddleware = (
    error: Error & Partial<ApiError>,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response => {
    const statusCode = error.status ?? 500;
    const message = error.status ? error.message : "Internal Server Error";

    return res.status(statusCode).json({ message });
};

export default errorMiddleware;
