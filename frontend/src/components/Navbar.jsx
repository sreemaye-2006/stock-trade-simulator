import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Briefcase, TrendingUp, Sun, Moon } from 'lucide-react';

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setToken('');
    navigate('/login');
  };

  const activeClass = 'text-indigo-400';
  const inactiveClass = 'text-slate-300 hover:text-white';

  const isActive = (path) => location.pathname === path ? activeClass : inactiveClass;

  return (
    <nav className="bg-slate-800 border-slate-700 border-b shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <TrendingUp className="text-indigo-400" />
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

          {token && (
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 font-medium text-sm transition-colors ml-2 text-slate-300 hover:text-red-400"
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
