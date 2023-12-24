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
import { User } from "./User";

@Entity("news_suggestion_table")
export class NewsSuggestion {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.newsSuggested)
    user!: User;

    @Column({ type: "varchar", length: "255", nullable: false })
    source!: string;

    @Column({ type: "varchar", length: "100", nullable: false })
    title!: string;

    @Column({ type: "text", nullable: false })
    content!: string;

    @Column({ type: "varchar", length: "255", nullable: false })
    image!: string;

    @OneToMany(() => Article, (article) => article.basedOnNewsSuggestion, {
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
