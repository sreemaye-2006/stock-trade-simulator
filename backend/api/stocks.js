const express = require('express');
const dummyStocks = require('../dummyData');

const router = express.Router();
let lastUpdateTime = Date.now();

router.get('/stocks', (req, res) => {
    const currentTime = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (currentTime - lastUpdateTime >= FIVE_MINUTES) {
        dummyStocks.forEach(stock => {
            const percentChange = (Math.random() * 6.5) - 3;
            const priceDiff = stock.price * (percentChange / 100);
            stock.price = Math.max(1, stock.price + priceDiff);
            stock.change = percentChange;
            stock.history.shift();
            stock.history.push(stock.price);
        });
        lastUpdateTime = currentTime;
    }

    res.json(dummyStocks);
});

module.exports = router;
