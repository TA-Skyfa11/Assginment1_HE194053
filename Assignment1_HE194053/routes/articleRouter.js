const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data.json");
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading data file:", err);
    return [];
  }
}

async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing data file:", err);
  }
}
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const articles = Array.isArray(data) ? data : data.articles || [];
    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const articles = Array.isArray(data) ? data : data.articles;
    const article = articles.find((a) => a.id === parseInt(req.params.id));
    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ message: "Article not found" });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = await readData();
    const articles = Array.isArray(data) ? data : data.articles || [];
    if (
      !req.body.title ||
      !req.body.content ||
      !req.body.author ||
      !req.body.date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newArticles = {
      id: articles.length ? articles[articles.length - 1].id + 1 : 1,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      date: req.body.date,
    };
    articles.push(newArticles);
    await writeData(Array.isArray(data) ? articles : { ...data, articles });
    res.status(201).json(newArticles);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await readData();
    const articles = Array.isArray(data) ? data : data.articles || [];
    const articleIndex = articles.findIndex(
      (a) => a.id === parseInt(req.params.id),
    );
    if (articleIndex === -1)
      return res.status(404).json({ message: "Article not found" });
    if (articleIndex !== -1) {
      articles[articleIndex] = { ...articles[articleIndex], ...req.body };
      await writeData(Array.isArray(data) ? articles : { ...data, articles });
      res.status(200).json(articles[articleIndex]);
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res) => {
    try {
    const data = await readData();
    const articles = Array.isArray(data) ? data : data.articles || [];
    const articleIndex = articles.findIndex(
      (a) => a.id === parseInt(req.params.id),
    );
        if (articleIndex !== -1) {
            const deletedArticle = articles.splice(articleIndex, 1);
            await writeData(Array.isArray(data) ? articles : { ...data, articles });
            res.status(200).json(deletedArticle[0]);
        }
        else {
            res.status(404).json({ message: 'Article not found' });
        }
    }
    catch (err) {
        next(err);
    }
});
module.exports = router;
