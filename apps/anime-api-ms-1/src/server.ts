import app from "./app";
import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();

const port = process.env["PORT"] || 3001;

app.listen(port, () => {
    console.log(`Anime server is running on port ${port}`);
});
