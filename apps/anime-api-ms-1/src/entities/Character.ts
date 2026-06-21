import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { Anime } from './Anime';

@Entity('characters')
export class Character {
    @PrimaryColumn()
    id!: number; // AniList Character ID

    @Column()
    name!: string;

    @Column({ nullable: true })
    image!: string;

    @ManyToMany(() => Anime, (anime) => anime.characters)
    animes!: Anime[];
}