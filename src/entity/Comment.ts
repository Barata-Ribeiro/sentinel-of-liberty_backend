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

    @OneToMany(() => Like, (like) => like.comment, {
        cascade: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    likes!: Like[];

    @ManyToOne(() => User, (user) => user.comments)
    user!: User;

    @ManyToOne(() => Article, (article) => article.comments)
    article!: Article;

    @ManyToOne(() => Comment, (comment) => comment.children)
    parent?: Comment;

    @OneToMany(() => Comment, (comment) => comment.parent, {
        cascade: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
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
