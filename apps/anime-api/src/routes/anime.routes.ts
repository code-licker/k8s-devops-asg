import { Router } from 'express';
import { getAnime } from '../controllers/anime.controller';

const router = Router();
router.get('/anime/:id', getAnime);
export default router;