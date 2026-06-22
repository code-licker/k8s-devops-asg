import { Request, Response } from 'express';
import { AnimeService } from '../services/anime.service';

const animeService = new AnimeService();

export const getAllAnime = async (_req: Request, res: Response): Promise<void> => {
  try {
    const animes = await animeService.getAllAnime();
    res.status(200).json(animes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnime = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid Anime ID' });
      return;
    }

    const anime = await animeService.getAnimeById(id);
    if (!anime) {
      res.status(404).json({ error: 'Anime not found on AniList or Local DB' });
      return;
    }

    res.status(200).json(anime);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnimeCharacters = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const page = parseInt(req.query['page'] as string) || 1;
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid Anime ID' });
      return;
    }

    const result = await animeService.getAnimeCharacters(id, page);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};