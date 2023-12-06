import { AppDataSource } from "../database/data-source";
import { NewsSuggestion } from "../entity/NewsSuggestion";

export const newsSuggestionRepository =
    AppDataSource.getRepository(NewsSuggestion);
