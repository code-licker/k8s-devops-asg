import { AppDataSource } from "../configs/data-source";
import { Anime } from "../entities/Anime";

export class AnimeService {
    private animeRepository = AppDataSource.getRepository(Anime);

    async getAnimeById(id: number): Promise<Anime | null> {

        const cachedAnime = await this.animeRepository.findOne({
            where: { id: id },
            relations: { episodes: true, characters: true }
        })

        if (cachedAnime) {
            console.log(`[Cache Hit] Found Anime ID ${id} in Database.`);
            return cachedAnime;
        }

        console.log(`[Cache Miss] Fetching Anime ID ${id} from AniList API`);

        // 2. Query AniList GraphQL API
        const query = `
        query ($id: Int) {
            Media (id: $id, type: ANIME) {
            id
            title { romaji english }
            season
            seasonYear
            description
            nextAiringEpisode { episode }
            characters (limit: 10) {
                    nodes { id name { full } image { medium } }
                }
            }
        }
        `;

        try {
            // const resAniList = 
        } catch (error) {
            
        }
    }
}