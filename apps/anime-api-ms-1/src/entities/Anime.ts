import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Episode } from "./Episode";
import { Character } from "./Character";

@Entity('animes')
export class Anime {
    @PrimaryColumn()
    id!: number;

    @Column()
    titleRomaji!: string;

    @Column({ nullable: true })
    titleEnglish!: string;

    @Column({ nullable: true })
    season!: string;

    @Column({ nullable: true })
    seasonYear!: number;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @OneToMany(() => Episode, (episode) => episode.anime, { cascade: true })
    episodes!: Episode[];

    @ManyToMany(() => Character, (character) => character.animes, { cascade: true })
    @JoinTable()
    characters!: Character[];
}