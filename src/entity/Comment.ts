import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Article } from "./Article";
import { Like } from "./Like";
import { User } from "./User";

@Entity("comment_table")
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("text")
    textBody!: string;

    @OneToMany(() => Like, (like) => like.comment, {
        cascade: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    likes!: Like[];

    @Column({ type: "int", default: 0 })
    likeCount!: number;

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

    @Column({ type: "boolean", default: false })
    wasEdited!: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    updatedAt!: Date;
}
