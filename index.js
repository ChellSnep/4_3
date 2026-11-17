"use strict";

const express = require("express");
const { setEngine } = require("node:crypto");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const cors = require("cors");
app.use(cors());

app.use(express.json());

let categories = ["funnyJoke", "lameJoke"];

let funnyJoke = [
  {
    joke: "Dlaczego komputer poszedł do lekarza?",
    response: "Bo złapał wirusa!",
  },
  {
    joke: "Dlaczego komputer nie może być głodny?",
    response: "Bo ma pełen dysk!",
  },
  {
    joke: "Co mówi jeden bit do drugiego?",
    response: "„Trzymaj się, zaraz się przestawiamy!”",
  },
];

let lameJoke = [
  {
    joke: "Dlaczego programiści preferują noc?",
    response: "Bo w nocy jest mniej bugów do łapania!",
  },
  {
    joke: "Jak nazywa się bardzo szybki programista?",
    response: "Błyskawiczny kompilator!",
  },
];

const jokebook = { funnyJoke, lameJoke };

app.get("/jokebook/categories", (req, res) => {
  res.json(categories);
});

app.get("/jokebook/joke/:category", (req, res) => {
  const category = req.params.category;

  if (!categories.includes(category)) {
    return res.json({ error: `no jokes for category ${category}` });
  }

  const list = jokebook[category];
  const randomJoke = list[Math.floor(Math.random() * list.length)];
  res.json(randomJoke);
});

app.get("/jokebook/random", (req, res) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const list = jokebook[category];
  const randomJoke = list[Math.floor(Math.random() * list.length)];
  res.json({ category, ...randomJoke });
});

// TODO 2
app.post("/jokebook/joke/:category", (req, res) => {
  const category = req.params.category;

  if (!categories.includes(category)) {
    return res.json({ error: `no jokes for category ${category}` });
  }

  const { joke, response } = req.body || {};

  if (!joke || !response) {
    return res.status(400).json({ error: "Invalid input" });
  }

  jokebook[category].push({ joke, response });

  res.status(201).json({
    message: `Joke added to category ${category}`,
    joke: { joke, response },
  });
});

app.get("/jokebook/stats", (req, res) => {
  const stats = {};

  categories.forEach((category) => {
    stats[category] = jokebook[category].length;
  });

  res.json(stats);
});

app.get("/jokebook/search", (req, res) => {
  const word = req.query.word;

  if (typeof word !== "string" || word.trim() === "") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const keyword = word.trim().toLowerCase();
  const results = [];

  categories.forEach((category) => {
    jokebook[category].forEach((item) => {
      const text = `${item.joke} ${item.response}`.toLowerCase();
      if (text.includes(keyword)) {
        results.push({ category, joke: item.joke, response: item.response });
      }
    });
  });

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
