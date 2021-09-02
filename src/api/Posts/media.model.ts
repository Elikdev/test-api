import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Post } from "./post.model";
import { MediaType } from "../../enums";

@Entity({ name: "media" })
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  url: string;

  @Column()
  user_id: number;

  @ManyToOne(() => Post, (post) => post.media, { onDelete: "CASCADE" })
  @JoinColumn()
  post: Post;

  @Column({ type: "enum", enum: MediaType, nullable: false })
  type: MediaType;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  updated_at: Date;
}
