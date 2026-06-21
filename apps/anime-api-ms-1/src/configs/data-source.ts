import "reflect-metadata";
import { DataSource } from "typeorm";
import { Anime } from "../entities/Anime";
import { Episode } from "../entities/Episode";
import { Character } from "../entities/Character";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    username: process.env["DB_USER"] || 'postgres',
    password: process.env["DB_PASSWORD"] || 'password',
    database: process.env["DB_NAME"] || 'anime_db',
    synchronize: true, // Turn off in real production; use migrations instead!
    logging: false,
    entities: [Anime, Episode, Character],
});
