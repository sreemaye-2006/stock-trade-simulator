const express = require('express');
const User = require('../models/User');
const mockDatabase = require('../models/mockDatabase');
const authMiddleware = require('../middleware/authMiddleware');
const dummyStocks = require('../dummyData');

const router = express.Router();

router.post('/trade/buy', authMiddleware, async (req, res) => {
    const { symbol, quantity } = req.body;
    const stock = dummyStocks.find(s => s.symbol === symbol);
    if (!stock) return res.status(404).json({ error: 'Stock not found' });

    const cost = stock.price * quantity;

    if (mockDatabase.useMockDatabase) {
        const user = mockDatabase.mockUsers.find(u => u._id === req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.balance < cost) return res.status(400).json({ error: 'Insufficient funds' });

        user.balance -= cost;
        const portfolioIndex = user.portfolio.findIndex(p => p.symbol === symbol);
        if (portfolioIndex > -1) {
            const p = user.portfolio[portfolioIndex];
            const totalCost = (p.quantity * p.averagePrice) + cost;
            p.quantity += quantity;
            p.averagePrice = totalCost / p.quantity;
        } else {
            user.portfolio.push({ symbol, quantity, averagePrice: stock.price });
        }
        user.transactions.push({ type: 'BUY', symbol, quantity, price: stock.price, date: new Date() });
        return res.json({ message: 'Stock bought successfully', user });
    }

    try {
        const user = await User.findById(req.userId);
        if (user.balance < cost) return res.status(400).json({ error: 'Insufficient funds' });

        user.balance -= cost;
        const portfolioIndex = user.portfolio.findIndex(p => p.symbol === symbol);
        if (portfolioIndex > -1) {
            const p = user.portfolio[portfolioIndex];
            const totalCost = (p.quantity * p.averagePrice) + cost;
            p.quantity += quantity;
            p.averagePrice = totalCost / p.quantity;
        } else {
            user.portfolio.push({ symbol, quantity, averagePrice: stock.price });
        }

        user.transactions.push({ type: 'BUY', symbol, quantity, price: stock.price });
        await user.save();
        res.json({ message: 'Stock bought successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Buy failed' });
    }
});

router.post('/trade/sell', authMiddleware, async (req, res) => {
    const { symbol, quantity } = req.body;
    const stock = dummyStocks.find(s => s.symbol === symbol);
    if (!stock) return res.status(404).json({ error: 'Stock not found' });

    if (mockDatabase.useMockDatabase) {
        const user = mockDatabase.mockUsers.find(u => u._id === req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const portfolioIndex = user.portfolio.findIndex(p => p.symbol === symbol);
        if (portfolioIndex === -1 || user.portfolio[portfolioIndex].quantity < quantity) {
            return res.status(400).json({ error: 'Not enough shares to sell' });
        }

        const revenue = stock.price * quantity;
        user.balance += revenue;

        user.portfolio[portfolioIndex].quantity -= quantity;
        if (user.portfolio[portfolioIndex].quantity === 0) {
            user.portfolio.splice(portfolioIndex, 1);
        }

        user.transactions.push({ type: 'SELL', symbol, quantity, price: stock.price, date: new Date() });
        return res.json({ message: 'Stock sold successfully', user });
    }

    try {
        const user = await User.findById(req.userId);
        const portfolioIndex = user.portfolio.findIndex(p => p.symbol === symbol);

        if (portfolioIndex === -1 || user.portfolio[portfolioIndex].quantity < quantity) {
            return res.status(400).json({ error: 'Not enough shares to sell' });
        }

        const revenue = stock.price * quantity;
        user.balance += revenue;

        user.portfolio[portfolioIndex].quantity -= quantity;
        if (user.portfolio[portfolioIndex].quantity === 0) {
            user.portfolio.splice(portfolioIndex, 1);
        }

        user.transactions.push({ type: 'SELL', symbol, quantity, price: stock.price });
        await user.save();
        res.json({ message: 'Stock sold successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Sell failed' });
    }
});

module.exports = router;
