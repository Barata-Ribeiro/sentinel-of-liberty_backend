import { AppDataSource } from "../database/data-source";
import { Comment } from "../entity/Comment";

export const commentRepository = AppDataSource.getRepository(Comment);
