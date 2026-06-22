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

let loadActive = false;
let loadTimer: NodeJS.Timeout | null = null;

function generateCPULoad() {
  if (!loadActive) return;
  const startTime = Date.now();
  while (Date.now() - startTime < 50) {
    Math.random() * Math.random();
  }
  loadTimer = setTimeout(generateCPULoad, 5);
}

export const getLoadStatus = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ active: loadActive });
};

export const toggleLoad = async (req: Request, res: Response): Promise<void> => {
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    res.status(400).json({ error: 'Field "active" must be a boolean' });
    return;
  }

  if (active && !loadActive) {
    loadActive = true;
    console.log('⚡ Starting HPA test CPU load simulation...');
    generateCPULoad();
  } else if (!active && loadActive) {
    loadActive = false;
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
    console.log('💤 Stopping HPA test CPU load simulation.');
  }

  res.status(200).json({ active: loadActive });
};

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { AppDataSource } = await import('../configs/data-source');
    const isDbConnected = AppDataSource.isInitialized;
    if (isDbConnected) {
      await AppDataSource.query('SELECT 1');
      res.status(200).json({ status: 'UP', database: 'connected' });
      return;
    }
    res.status(503).json({ status: 'DOWN', database: 'disconnected' });
  } catch (error: any) {
    res.status(503).json({ status: 'DOWN', database: 'disconnected', error: error.message });
  }
};

export const getVersion = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ version: '2.0.0' });
};