const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'public/uploads/' });

app.use(express.static('public'));

// Load posts
let posts = [];
const postsFile = path.join(__dirname, 'data', 'posts.json');
if (fs.existsSync(postsFile)) {
  const data = fs.readFileSync(postsFile, 'utf8');
  posts = JSON.parse(data);
}

// Save posts
function savePosts() {
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
}

// GET /api/posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// GET /api/posts/:id
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// POST /api/posts
app.post('/api/posts', upload.single('photo'), (req, res) => {
  const { title, content } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    date: new Date().toISOString(),
    imagePath
  };
  posts.push(newPost);
  savePosts();
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
