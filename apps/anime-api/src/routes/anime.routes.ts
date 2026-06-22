import { Router } from 'express';
import { getAnime, getAllAnime } from '../controllers/anime.controller';

const router = Router();
router.get('/anime', getAllAnime);
router.get('/anime/:id', getAnime);
export default router;