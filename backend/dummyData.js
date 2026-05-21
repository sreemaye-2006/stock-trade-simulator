const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.25, history: Array.from({length: 30}, () => 170 + Math.random() * 10) },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 350.20, change: -0.80, history: Array.from({length: 30}, () => 340 + Math.random() * 20) },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.10, change: 2.10, history: Array.from({length: 30}, () => 135 + Math.random() * 10) },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 130.50, change: 0.50, history: Array.from({length: 30}, () => 125 + Math.random() * 10) },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.30, change: -5.40, history: Array.from({length: 30}, () => 200 + Math.random() * 30) },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 300.80, change: 3.20, history: Array.from({length: 30}, () => 290 + Math.random() * 20) },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 450.60, change: 12.50, history: Array.from({length: 30}, () => 430 + Math.random() * 40) },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 400.20, change: -2.10, history: Array.from({length: 30}, () => 390 + Math.random() * 30) }
];

module.exports = stocks;
