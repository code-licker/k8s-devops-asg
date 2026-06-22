import { AppDataSource } from "../configs/data-source";
import { Anime } from "../entities/Anime";
import axios from "axios";
import { Character } from "../entities/Character";

export class AnimeService {
    private animeRepository = AppDataSource.getRepository(Anime);
    private ANILIST_URL = 'https://graphql.anilist.co'

    async getAllAnime(): Promise<Anime[]> {
        return await this.animeRepository.find({
            relations: { characters: true }
        });
    }

    async getAnimeById(id: number): Promise<Anime | null> {

        const cachedAnime = await this.animeRepository.findOne({
            where: { id: id },
            relations: { characters: true }
        })

        if (cachedAnime) {
            console.log(`[Cache Hit] Found Anime ID ${id} in Database.`);
            return cachedAnime;
        }

        console.log(`[Cache Miss] Fetching Anime ID ${id} from AniList API`);

        const query = `
            query ($id: Int) {
                Media (id: $id, type: ANIME) {
                id
                title {
                    romaji
                    english
                }
                season
                seasonYear
                description
                characters (perPage: 10) {
                    nodes {
                    id
                    name {
                        full
                    }
                    image {
                        medium
                    }
                    }
                }
                }
            }
        `;

        try {
            const resAniList = await axios.post(
                this.ANILIST_URL, 
                {
                    query,
                    variables: { id: id }
                },
                {
                    headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    }
                }
            );

            const media = resAniList.data?.data?.Media;
            if (!media) return null;

            const newAnime = new Anime();
            newAnime.id = media.id;
            newAnime.titleRomaji = media.title.romaji;
            newAnime.titleEnglish = media.title.english;
            newAnime.season = media.season;
            newAnime.seasonYear = media.seasonYear;
            newAnime.description = media.description;

            newAnime.characters = media.characters.nodes.map((node: any) => {
                const char = new Character();
                char.id = node.id;
                char.name = node.name.full;
                char.image = node.image.medium;
                return char;
            });

            this.animeRepository.save(newAnime).catch((err) => 
                console.error('Failed to asynchronously save fetched anime into DB:', err)
            );

            return newAnime;

        } catch (error: any) {
            if (error.isAxiosError && error.response) {
                // This logs the exact validation message sent back by AniList's GraphQL engine
                console.error('❌ AniList API GraphQL Errors:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('❌ Error contacting AniList API:', error.message || error);
            }
            throw new Error('Failed to retrieve anime data.');
        }
    }

    async getAnimeCharacters(id: number, page: number): Promise<{ nodes: any[], hasNextPage: boolean }> {
        const query = `
            query ($id: Int, $page: Int) {
                Media (id: $id, type: ANIME) {
                    characters (page: $page, perPage: 10) {
                        pageInfo {
                            hasNextPage
                        }
                        nodes {
                            id
                            name {
                                full
                            }
                            image {
                                medium
                            }
                        }
                    }
                }
            }
        `;

        try {
            const resAniList = await axios.post(
                this.ANILIST_URL, 
                {
                    query,
                    variables: { id, page }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }
            );

            const media = resAniList.data?.data?.Media;
            if (!media || !media.characters) {
                return { nodes: [], hasNextPage: false };
            }

            const charactersData = media.characters;
            const nodes = charactersData.nodes || [];
            const hasNextPage = charactersData.pageInfo?.hasNextPage || false;

            // Cache characters in local DB and associate with the anime
            const anime = await this.animeRepository.findOne({
                where: { id: id },
                relations: { characters: true }
            });

            if (anime) {
                const newChars: Character[] = [];
                const characterRepository = AppDataSource.getRepository(Character);

                for (const node of nodes) {
                    let char = await characterRepository.findOne({ where: { id: node.id } });
                    if (!char) {
                        char = new Character();
                        char.id = node.id;
                        char.name = node.name.full;
                        char.image = node.image.medium;
                        await characterRepository.save(char);
                    }
                    newChars.push(char);
                }

                const existingIds = new Set(anime.characters.map(c => c.id));
                const charsToAppend = newChars.filter(c => !existingIds.has(c.id));
                if (charsToAppend.length > 0) {
                    anime.characters = [...anime.characters, ...charsToAppend];
                    await this.animeRepository.save(anime);
                }
            }

            return {
                nodes: nodes.map((node: any) => ({
                    id: node.id,
                    name: node.name.full,
                    image: node.image.medium
                })),
                hasNextPage
            };
        } catch (error: any) {
            console.error('❌ Failed to fetch page characters from AniList API:', error.message || error);
            throw new Error('Failed to retrieve characters.');
        }
    }
}