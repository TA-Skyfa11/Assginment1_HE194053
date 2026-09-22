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
    const comments = Array.isArray(data) ? data : data.comments || [];
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const comments = Array.isArray(data) ? data : data.comments;
    const comment = comments.find((c) => c.id === parseInt(req.params.id));
    if (comment) {
      res.status(200).json(comment);
    } else {
      res.status(404).json({ message: "Comment not found" });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = await readData();
    const comments = Array.isArray(data) ? data : data.comments || [];
    if (
      !req.body.articleId ||
      !req.body.content ||
      !req.body.author ||
      !req.body.date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newComments = {
      id: comments.length ? comments[comments.length - 1].id + 1 : 1,
      articleId: req.body.articleId,
      content: req.body.content,
      author: req.body.author,
      date: req.body.date,
    };
    comments.push(newComments);
    await writeData(Array.isArray(data) ? comments : { ...data, comments });
    res.status(201).json(newComments);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await readData();
    const comments = Array.isArray(data) ? data : data.comments || [];
    const commentIndex = comments.findIndex(
      (a) => a.id === parseInt(req.params.id),
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "comment not found" });
    if (commentIndex !== -1) {
      comments[commentIndex] = { ...comments[commentIndex], ...req.body };
      await writeData(Array.isArray(data) ? comments : { ...data, comments });
      res.status(200).json(comments[commentIndex]);
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await readData();
    const comments = Array.isArray(data) ? data : data.comments || [];
    const commentIndex = comments.findIndex(
      (a) => a.id === parseInt(req.params.id),
    );
    if (commentIndex !== -1) {
      const deletedcomment = comments.splice(commentIndex, 1);
      await writeData(Array.isArray(data) ? comments : { ...data, comments });
      res.status(200).json(deletedcomment[0]);
    } else {
      res.status(404).json({ message: "comment not found" });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
