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
    /**
     * Retrieves all users.
     *
     * @param _req - The request object.
     * @param res - The response object.
     * @returns A JSON containing all users.
     *
     * @deprecated it's not used anywhere in the client.
     */
    async getAllUsers(_req: Request, res: Response): Promise<Response> {
        const allUsers = await userRepository.find();

        const usersResponse = allUsers.map((user) =>
            UserResponseDTO.fromEntity(user)
        );

        return res.status(200).json(usersResponse);
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A JSON containing all the user's necessary information.
     * @throws {NotFoundError} if the user is not found.
     */
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

    /**
     * Updates the user's own account. It takes the user's id from the request params and the following data from the request body:
     * - sol_username: The user's new username.
     * - sol_biography: The user's new biography.
     * Both are optional. These are properties of the user entity and have no relation to the Discord user data.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A JSON containing the updated user's data and a success message.
     * @throws {BadRequestError} if the requesting user is missing.
     */
    async updateOwnAccount(req: AuthRequest, res: Response): Promise<Response> {
        const userData = req.body;
        const requestingUser = req.user;

        if (!requestingUser)
            throw new BadRequestError("Missing requesting user.");

        const response = await userServices.updateOwnAccount(
            userData,
            requestingUser
        );

        return res.status(200).json({
            ...response,
            message: "You successfully updated the account."
        });
    }

    /**
     * Deletes the user's own account. Uses TypeORM's transactions to delete the user and all its relations to guarantee data integrity and consistency.
     * If fails, it will rollback the transaction and no data will be deleted.
     *
     * @param req - The request object containing the user ID.
     * @param res - The response object.
     * @returns A promise that resolves to the response object.
     * @throws {BadRequestError} if the requesting user is missing or if the user ID does not match the requesting user's ID.
     * @throws {NotFoundError} if the user is not found.
     * @throws {InternalServerError} if an error occurs during the deletion process.
     */
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

        return res
            .status(204)
            .end({ message: "Account deleted successfully." });
    }

    /**
     * Admin route that serves to delete a user account by ID. Uses TypeORM's transactions to delete the user and all its relations to guarantee data integrity and consistency.
     * If fails, it will rollback the transaction and no data will be deleted.
     *
     * @param req - The request object containing the user ID and authenticated user.
     * @param res - The response object.
     * @returns A promise that resolves to the response indicating the success of the deletion.
     * @throws {BadRequestError} if the requesting user is missing.
     * @throws {NotFoundError} if the user to delete is not found.
     * @throws {InternalServerError} if an error occurs during the deletion process.
     */
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

        return res
            .status(204)
            .end({ message: "Account deleted successfully." });
    }

    /**
     * Admin route that serves to ban a user by their ID. It sets the user's 'isBanned' property to true and their role to 'BANNED'.
     *
     * @param req - The request object containing the user ID and authenticated user.
     * @param res - The response object.
     * @returns A success message.
     * @throws {BadRequestError} if the requesting user is missing.
     * @throws {NotFoundError} if the user to ban is not found.
     */
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
     * It logs out the user from Discord by revoking the refresh token after the user deletes their own SoL account. Clears the authentication cookies as well. It will require the refresh token provided by Discord, which is stored in a cookie by the client.
     *
     * @todo Remove the cookie request, and instead, require the
     * refresh token to be provided in the request body. And make the cookie deletion be of the client's responsibility.
     *
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
