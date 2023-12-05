import { UserDataRequest } from "../@types/globalTypes";
import { UserUpdateProfileResponseDTO } from "../dto/UserUpdateProfileResponseDTO";
import { User } from "../entity/User";
import { ConflictError } from "../middleware/helper/ApiError";
import { userRepository } from "../repository/userRepository";

export class UserServices {
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
