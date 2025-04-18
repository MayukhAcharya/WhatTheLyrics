const express = require("express");
const app = express();

const lyrics = require("./api/lyrics");

app.use(express.json());

app.get("/lyrics/:song", lyrics.lyricsSchema, lyrics.lyricsHandler);

app.listen(3000);
