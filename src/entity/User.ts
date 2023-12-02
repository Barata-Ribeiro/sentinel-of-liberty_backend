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

export enum UserRole {
    ADMIN = "admin",
    MODERATOR = "moderator",
    WRITER = "writer",
    READER = "reader"
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

    @Column({ type: "varchar", length: 20, unique: true, nullable: false })
    @Index({ unique: true })
    sol_username!: string;

    @Column({ type: "varchar", length: 150 })
    sol_biography!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.READER
    })
    role!: UserRole;

    @OneToMany(() => Article, (article) => article.user, {
        cascade: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    articles!: Article[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}
