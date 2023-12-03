import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Article } from "./Article";
import { Like } from "./Like";
import { User } from "./User";

@Entity("comment_table")
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("text")
    message!: string;

    @OneToMany(() => Like, (like) => like.comment)
    likes!: Like[];

    @ManyToOne(() => User, (user) => user.comments, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    user!: User;

    @ManyToOne(() => Article, (article) => article.comments, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    article!: Article;

    @ManyToOne(() => Comment, (comment) => comment.children)
    parent?: Comment;

    @OneToMany(() => Comment, (comment) => comment.parent)
    children!: Comment[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    updatedAt!: Date;
}
