const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Express API',
    })
})

app.use('/articles', articleRouter);
app.use('/comments', commentRouter);
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found',
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});