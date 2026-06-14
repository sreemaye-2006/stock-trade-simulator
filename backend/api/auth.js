const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockDatabase = require('../models/mockDatabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_beginner_project';

router.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    if (mockDatabase.useMockDatabase) {
        const exists = mockDatabase.mockUsers.find(u => u.username === username);
        if (exists) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            _id: Math.random().toString(36).substring(7),
            username,
            password: hashedPassword,
            balance: 100000,
            portfolio: [],
            watchlist: [],
            transactions: []
        };
        mockDatabase.mockUsers.push(newUser);
        return res.json({ message: 'User registered successfully (In-Memory DB)' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Registration failed. User may already exist.' });
    }
});

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (mockDatabase.useMockDatabase) {
        const user = mockDatabase.mockUsers.find(u => u.username === username);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        return res.json({ token, user: { username: user.username, balance: user.balance } });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token, user: { username: user.username, balance: user.balance } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
