require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mockDatabase = require('./models/mockDatabase');
const authRouter = require('./api/auth');
const stocksRouter = require('./api/stocks');
const userRouter = require('./api/user');
const tradeRouter = require('./api/trade');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stock-simulator').then(() => {
    console.log('MongoDB connected successfully!');
}).catch(err => {
    console.log('MongoDB connection failed. Falling back to IN-MEMORY Mock Database!');
    mockDatabase.useMockDatabase = true;
});

app.use('/api', authRouter);
app.use('/api', stocksRouter);
app.use('/api', userRouter);
app.use('/api', tradeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
