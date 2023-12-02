import { AppDataSource } from "../database/data-source";
import { User } from "../entity/User";

export const userRepository = AppDataSource.getRepository(User);
