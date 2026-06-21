import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Anime } from "./Anime";

@Entity('episodes')
export class Episode {
    @PrimaryColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    episodeNumber!: number;

    @ManyToOne(() => Anime, (anime) => anime.episodes, { onDelete: 'CASCADE'})
    anime!: Anime;
}