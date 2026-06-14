const express = require('express');
const User = require('../models/User');
const mockDatabase = require('../models/mockDatabase');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/user', authMiddleware, async (req, res) => {
    if (mockDatabase.useMockDatabase) {
        const user = mockDatabase.mockUsers.find(u => u._id === req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password, ...safeUser } = user;
        return res.json(safeUser);
    }

    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/user/watchlist', authMiddleware, async (req, res) => {
    const { symbol } = req.body;

    if (mockDatabase.useMockDatabase) {
        const user = mockDatabase.mockUsers.find(u => u._id === req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const index = user.watchlist.indexOf(symbol);
        if (index > -1) {
            user.watchlist.splice(index, 1);
        } else {
            user.watchlist.push(symbol);
        }
        return res.json({ message: 'Watchlist updated', watchlist: user.watchlist });
    }

    try {
        const user = await User.findById(req.userId);
        const index = user.watchlist.indexOf(symbol);
        if (index > -1) {
            user.watchlist.splice(index, 1);
        } else {
            user.watchlist.push(symbol);
        }
        await user.save();
        res.json({ message: 'Watchlist updated', watchlist: user.watchlist });
    } catch (err) {
        res.status(500).json({ error: 'Watchlist update failed' });
    }
});

module.exports = router;
