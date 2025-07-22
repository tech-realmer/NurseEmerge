const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data file path
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');

// Helper functions
async function readPosts() {
    try {
        const data = await fs.readFile(POSTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writePosts(posts) {
    try {
        await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing posts:', error);
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await readPosts();
        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(sortedPosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/posts', async (req, res) => {
    try {
        const { title, content, author, category, tags, featured, newsletter } = req.body;
        
        if (!title || !content || !author || !category) {
            return res.status(400).json({ message: 'Title, content, author, and category are required' });
        }
        
        if (content.length < 200) {
            return res.status(400).json({ message: 'Content must be at least 200 characters long' });
        }
        
        const newPost = {
            id: generateId(),
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
            category: category.trim(),
            tags: tags ? tags.trim() : null,
            featured: Boolean(featured),
            newsletter: Boolean(newsletter),
            date: new Date().toISOString()
        };
        
        const posts = await readPosts();
        posts.push(newPost);
        
        const success = await writePosts(posts);
        if (!success) {
            throw new Error('Failed to save post');
        }
        
        res.status(201).json({ message: 'Post created successfully', post: newPost });
        
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Nurse Emerge Blog API server running on port ${PORT}`);
});

module.exports = app;
