import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, TrendingUp, TrendingDown, Clock, ArrowRightLeft } from 'lucide-react';

export default function Portfolio({ token }) {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, stocksRes] = await Promise.all([
        axios.get('https://stock-trade-simulator.onrender.com/api/user', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://stock-trade-simulator.onrender.com/api/stocks')
      ]);
      setUser(userRes.data);
      setStocks(stocksRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-400"></div>
      </div>
    );
  }

  // Calculate stats
  const portfolio = user?.portfolio || [];
  const totalInvested = portfolio.reduce((acc, p) => acc + (p.quantity * p.averagePrice), 0);
  const currentValue = portfolio.reduce((acc, p) => {
    const currentPrice = stocks.find(s => s.symbol === p.symbol)?.price || p.averagePrice;
    return acc + (p.quantity * currentPrice);
  }, 0);
  const totalProfitLoss = currentValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Theme variable styles (unconditionally dark themed)
  const cardBg = 'bg-slate-800 border-slate-700 shadow-slate-950/40';
  const textTitle = 'text-white';
  const textMuted = 'text-slate-400';
  const tableHeaderBg = 'bg-slate-900/30';
  const borderCol = 'border-slate-700';
  const rowHover = 'hover:bg-slate-750/30';

  return (
    <div className="space-y-8 transition-colors duration-300">
      {/* Portfolio overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} p-6 rounded-2xl border shadow-lg`}>
          <p className={`${textMuted} text-sm`}>Total Investment</p>
          <h3 className={`text-2xl font-bold ${textTitle} mt-1`}>₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className={`${cardBg} p-6 rounded-2xl border shadow-lg`}>
          <p className={`${textMuted} text-sm`}>Current Value</p>
          <h3 className={`text-2xl font-bold ${textTitle} mt-1`}>₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className={`${cardBg} p-6 rounded-2xl border shadow-lg`}>
          <p className={`${textMuted} text-sm`}>Total Profit / Loss</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-emerald-500' : 'text-red-555'}`}>
              ₹{totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded ${totalProfitLoss >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {totalProfitLoss >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {totalProfitLoss >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className={`${cardBg} rounded-2xl border overflow-hidden shadow-lg`}>
        <div className={`px-6 py-4 border-b ${borderCol} flex items-center gap-2`}>
          <Briefcase size={20} className="text-indigo-400" />
          <h3 className={`text-lg font-bold ${textTitle}`}>Your Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${borderCol} ${tableHeaderBg} ${textMuted} text-xs font-semibold uppercase`}>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Shares</th>
                <th className="px-6 py-3 text-right">Avg Price</th>
                <th className="px-6 py-3 text-right">Current Price</th>
                <th className="px-6 py-3 text-right">Market Value</th>
                <th className="px-6 py-3 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {portfolio.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    You don't own any stocks yet. Go to the dashboard to start trading!
                  </td>
                </tr>
              ) : (
                portfolio.map(p => {
                  const currentPrice = stocks.find(s => s.symbol === p.symbol)?.price || p.averagePrice;
                  const marketValue = p.quantity * currentPrice;
                  const pl = marketValue - (p.quantity * p.averagePrice);
                  const isProfit = pl >= 0;

                  return (
                    <tr key={p.symbol} className={`${rowHover} transition-colors`}>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${textTitle} block`}>{p.symbol}</span>
                        <span className="text-xs text-slate-500">{stocks.find(s => s.symbol === p.symbol)?.name}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">{p.quantity}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-300">₹{p.averagePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-300">₹{currentPrice.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${textTitle}`}>₹{marketValue.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                        ₹{pl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className={`${cardBg} rounded-2xl border overflow-hidden shadow-lg`}>
        <div className={`px-6 py-4 border-b ${borderCol} flex items-center gap-2`}>
          <Clock size={20} className="text-indigo-400" />
          <h3 className={`text-lg font-bold ${textTitle}`}>Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${borderCol} ${tableHeaderBg} ${textMuted} text-xs font-semibold uppercase`}>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Shares</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {!user?.transactions || user.transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                [...user.transactions].reverse().map((t, index) => {
                  const isBuy = t.type === 'BUY';
                  return (
                    <tr key={index} className={`${rowHover} transition-colors`}>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          <ArrowRightLeft size={10} />
                          {t.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold ${textTitle}`}>{t.symbol}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200">{t.quantity}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-300">₹{t.price.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${textTitle}`}>₹{(t.quantity * t.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs">
                        {new Date(t.date).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
