import { AppDataSource } from "../database/data-source";
import { UserArticleSummary } from "../entity/ArticleSummary";

export const userArticleSummaryRepository =
    AppDataSource.getRepository(UserArticleSummary);
