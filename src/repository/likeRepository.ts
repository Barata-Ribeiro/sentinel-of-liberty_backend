import { AppDataSource } from "../database/data-source";
import { Like } from "../entity/Like";

export const likeRepository = AppDataSource.getRepository(Like);
