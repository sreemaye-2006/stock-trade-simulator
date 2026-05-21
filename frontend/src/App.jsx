import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Portfolio from './pages/Portfolio';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light'; // default to true (dark)
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300`}>
        <Navbar token={token} setToken={setToken} darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setToken={setToken} darkMode={darkMode} />} />
            <Route path="/register" element={<Register darkMode={darkMode} />} />
            <Route path="/dashboard" element={token ? <Dashboard token={token} darkMode={darkMode} /> : <Navigate to="/login" />} />
            <Route path="/portfolio" element={token ? <Portfolio token={token} darkMode={darkMode} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
