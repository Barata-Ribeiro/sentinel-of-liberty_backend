import { UserUpdateProfileResponseDTO } from "../dto/UserUpdateProfileResponseDTO";
import { User } from "../entity/User";
import { ConflictError } from "../middleware/helper/ApiError";
import { userRepository } from "../repository/userRepository";

interface UserDataRequest {
    sol_username?: string;
    sol_biography?: string;
}

export class UserServices {
    /**
     * Updates the account information of the requesting user
     * .
     * @param userData - The updated user data.
     * @param requestingUser - The user who is requesting the account update.
     * @returns The updated user profile response DTO.
     * @throws {ConflictError} - If the username is already taken.
     */
    async updateOwnAccount(userData: UserDataRequest, requestingUser: User) {
        const { sol_username, sol_biography } = userData;

        if (sol_username) {
            const existingUserByUsername = await userRepository.findOneBy({
                sol_username
            });

            if (
                existingUserByUsername &&
                existingUserByUsername.id !== requestingUser.id
            )
                throw new ConflictError("Username already taken.");

            requestingUser.sol_username = sol_username;
        }

        if (sol_biography) requestingUser.sol_biography = sol_biography;

        await userRepository.save(requestingUser);

        return UserUpdateProfileResponseDTO.fromEntity(requestingUser);
    }
}
