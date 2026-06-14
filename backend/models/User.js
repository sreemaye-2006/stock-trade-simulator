const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);
