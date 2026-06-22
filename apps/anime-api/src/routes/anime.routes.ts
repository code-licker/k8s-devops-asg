import { Router } from 'express';
import { getAnime, getAllAnime, getAnimeCharacters, getLoadStatus, toggleLoad, getHealth, getVersion } from '../controllers/anime.controller';

const router = Router();
router.get('/anime', getAllAnime);
router.get('/anime/:id', getAnime);
router.get('/anime/:id/characters', getAnimeCharacters);
router.get('/load', getLoadStatus);
router.post('/load', toggleLoad);
router.get('/health', getHealth);
router.get('/version', getVersion);
export default router;