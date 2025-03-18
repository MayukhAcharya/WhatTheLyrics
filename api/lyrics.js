const { default: axios } = require("axios");
const { application, json } = require("express");
const { validationResult, param } = require("express-validator");
const cheerio = require("cheerio");
require("dotenv").config();

const lyricsSchema = [param("song").notEmpty().withMessage("song is required")];

const lyricsHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { song } = req.params;
  const updateSongWithSpace = song.replace(" ", "%20");

  try {
    if (song === "" || song === " ") {
      return res.status(400).send({
        message: "Song cannot be empty",
        status: false,
      });
    }
    const response = await axios.get(
      `${process.env.API_ENDPOINT}?q=${updateSongWithSpace}`,
      {
        headers: {
          "Content-Type": application / json,
          Authorization: `Bearer ${process.env.TOKEN}`,
        },
      }
    );

    const songUrl = response.data.response.hits[0].result.url;
    const songName = response.data.response.hits[0].result.title;
    let allArtists = response.data.response.hits[0].result.artist_names;

    const lyricsUrl = await fetch(songUrl);
    const lyricsText = await lyricsUrl.text();

    const $ = cheerio.load(lyricsText);
    const lyricsFromHtml = $("div[data-lyrics-container=true]");
    const albumData = $(".PrimaryAlbum__Title-sc-ed119306-4").text();

    let lyrics = "";
    lyricsFromHtml.each((_, element) => {
      lyrics += cheerio
        .load(cheerio.load(element).html().replace(/<br>/gi, "\n"))
        .text();
      lyrics += "\n";
    }); //in this traversal cheerio gets into every div where the lyrics are loaded and replaces the <br> with "\n" and ultimately converts it into a plain text

    if (allArtists === "Genius Romanizations") {
      const fullTitleSong = response.data.response.hits[0].result.full_title;
      allArtists = fullTitleSong.split("-")[0].trim();
    }

    if (lyricsFromHtml) {
      return res.status(200).send({
        songName: songName,
        songArtist: allArtists,
        songAlbum: albumData,
        lyrics: lyrics,
      });
    } else {
      return res.status(400).send({
        message: "Lyrics not found",
        status: false,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Error",
      status: false,
      error: error.message,
    });
  }
};

module.exports = { lyricsSchema, lyricsHandler };
