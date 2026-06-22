-- apps/anime-db/init.sql

-- PostgreSQL entrypoint automatically runs scripts in /docker-entrypoint-initdb.d/
-- TypeORM automatically synchronizes the table structures, but we can seed initial data:

INSERT INTO animes (id, "titleRomaji", "titleEnglish", season, "seasonYear", description)
VALUES 
(1, 'Cowboy Bebop', 'Cowboy Bebop', 'SPRING', 1998, 'Bounty hunters roam the solar system.'),
(21, 'One Piece', 'One Piece', 'FALL', 1999, 'Monkey D. Luffy searches for the ultimate treasure.'),
(1535, 'Death Note', 'Death Note', 'FALL', 2006, 'A high school student finds a notebook that kills anyone whose name is written in it.')
ON CONFLICT (id) DO NOTHING;
