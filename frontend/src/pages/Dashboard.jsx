import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Star, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard({ token, darkMode }) {
  const [stocks, setStocks] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stocks');
      setStocks(res.data);
      if (res.data.length > 0 && !selectedStock) {
        setSelectedStock(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchStocks(), fetchUserData()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [token]);

  const handleWatchlistToggle = async (symbol) => {
    try {
      const res = await axios.post('http://localhost:5000/api/user/watchlist', { symbol }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, watchlist: res.data.watchlist }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrade = async (action) => {
    if (tradeQuantity <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return;
    }
    try {
      const url = `http://localhost:5000/api/trade/${action.toLowerCase()}`;
      const res = await axios.post(url, {
        symbol: selectedStock.symbol,
        quantity: parseInt(tradeQuantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(res.data.user);
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      // Update selectedStock ref if stock price or details were updated
      const updatedStock = stocks.find(s => s.symbol === selectedStock.symbol);
      if (updatedStock) setSelectedStock(updatedStock);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || `${action} failed` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
                          stock.name.toLowerCase().includes(search.toLowerCase());
    const matchesWatchlist = !watchlistOnly || (user?.watchlist?.includes(stock.symbol));
    return matchesSearch && matchesWatchlist;
  });

  const chartData = selectedStock?.history.map((price, index) => ({
    day: `D${index + 1}`,
    price: parseFloat(price.toFixed(2))
  })) || [];

  const isStarred = (symbol) => user?.watchlist?.includes(symbol);

  const ownedQuantity = user?.portfolio?.find(p => p.symbol === selectedStock?.symbol)?.quantity || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 ${darkMode ? 'border-indigo-400' : 'border-indigo-600'}`}></div>
      </div>
    );
  }

  // Define Mode-based style constants
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700 shadow-slate-950/40' : 'bg-white border-slate-200 shadow-slate-200/40';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';
  const itemHover = darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-100/50';

  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Upper Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} p-6 rounded-2xl border shadow-lg flex items-center gap-4`}>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Wallet size={24} />
          </div>
          <div>
            <p className={`${textMuted} text-sm`}>Virtual Balance</p>
            <h3 className={`text-2xl font-bold ${textTitle}`}>₹{user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border shadow-lg flex items-center gap-4`}>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className={`${textMuted} text-sm`}>Portfolio Value</p>
            <h3 className={`text-2xl font-bold ${textTitle}`}>
              ₹{user?.portfolio?.reduce((acc, curr) => {
                const currentPrice = stocks.find(s => s.symbol === curr.symbol)?.price || curr.averagePrice;
                return acc + (curr.quantity * currentPrice);
              }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border shadow-lg flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Star size={24} />
            </div>
            <div>
              <p className={`${textMuted} text-sm`}>Watchlist Items</p>
              <h3 className={`text-2xl font-bold ${textTitle}`}>{user?.watchlist?.length || 0}</h3>
            </div>
          </div>
          <button 
            onClick={initData} 
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            title="Refresh Stock Prices"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side: Stock List */}
        <div className={`${cardBg} rounded-2xl border p-4 md:p-6 space-y-4 lg:col-span-1`}>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                className={`w-full border rounded-lg pl-9 pr-4 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputBg}`}
                placeholder="Search stocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setWatchlistOnly(!watchlistOnly)}
              className={`p-2 rounded-lg border transition-all ${watchlistOnly ? 'bg-indigo-600 border-indigo-500 text-white' : `${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'} hover:text-indigo-500`}`}
              title="Filter Watchlist"
            >
              <Star size={16} fill={watchlistOnly ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredStocks.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No stocks found</p>
            ) : (
              filteredStocks.map(stock => {
                const isPositive = stock.change >= 0;
                const isSelected = selectedStock?.symbol === stock.symbol;
                
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      setSelectedStock(stock);
                      setTradeQuantity(1);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-indigo-500/10 border-indigo-500/50' : `bg-transparent border-transparent ${itemHover}`}`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${textTitle}`}>{stock.symbol}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWatchlistToggle(stock.symbol);
                          }}
                          className="text-slate-400 hover:text-amber-500 transition-colors"
                        >
                          <Star size={14} fill={isStarred(stock.symbol) ? '#f59e0b' : 'none'} className={isStarred(stock.symbol) ? 'text-amber-500' : ''} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-[120px]">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold block ${textTitle}`}>₹{stock.price.toFixed(2)}</span>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side: Stock Detail & Trade */}
        {selectedStock && (
          <div className={`${cardBg} rounded-2xl border p-4 md:p-6 lg:col-span-2 space-y-6 flex flex-col justify-between`}>
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className={`text-2xl font-bold ${textTitle}`}>{selectedStock.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-sm font-semibold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{selectedStock.symbol}</span>
                  </div>
                  <p className={`${textMuted} text-sm mt-1`}>Real-time simulator stock chart</p>
                </div>
                <div className="text-right">
                  <h3 className={`text-3xl font-extrabold ${textTitle}`}>₹{selectedStock.price.toFixed(2)}</h3>
                  <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${selectedStock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}% (Today)
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedStock.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={selectedStock.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke={darkMode ? "#475569" : "#94a3b8"} fontSize={11} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke={darkMode ? "#475569" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={darkMode ? { backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f8fafc' } : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                      labelClassName={darkMode ? "text-slate-400" : "text-slate-500"}
                    />
                    <Area type="monotone" dataKey="price" stroke={selectedStock.change >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trading Box */}
            <div className={`p-4 rounded-xl border mt-6 space-y-4 ${darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-slate-500">
                <div>
                  Currently Owned: <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ownedQuantity} shares</span>
                </div>
                <div>
                  Total Estimated Cost: <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{(selectedStock.price * tradeQuantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm text-center font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border border-red-500/30 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <input
                    type="number"
                    min="1"
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder="Quantity"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleTrade('BUY')}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleTrade('SELL')}
                    disabled={ownedQuantity === 0}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Sell
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
