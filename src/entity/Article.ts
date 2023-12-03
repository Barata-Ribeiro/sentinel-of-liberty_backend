import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Comment } from "./Comment";
import { NewsSuggestion } from "./NewsSuggestion";
import { User } from "./User";

@Entity("article_table")
export class Article {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.articles)
    user!: User;

    @Column({ type: "varchar", length: "100", nullable: false })
    title!: string;

    @Column({ type: "text", length: "2500", nullable: false })
    content!: string;

    @Column({ type: "varchar", length: "255", nullable: false })
    image!: string;

    @Column({ type: "text", length: "200", nullable: false })
    contentSummary!: string;

    @Column("text", { array: true, nullable: false })
    references!: string[];

    @ManyToOne(
        () => NewsSuggestion,
        (newsSuggestion) => newsSuggestion.articles,
        { nullable: true }
    )
    basedOnNewsSuggestion?: NewsSuggestion;

    @OneToMany(() => Comment, (comment) => comment.article)
    comments!: Comment[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}
