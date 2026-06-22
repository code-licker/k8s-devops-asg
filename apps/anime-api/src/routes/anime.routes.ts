import { Router } from 'express';
import { getAnime, getAllAnime, getAnimeCharacters } from '../controllers/anime.controller';

const router = Router();
router.get('/anime', getAllAnime);
router.get('/anime/:id', getAnime);
router.get('/anime/:id/characters', getAnimeCharacters);
export default router;