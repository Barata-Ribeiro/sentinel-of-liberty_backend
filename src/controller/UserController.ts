import axios from "axios";
import { Request, Response } from "express";
import { AuthRequest } from "../@types/globalTypes";
import { AppDataSource } from "../database/data-source";
import { UserResponseDTO } from "../dto/UserResponseDTO";
import { UserRole } from "../entity/User";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError
} from "../middleware/helper/ApiError";
import { userRepository } from "../repository/userRepository";
import { UserServices } from "../service/UserServices";

const userServices = new UserServices();

export class UserController {
    async getAllUsers(_req: Request, res: Response): Promise<Response> {
        const allUsers = await userRepository.find();

        const usersResponse = allUsers.map((user) =>
            UserResponseDTO.fromEntity(user)
        );

        return res.status(200).json(usersResponse);
    }

    async getUserById(req: Request, res: Response): Promise<Response> {
        const userId = req.params.userId;

        const requiredUser = await userRepository.findOne({
            where: { id: userId },
            relations: ["articles", "newsSuggested", "comments", "likes"]
        });
        if (!requiredUser) throw new NotFoundError("User not found.");

        const userResponse = UserResponseDTO.fromEntity(requiredUser);

        return res.status(200).json(userResponse);
    }

    async updateOwnAccount(req: AuthRequest, res: Response): Promise<Response> {
        const userData = req.body;
        const requestingUser = req.user;

        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const response = await userServices.updateOwnAccount(
            userData,
            requestingUser
        );

        return res.status(200).json(response);
    }

    async deleteOwnAccount(req: AuthRequest, res: Response): Promise<Response> {
        const userId = req.params.userId;
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        if (requestingUser.id !== userId)
            throw new BadRequestError(
                "You can't delete another user's account."
            );

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    const findRequestingUserAgain =
                        await userRepository.findOne({
                            where: { id: userId },
                            relations: [
                                "articles",
                                "comments",
                                "newsSuggested",
                                "likes"
                            ]
                        });

                    if (!findRequestingUserAgain)
                        throw new NotFoundError("User not found.");

                    await transactionalEntityManager.remove(
                        findRequestingUserAgain
                    );

                    await this.removeLoginCookies(req, res);
                } catch (error) {
                    console.error("Transaction failed:", error);
                    throw new InternalServerError(
                        "An error occurred during the deletion process."
                    );
                }
            }
        );

        return res.status(204).end();
    }

    async deleteUserAccount(
        req: AuthRequest,
        res: Response
    ): Promise<Response> {
        const userId = req.params.userId;
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        await AppDataSource.manager.transaction(
            async (transactionalEntityManager) => {
                try {
                    const findUserToDelete = await userRepository.findOne({
                        where: { id: userId },
                        relations: [
                            "articles",
                            "comments",
                            "newsSuggested",
                            "likes"
                        ]
                    });

                    if (!findUserToDelete)
                        throw new NotFoundError("User not found.");

                    await transactionalEntityManager.remove(findUserToDelete);
                } catch (error) {
                    console.error("Transaction failed:", error);
                    throw new InternalServerError(
                        "An error occurred during the deletion process."
                    );
                }
            }
        );

        return res.status(204).end();
    }

    async banUserById(req: AuthRequest, res: Response): Promise<Response> {
        const userId = req.params.userId;
        const requestingUser = req.user;
        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const userToBan = await userRepository.findOneBy({ id: userId });
        if (!userToBan) throw new NotFoundError("User not found.");

        userToBan.isBanned = true;
        userToBan.role = UserRole.BANNED;
        await userRepository.save(userToBan);

        return res.status(200).json({ message: "User has been banned." });
    }

    /**
     * Removes the Discord login cookies from the response.
     * @param req The request object.
     * @param res The response object.
     */
    private async removeLoginCookies(req: AuthRequest, res: Response) {
        const refreshTokenCookie = req.cookies?.refreshToken;
        if (!refreshTokenCookie)
            throw new BadRequestError("No refresh token provided.");

        try {
            await axios.post(
                "https://discord.com/api/v10/oauth2/token/revoke",
                {
                    token: refreshTokenCookie,
                    token_type_hint: "refresh_token"
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: process.env.DISCORD_CLIENT_ID ?? "",
                        password: process.env.DISCORD_CLIENT_SECRET ?? ""
                    }
                }
            );
        } catch (error) {
            if (axios.isAxiosError(error) && error.response)
                throw new Error(error.response.data.message);
            throw new InternalServerError("Something went wrong.");
        }

        res.clearCookie("refreshToken");
        res.clearCookie("authToken");
        res.clearCookie("userData");
        res.clearCookie("userId");
    }
}
