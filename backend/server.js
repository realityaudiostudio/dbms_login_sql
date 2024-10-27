// backend/server.js
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users',
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Login Route
app.post('/login', (req, res) => {
    console.log("Request Body:", req.body);
    const { username, password } = req.body;

    // Ensure that username and password fields are provided
    if (!username || !password) {
        return res.status(400).json({ msg: 'Username and password are required' });
    }

    // Proceed with checking if the user exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ msg: 'Server error' });
        }
        if (result.length === 0) {
            console.error(result.length);
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check password (compare plaintext)
        const user = result[0];
        if (user.password !== password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username } });
    });
});

// Middleware to check token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ msg: 'No token provided' });

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(500).json({ msg: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

// Protected Route
app.get('/user', verifyToken, (req, res) => {
    db.query('SELECT username FROM users WHERE id = ?', [req.userId], (err, result) => {
        if (err) throw err;
        res.json({ username: result[0].username });
    });
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
