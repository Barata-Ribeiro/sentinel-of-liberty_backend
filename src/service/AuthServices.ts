import axios from "axios";
import url from "url";
import {
    ForbiddenError,
    InternalServerError
} from "../middleware/helper/ApiError";
import { userRepository } from "../repository/userRepository";

interface AccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

interface UserResponse {
    id: string;
    discordId: string;
    username: string;
    global_name: string;
    avatar: string;
    email?: string;
    locale?: string;
}

interface UserLoginResponse {
    authData: UserResponse;
    existingUsername: string | null;
}

export class AuthServices {
    /**
     * Saves user data to the database after logging in with Discord.
     *
     * @param token - The Discord access token.
     * @returns A promise that resolves to a UserResponse object containing the user data.
     * @throws {ForbiddenError} If the user is banned.
     * @throws {InternalServerError} If an error occurs during the process.
     */
    async discordLoginSaveUserToDatabase(
        token: string
    ): Promise<UserLoginResponse> {
        try {
            const userResponse = await axios.get(
                "https://discord.com/api/v10/users/@me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept-Encoding": "application/x-www-form-urlencoded"
                    }
                }
            );

            const userData: UserResponse = {
                id: "",
                discordId: userResponse.data.id,
                username: userResponse.data.username,
                global_name: userResponse.data.global_name,
                avatar: userResponse.data.avatar,
                email: userResponse.data.email,
                locale: userResponse.data.locale
            };

            let usernameIfUserExists: string | null = "";

            const checkIfUserExists = await userRepository.findOneBy({
                discordId: userData.discordId
            });

            if (checkIfUserExists) {
                if (checkIfUserExists.isBanned)
                    throw new ForbiddenError("User is banned.");

                const updatedUser = {
                    ...checkIfUserExists,
                    discordId: userData.discordId,
                    discordUsername: userData.username,
                    discordEmail: userData.email,
                    discordAvatar: `https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.avatar}.png`
                };

                await userRepository.save(updatedUser);
                userData.id = updatedUser.id;
                usernameIfUserExists =
                    updatedUser.discordUsername ?? updatedUser.sol_username;
            } else {
                const newUser = await userRepository.create({
                    discordId: userData.discordId,
                    discordUsername: userData.username,
                    discordEmail: userData.email,
                    discordAvatar: `https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.avatar}.png`
                });

                await userRepository.save(newUser);
                userData.id = newUser.id;
            }

            return {
                authData: userData,
                existingUsername: usernameIfUserExists ?? null
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response)
                throw new Error(error.response.data.message);
            throw new InternalServerError("Something went wrong.");
        }
    }

    /**
     * Performs a Discord login redirect and retrieves an access and refresh tokens.
     *
     * @param code The authorization code obtained from the Discord OAuth2 flow.
     * @returns A promise that resolves to an AccessTokenResponse object containing the access and refresh tokens.
     * @throws If an error occurs during the login redirect process.
     */
    async discordLoginRedirect(code: string): Promise<AccessTokenResponse> {
        const formData = new url.URLSearchParams();
        formData.append("client_id", process.env.DISCORD_CLIENT_ID || "");
        formData.append(
            "client_secret",
            process.env.DISCORD_CLIENT_SECRET || ""
        );
        formData.append("grant_type", "authorization_code");
        formData.append("code", code);
        formData.append(
            "redirect_uri",
            process.env.DISCORD_CLIENT_REDIRECT_URL || ""
        );

        let tokenData;

        try {
            const tokenResponse = await axios.post(
                "https://discord.com/api/v10/oauth2/token",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            tokenData = tokenResponse.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response)
                throw new Error(error.response.data.message);
            throw new InternalServerError("Something went wrong.");
        }

        return tokenData;
    }
}
