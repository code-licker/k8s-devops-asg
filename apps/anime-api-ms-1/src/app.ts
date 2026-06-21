import express from 'express';

const app = express();

app.get('/', (_, res) => {
    res.json({ message: "Welcome to Anime API Microservice!!" });
});

export default app;