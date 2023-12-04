import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "./Comment";
import { User } from "./User";

@Entity("like_table")
export class Like {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.likes)
    @JoinColumn({ name: "userId" })
    user!: User;

    @ManyToOne(() => Comment, (comment) => comment.likes)
    @JoinColumn({ name: "commentId" })
    comment!: Comment;
}
