import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Article } from "./Article";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { NewsSuggestion } from "./NewsSuggestion";

export enum UserRole {
    ADMIN = "admin",
    MODERATOR = "moderator",
    WRITER = "writer",
    READER = "reader",
    BANNED = "banned"
}

@Entity("user_table")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true })
    @Index({ unique: true })
    discordId!: string;

    @Column({ type: "varchar", unique: true })
    @Index({ unique: true })
    discordUsername!: string;

    @Column({ type: "varchar", unique: true })
    @Index({ unique: true })
    discordEmail!: string;

    @Column({ type: "varchar" })
    discordAvatar!: string;

    @Column({ type: "varchar", length: 20, unique: true, nullable: true })
    @Index({ unique: true })
    sol_username!: string;

    @Column({ type: "varchar", length: 150, nullable: true })
    sol_biography!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.READER
    })
    role!: UserRole;

    @OneToMany(() => NewsSuggestion, (suggestion) => suggestion.user, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    newsSuggested!: NewsSuggestion[];

    @OneToMany(() => Article, (article) => article.user, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    articles!: Article[];

    @OneToMany(() => Comment, (comment) => comment.user, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    comments!: Comment[];

    @OneToMany(() => Like, (like) => like.user, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    likes!: Like[];

    @Column({ default: false })
    isBanned!: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    updatedAt!: Date;
}
