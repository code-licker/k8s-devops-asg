import app from "./app";
import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./configs/data-source";

dotenv.config();

const port = process.env["PORT"] || 3001;

AppDataSource.initialize()
    .then(() => {
        console.log('📦 Database Connected successfully.');
        app.listen(port, () => console.log(`🚀 API Server active on port ${port}`));
    })
    .catch((error) => console.error('Database connection crash:', error));

