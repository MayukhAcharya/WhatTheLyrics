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
    const lyricsUrl = await fetch(songUrl);
    const lyricsText = await lyricsUrl.text();

    const $ = cheerio.load(lyricsText);
    const lyricsInHtml = $('<div [data-lyrics-container="true"]>');

    return res.status(200).send({
      lyrics,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error",
      status: false,
      error: error.message,
    });
  }
};

module.exports = { lyricsSchema, lyricsHandler };
