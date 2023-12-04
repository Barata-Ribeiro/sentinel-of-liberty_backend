import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/User";

export interface AuthRequest extends Request {
    user?: User;
}

export interface JwtPayloadWithId extends JwtPayload {
    discordId: string;
}
