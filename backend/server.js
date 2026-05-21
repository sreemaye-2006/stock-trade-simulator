require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dummyStocks = require('./dummyData');
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_beginner_project';

// MOCK IN-MEMORY DATABASE FALLBACK
let useMockDatabase = false;
let mockUsers = []; // Array of users for in-memory fallback

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stock-simulator').then(() => {
    console.log('MongoDB connected successfully!');
}).catch(err => {
    console.log('MongoDB connection failed. Falling back to IN-MEMORY Mock Database!');
    useMockDatabase = true;
});

// Mongoose Models
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 100000 },
    portfolio: [{
        symbol: String,
        quantity: Number,
        averagePrice: Number
    }],
    watchlist: [String],
    transactions: [{
        type: { type: String, enum: ['BUY', 'SELL'] },
        symbol: String,
        quantity: Number,
        price: Number,
        date: { type: Date, default: Date.now }
    }]
});
const User = mongoose.model('User', userSchema);

// Middleware for auth
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    if (useMockDatabase) {
        const exists = mockUsers.find(u => u.username === username);
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
        mockUsers.push(newUser);
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

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (useMockDatabase) {
        const user = mockUsers.find(u => u.username === username);
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

// --- STOCKS ROUTE ---
let lastUpdateTime = Date.now(); // Track the last update time

app.get('/api/stocks', (req, res) => {
    const currentTime = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Only update the dummy data prices if 5 minutes have passed
    if (currentTime - lastUpdateTime >= FIVE_MINUTES) {
        dummyStocks.forEach(stock => {
            // Random change between -3% and +3.5% for the period
            const percentChange = (Math.random() * 6.5) - 3;
            const priceDiff = stock.price * (percentChange / 100);
            stock.price = Math.max(1, stock.price + priceDiff);
            stock.change = percentChange;
            
            // Update the chart history
            stock.history.shift();
            stock.history.push(stock.price);
        });
        
        lastUpdateTime = currentTime; // Reset the 5-minute timer
    }
    
    // Return the dummy stocks. 
    // If it's been less than 5 mins, they get the exact same prices.
    res.json(dummyStocks);
});

// --- USER ROUTES ---

// Get Profile
app.get('/api/user', authMiddleware, async (req, res) => {
    if (useMockDatabase) {
        const user = mockUsers.find(u => u._id === req.userId);
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

// Buy Stock
app.post('/api/trade/buy', authMiddleware, async (req, res) => {
    const { symbol, quantity } = req.body;
    const stock = dummyStocks.find(s => s.symbol === symbol);
    if (!stock) return res.status(404).json({ error: 'Stock not found' });
    
    const cost = stock.price * quantity;

    if (useMockDatabase) {
        const user = mockUsers.find(u => u._id === req.userId);
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

// Sell Stock
app.post('/api/trade/sell', authMiddleware, async (req, res) => {
    const { symbol, quantity } = req.body;
    const stock = dummyStocks.find(s => s.symbol === symbol);
    if (!stock) return res.status(404).json({ error: 'Stock not found' });

    if (useMockDatabase) {
        const user = mockUsers.find(u => u._id === req.userId);
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

// Toggle Watchlist
app.post('/api/user/watchlist', authMiddleware, async (req, res) => {
    const { symbol } = req.body;

    if (useMockDatabase) {
        const user = mockUsers.find(u => u._id === req.userId);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
