import express from 'express';
import cors from 'cors';
import animeRoutes from './routes/anime.routes';
import { getHealth, getVersion } from './controllers/anime.controller';

const app = express();

app.use(cors());
app.use(express.json());
app.use(`/api`, animeRoutes);

app.get('/', (_, res) => {
    res.json({ message: "Welcome to Anime API Microservice!!" });
});

app.get('/health', getHealth);
app.get('/version', getVersion);

export default app;