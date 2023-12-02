import { AppDataSource } from "../database/data-source";
import { Article } from "../entity/Article";

export const articleRepository = AppDataSource.getRepository(Article);
