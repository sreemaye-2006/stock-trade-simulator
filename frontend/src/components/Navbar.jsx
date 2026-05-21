import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Briefcase, TrendingUp, Sun, Moon } from 'lucide-react';

export default function Navbar({ token, setToken, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setToken('');
    navigate('/login');
  };

  const activeClass = darkMode ? 'text-indigo-400' : 'text-indigo-600';
  const inactiveClass = darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900';

  const isActive = (path) => location.pathname === path ? activeClass : inactiveClass;

  return (
    <nav className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b shadow-sm sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className={`flex items-center gap-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <TrendingUp className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
          <span>TradeSim</span>
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {token && (
            <>
              <Link to="/dashboard" className={`flex items-center gap-1.5 ${isActive('/dashboard')} transition-colors font-medium text-sm`}>
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/portfolio" className={`flex items-center gap-1.5 ${isActive('/portfolio')} transition-colors font-medium text-sm`}>
                <Briefcase size={18} />
                <span className="hidden sm:inline">Portfolio</span>
              </Link>
            </>
          )}

          {/* Theme Toggle Button */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {token && (
            <button 
              onClick={handleLogout} 
              className={`flex items-center gap-1.5 font-medium text-sm transition-colors ml-2 ${darkMode ? 'text-slate-300 hover:text-red-400' : 'text-slate-600 hover:text-red-500'}`}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
