import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/User";

/**
 * Interface for an Express request with an attached user object.
 */
export interface AuthRequest extends Request {
    /**
     * The user object attached to the request.
     */
    user?: User;
}

/**
 * Interface for a JWT payload with an additional Discord ID field.
 */
export interface JwtPayloadWithId extends JwtPayload {
    /**
     * The Discord user ID.
     */
    discordId: string;
}
