import { DataSource, ViewColumn, ViewEntity } from "typeorm";
import { Article } from "./Article";
import { Comment } from "./Comment";
import { User } from "./User";

@ViewEntity({
    expression: (dataSource: DataSource) =>
        dataSource
            .createQueryBuilder()
            .select("user.id", "userId")
            .addSelect(
                "COALESCE(user.sol_username, user.discordUsername)",
                "username"
            )
            .addSelect("article.id", "articleId")
            .addSelect("article.title", "articleTitle")
            .addSelect("article.contentSummary", "contentSummary")
            .addSelect("article.image", "articleImage")
            .addSelect("article.createdAt", "articleCreatedAt")
            .addSelect("COUNT(comment.id)", "commentCount")
            .from(User, "user")
            .leftJoin(Article, "article", "article.user = user.id")
            .leftJoin(Comment, "comment", "comment.article = article.id")
            .groupBy("article.id")
            .addGroupBy("user.id")
})
export class UserArticleSummary {
    @ViewColumn()
    userId!: string;

    @ViewColumn()
    username!: string;

    @ViewColumn()
    articleId!: string;

    @ViewColumn()
    articleTitle!: string;

    @ViewColumn()
    contentSummary!: string;

    @ViewColumn()
    articleImage!: string;

    @ViewColumn()
    articleCreatedAt!: Date;

    @ViewColumn()
    commentCount!: number;
}
