import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI, slotAPI, bookingAPI, staffAPI, adminAPI } from './api';
import PricingSettings from './pages/PricingSettings';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      const role = JSON.parse(storedUser).role;
      setCurrentPage(role === 'admin' ? 'dashboard' : role === 'staff' ? 'staff' : 'slots');
    }
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      const role = response.user.role;
      setCurrentPage(role === 'admin' ? 'dashboard' : role === 'staff' ? 'staff' : 'slots');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
    setSuccess('✅ Logged out successfully');
    setTimeout(() => setSuccess(null), 2000);
  };

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
        loading={loading}
        error={error}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="app-shell app-mobile-stack flex min-h-screen">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-in-left { animation: slideInLeft 0.5s ease-out; }
        .slide-in-up { animation: slideInUp 0.6s ease-out; }
        .slide-in-right { animation: slideInRight 0.5s ease-out; }
        .pulse { animation: pulse 2s infinite; }
        .spin { animation: spin 1s linear infinite; }
        .glow { animation: glow 2s ease-in-out infinite; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .btn-hover { transition: all 0.3s ease; }
        .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .gradient-primary { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); }
        .gradient-secondary { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .toast { animation: slideInRight 0.4s ease-out, fadeIn 0.4s ease-out; }
      `}</style>

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 space-y-3 z-50 pointer-events-none">
        {error && (
          <div className="toast pointer-events-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-filter backdrop-blur-lg border border-red-400/50">
            <span className="text-2xl">🔴</span>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-white/80 hover:text-white hover:scale-110 transition-all">✕</button>
          </div>
        )}
        {success && (
          <div className="toast pointer-events-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-filter backdrop-blur-lg border border-green-400/50">
            <span className="text-2xl">✅</span>
            <span className="font-medium">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-2 text-white/80 hover:text-white hover:scale-110 transition-all">✕</button>
          </div>
        )}
      </div>
      
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <MainContent currentPage={currentPage} user={user} setSuccess={setSuccess} setError={setError} />
    </div>
  );
};

const Sidebar = ({ user, currentPage, onNavigate, onLogout, theme, onToggleTheme }) => {
  const menuItems = useMemo(() => {
    if (user.role === 'admin') {
      return [
        { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { id: 'users', label: '👥 Users', icon: '👥' },
        { id: 'slots', label: '🅿️ Slots', icon: '🅿️' },
        { id: 'bookings', label: '📋 Bookings', icon: '📋' },
        { id: 'revenue', label: '💰 Revenue', icon: '💰' },
        { id: 'pricing', label: '⚙️ Pricing Policy', icon: '⚙️' }
      ];
    }
    if (user.role === 'staff') {
      return [
        { id: 'staff', label: '✅ Check-in/Out', icon: '✅' },
        { id: 'search', label: '🔍 Search', icon: '🔍' },
        { id: 'bookings', label: '📋 Bookings', icon: '📋' }
      ];
    }
    return [
      { id: 'slots', label: '🅿️ Available', icon: '🅿️' },
      { id: 'bookings', label: '📋 My Bookings', icon: '📋' },
      { id: 'active', label: '⏱️ Active', icon: '⏱️' }
    ];
  }, [user.role]);

  return (
    <aside className="w-72 sidebar-shell text-white h-screen sticky top-0 shadow-2xl fade-in flex flex-col border-r border-white/5">
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">🅿️</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">SmartPark</h2>
            <p className="text-xs text-blue-300/70">Smart Parking</p>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-xl card-modern border-blue-400/20 hover:border-blue-400/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-lg">👤</div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">{user.name}</p>
              <p className="text-xs text-blue-400 font-medium">{user.role.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              currentPage === item.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-blue-300'
            }`}
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {currentPage === item.id && <div className="ml-auto w-2 h-2 bg-blue-200 rounded-full"></div>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          onClick={onToggleTheme}
          className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 btn-hover border border-white/10"
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 btn-hover shadow-lg hover:shadow-red-500/50"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

const MainContent = ({ currentPage, user, setSuccess, setError }) => {
  return (
    <main className="flex-1 overflow-auto app-main">
      <div className="p-6 lg:p-10 fade-in">
        <div className="page-shell">
        {currentPage === 'dashboard' && <AdminDashboard setError={setError} />}
        {currentPage === 'slots' && <SlotsPage user={user} setSuccess={setSuccess} setError={setError} />}
        {currentPage === 'bookings' && <BookingsPage user={user} setSuccess={setSuccess} setError={setError} />}
        {currentPage === 'active' && <ActiveBookingPage setError={setError} />}
        {currentPage === 'staff' && <StaffCheckInOut setSuccess={setSuccess} setError={setError} />}
        {currentPage === 'search' && <VehicleSearch setSuccess={setSuccess} setError={setError} />}
        {currentPage === 'users' && <UsersManagement setError={setError} />}
        {currentPage === 'revenue' && <RevenueAnalytics setError={setError} />}
        {currentPage === 'pricing' && <PricingSettings setError={setError} setSuccess={setSuccess} />}
        </div>
      </div>
    </main>
  );
};

const LoginPage = ({ onLogin, loading: loginLoading, error: loginError, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVehicle, setRegVehicle] = useState('');
  
  // Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const error = loginError || localError;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    setLoading(true);
    try {
      const response = await authAPI.register({
        name: regName,
        email,
        password,
        phone: regPhone,
        vehicleNumber: regVehicle
      });
      setLocalSuccess(response.message);
      setAuthToken(response.token);
      localStorage.setItem('token', response.token); // Temporarily store for verify
      setShowVerification(true);
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    }
    setLoading(false);
  };
  
  const handleVerify = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      const response = await authAPI.verify({ code: verificationCode });
      setLocalSuccess('Verified successfully!');
      setTimeout(() => {
        onLogin(email, password);
      }, 1000);
    } catch (err) {
      setLocalError(err.message || 'Verification failed');
    }
    setLoading(false);
  };

  const quickLogins = [
    { email: 'admin@campus.edu', password: 'Admin@12345', role: 'Admin', icon: '👨‍💼' },
    { email: 'staff@campus.edu', password: 'Staff@12345', role: 'Staff', icon: '👨‍🔧' },
    { email: 'rahul@campus.edu', password: 'User@123456', role: 'User', icon: '👨‍💻' }
  ];

  return (
    <div className="min-h-screen login-shell flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(30px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .float { animation: float 4s ease-in-out infinite; }
        .fade-in { animation: fadeIn 0.8s ease-out; }
      `}</style>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="login-grid"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full float blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full float blur-3xl" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full float blur-3xl" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-full max-w-md fade-in">
        <div className="card-modern shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-40 h-40 bg-white/10 rounded-full -top-20 -right-20"></div>
              <div className="absolute w-40 h-40 bg-white/10 rounded-full -bottom-20 -left-20"></div>
            </div>
            <button
              onClick={onToggleTheme}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <div className="relative">
              <div className="text-6xl mb-3">🅿️</div>
              <h1 className="text-3xl font-bold text-white">SmartPark</h1>
              <p className="text-blue-100 mt-2 text-sm">Smart Campus Parking Management</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-slate-700/50 rounded-xl p-1.5">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 font-semibold ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🔐 Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 font-semibold ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📝 Register
              </button>
            </div>

            {/* Form Area */}
            {showVerification ? (
              <form onSubmit={handleVerify} className="space-y-4 fade-in">
                <div className="text-center mb-4">
                  <p className="text-green-400 font-semibold text-lg">✅ {localSuccess}</p>
                  <p className="text-slate-300 text-sm mt-2">Check your email (or console) for the 6-digit code.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">🔢 Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder-slate-400 text-center text-xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm font-medium slide-in-up flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed btn-hover flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block spin">⏳</span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Verify Account</span>
                    </>
                  )}
                </button>
              </form>
            ) : activeTab === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-4 fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">📧 Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder-slate-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">🔐 Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder-slate-400"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm font-medium slide-in-up flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed btn-hover flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <span className="inline-block spin">⏳</span>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">👤 Full Name</label>
                    <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} required className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-400" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">📱 Phone</label>
                    <input type="text" value={regPhone} onChange={e=>setRegPhone(e.target.value)} required className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-400" placeholder="9876543210" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">📧 Email Address</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-400" placeholder="your@email.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">🚗 Vehicle No.</label>
                    <input type="text" value={regVehicle} onChange={e=>setRegVehicle(e.target.value)} required className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-400 uppercase" placeholder="UP32AB1234" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">🔐 Password</label>
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-400" placeholder="Min 8 chars" />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span><span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold disabled:opacity-50 btn-hover flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="spin">⏳</span><span>Creating Account...</span></>
                  ) : (
                    <><span className="text-xl">🚀</span><span>Sign Up</span></>
                  )}
                </button>
              </form>
            )}

            {/* Quick Login */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                <p className="text-slate-400 font-semibold text-sm">⚡ Quick Access</p>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              </div>
              <div className="space-y-3">
                {quickLogins.map((login) => (
                  <button
                    key={login.email}
                    onClick={() => onLogin(login.email, login.password)}
                    disabled={loading}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 hover:border-blue-500 rounded-xl hover:bg-slate-700 transition-all text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                  >
                    <span className="text-2xl mr-2">{login.icon}</span>
                    <span className="font-semibold">{login.role}</span>
                    <span className="text-slate-500 text-xs ml-1">({login.email})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-slate-500 text-xs">
          <p>🔒 Secure Campus Parking System • Protected by Industry Standards</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ setError }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminAPI.getDashboard();
        setDashboard(data.dashboard);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load dashboard');
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [setError]);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>;
  }

  if (!dashboard) {
    return <div className="text-center py-16 text-slate-400"><p className="text-xl">📊 Failed to load dashboard</p></div>;
  }

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">📊 Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your parking system overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="🅿️" label="Total Slots" value={dashboard.slots.total} color="from-blue-600 to-blue-400" trend="+12%" />
        <StatCard icon="✅" label="Available" value={dashboard.slots.available} color="from-green-600 to-green-400" trend={`${Math.round(dashboard.slots.available/dashboard.slots.total*100)}%`} />
        <StatCard icon="🚗" label="Occupied" value={dashboard.slots.occupied} color="from-orange-600 to-orange-400" trend="-5%" />
        <StatCard icon="👥" label="Total Users" value={dashboard.users.total} color="from-purple-600 to-purple-400" trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard icon="💵" label="Today's Revenue" value={`₹${dashboard.revenue.today}`} color="from-pink-600 to-pink-400" trend="+15%" large />
        <StatCard icon="📈" label="Month Revenue" value={`₹${dashboard.revenue.month}`} color="from-indigo-600 to-indigo-400" trend="+22%" large />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, trend, large = false }) => (
  <div className={`card-modern hover:border-blue-400/50 group relative overflow-hidden transition-all duration-300 ${large ? 'lg:col-span-1' : ''}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
    <div className={`p-6 relative ${large ? 'lg:p-8' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className={`font-bold mt-3 bg-gradient-to-r ${color} bg-clip-text text-transparent ${large ? 'text-4xl' : 'text-3xl'}`}>{value}</p>
          {trend && <p className="text-green-400 text-xs font-semibold mt-2">📈 {trend}</p>}
        </div>
        <div className={`${large ? 'text-5xl' : 'text-4xl'} opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
    </div>
  </div>
);

const SlotsPage = ({ user, setSuccess, setError }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('A');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const data = await slotAPI.getAll({ zone: selectedZone });
        setSlots(data.slots || []);
      } catch (err) {
        console.error('Failed to fetch slots:', err);
        setError(`Failed to load slots: ${err.message}`);
      }
      setLoading(false);
    };
    fetchSlots();
  }, [selectedZone, setError]);

  const handleBook = async (slotId) => {
    if (user.role !== 'user') {
      setError('❌ Only users can book slots');
      return;
    }
    try {
      await bookingAPI.create({
        slotId,
        vehicleNumber: user.vehicleNumber,
        estimatedDuration: 2
      });
      setSuccess('✅ Booking created successfully!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(`Booking failed: ${err.message}`);
    }
  };

  const availableCount = slots.filter(s => s.status === 'available').length;

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">🅿️ Available Parking Slots</h1>
        <p className="page-subtitle">Zone {selectedZone} • {availableCount} available slots</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['A', 'B', 'C', 'D'].map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all hover-lift ${
              selectedZone === zone
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'card-modern border-slate-600 text-slate-300 hover:border-blue-500/50'
            }`}
          >
            🏢 Zone {zone}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {slots.map((slot) => (
            <div
              key={slot._id}
              onClick={() => slot.status === 'available' && handleBook(slot._id)}
              className={`p-4 rounded-xl border-2 text-center font-semibold transition-all hover-lift cursor-pointer group ${
                slot.status === 'available'
                  ? 'card-modern border-green-500/50 bg-green-500/10 text-white hover:border-green-500 hover:bg-green-500/20'
                  : 'card-modern border-slate-600 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <p className="text-2xl font-bold group-hover:scale-110 transition-transform">{slot.slotNumber}</p>
              <p className="text-xs text-slate-400 mt-2">₹{slot.pricePerHour}/hr</p>
              <p className={`text-xs font-bold mt-2 ${
                slot.status === 'available' ? 'text-green-400' : 'text-slate-500'
              }`}>
                {slot.status === 'available' ? '✅ Free' : '❌ Busy'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BookingsPage = ({ user, setSuccess, setError }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = user.role === 'user'
          ? await bookingAPI.getMyBookings()
          : await bookingAPI.getAll();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError(`Failed to load bookings: ${err.message}`);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user.role, setError]);

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      setSuccess('✅ Booking cancelled successfully');
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (err) {
      setError(`Cancel failed: ${err.message}`);
    }
  };

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">📋 {user.role === 'user' ? 'My Bookings' : 'All Bookings'}</h1>
        <p className="page-subtitle">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>
      ) : bookings.length === 0 ? (
        <div className="card-modern py-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-xl text-slate-300">No bookings found</p>
          <p className="text-slate-400 mt-2">Start by booking a parking slot!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card-modern hover:border-blue-400/50 group p-6 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div>
                  <p className="text-slate-400 text-sm mb-1">🅿️ Slot</p>
                  <p className="text-2xl font-bold text-blue-400">{booking.slotNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">🚗 Vehicle</p>
                  <p className="text-lg font-semibold text-white">{booking.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">📊 Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    booking.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {booking.status === 'completed' ? '✅' : booking.status === 'active' ? '⏱️' : '⏸️'} {booking.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">💵 Amount</p>
                  <p className="text-xl font-bold text-green-400">₹{booking.totalAmount}</p>
                </div>
                <div className="flex justify-end">
                  {user.role === 'user' && ['pending', 'active'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all font-semibold btn-hover"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveBookingPage = ({ setError }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const data = await bookingAPI.getActive();
        setBooking(data.booking);
      } catch (err) {
        console.error('Failed to fetch active booking:', err);
        setError('Failed to load active booking');
      }
      setLoading(false);
    };
    fetchActive();
  }, [setError]);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>;
  }

  if (!booking) {
    return <div className="slide-in-up"><div className="card-modern py-16 text-center"><p className="text-4xl mb-3">⏱️</p><p className="text-xl text-slate-300">No active booking</p></div></div>;
  }

  const checkInTime = new Date(booking.checkInTime);
  const now = new Date();
  const durationMinutes = Math.floor((now - checkInTime) / 60000);
  const durationHours = (durationMinutes / 60).toFixed(1);

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">⏱️ Active Booking</h1>
        <p className="page-subtitle">Currently parked and running</p>
      </div>
      <div className="card-modern p-8 max-w-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-slate-400 text-sm font-semibold">🅿️ Slot Number</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{booking.slotNumber}</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <p className="text-slate-400 text-sm font-semibold">🚗 Vehicle</p>
            <p className="text-2xl font-bold text-purple-400 mt-2">{booking.vehicleNumber}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-slate-400 text-sm font-semibold">💵 Price/Hour</p>
            <p className="text-3xl font-bold text-green-400 mt-2">₹{booking.pricePerHour}</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <p className="text-slate-400 text-sm font-semibold">⏱️ Duration</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">{durationHours}h</p>
          </div>
          <div className="col-span-2 md:col-span-4 p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
            <p className="text-slate-400 text-sm font-semibold">📈 Estimated Amount</p>
            <p className="text-4xl font-bold text-pink-400 mt-2">₹{booking.totalAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffCheckInOut = ({ setSuccess, setError }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await staffAPI.getActiveBookings();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError(`Failed to load bookings: ${err.message}`);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [setError]);

  const handleCheckIn = async (bookingId) => {
    try {
      await staffAPI.checkIn(bookingId, {});
      setSuccess('✅ Vehicle checked in successfully');
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'checked_in' } : b));
    } catch (err) {
      setError(`Check-in failed: ${err.message}`);
    }
  };

  const handleCheckOut = async (bookingId) => {
    const paymentMethod = prompt('Select payment method (cash/card/upi/wallet):', 'cash');
    if (!paymentMethod) return;

    try {
      const response = await staffAPI.checkOut(bookingId, { paymentMethod });
      setSuccess(`✅ Checkout successful! Amount: ₹${response.bill.totalAmount}`);
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (err) {
      setError(`Checkout failed: ${err.message}`);
    }
  };

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">✅ Check-in / Check-out</h1>
        <p className="page-subtitle">{bookings.length} active booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>
      ) : bookings.length === 0 ? (
        <div className="card-modern py-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-xl text-slate-300">No active bookings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card-modern hover:border-blue-400/50 group p-6 transition-all">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">🅿️ Slot • 🚗 Vehicle • 👤 Customer</p>
                  <div className="flex gap-3 items-center">
                    <div className="text-3xl font-bold text-blue-400">{booking.slotNumber}</div>
                    <span className="text-slate-500">•</span>
                    <div className="font-semibold text-white">{booking.vehicleNumber}</div>
                    <span className="text-slate-500">•</span>
                    <div className="text-sm text-slate-300">{booking.user.name}</div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">📊 Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    booking.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {booking.status === 'checked_in' ? '✅ Checked In' : '🚗 Active'}
                  </span>
                </div>
                <div className="flex gap-3 pt-3 border-t border-slate-700">
                  {booking.status === 'active' && (
                    <button
                      onClick={() => handleCheckIn(booking._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all font-semibold btn-hover"
                    >
                      ✅ Check In
                    </button>
                  )}
                  {booking.status === 'checked_in' && (
                    <button
                      onClick={() => handleCheckOut(booking._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all font-semibold btn-hover"
                    >
                      🚗 Check Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VehicleSearch = ({ setSuccess, setError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    setLoading(true);
    try {
      const data = await staffAPI.searchVehicle(searchTerm);
      setResults(data.bookings || []);
      setSuccess(`Found ${(data.bookings || []).length} booking(s)`);
    } catch (err) {
      console.error('Search failed:', err);
      setError(`Search failed: ${err.message}`);
      setResults([]);
    }
    setLoading(false);
    setSearched(true);
  };

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">🔍 Search Vehicle</h1>
        <p className="page-subtitle">Search for parking bookings by vehicle number</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter vehicle number (e.g., UP32AB1234)"
          className="flex-1 px-6 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder-slate-400 text-lg"
          required
        />
        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold btn-hover">
          🔎 Search
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center h-80"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>
      )}

      {searched && !loading && (
        <div>
          {results.length === 0 ? (
            <div className="card-modern py-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-xl text-slate-300">No bookings found for that vehicle</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((booking) => (
                <div key={booking._id} className="card-modern hover:border-blue-400/50 group p-6 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-slate-400 text-sm mb-1">🅿️ Slot</p>
                      <p className="text-3xl font-bold text-blue-400">{booking.slotNumber}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-slate-400 text-sm mb-1">🚗 Vehicle</p>
                      <p className="text-2xl font-bold text-purple-400">{booking.vehicleNumber}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <p className="text-slate-400 text-sm mb-1">📊 Status</p>
                      <p className="text-2xl font-bold text-orange-400">{booking.status}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-slate-400 text-sm mb-1">💵 Amount</p>
                      <p className="text-2xl font-bold text-green-400">₹{booking.totalAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UsersManagement = ({ setError }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminAPI.getUsers();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [setError]);

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">👥 User Management</h1>
        <p className="page-subtitle">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>
      ) : (
        <div className="card-modern overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">👤 Name</th>
                  <th className="px-6 py-4 text-left font-semibold">✉️ Email</th>
                  <th className="px-6 py-4 text-left font-semibold">🏷️ Role</th>
                  <th className="px-6 py-4 text-left font-semibold">📊 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{user.name}</td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                        user.role === 'staff' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="text-green-400 font-bold flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          Active
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const RevenueAnalytics = ({ setError }) => {
  const [revenue, setRevenue] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const data = await adminAPI.getRevenue({ period });
        setRevenue(data);
      } catch (err) {
        console.error('Failed to fetch revenue:', err);
        setError('Failed to load revenue data');
      }
      setLoading(false);
    };
    fetchRevenue();
  }, [period, setError]);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full spin"></div></div>;
  }

  if (!revenue) {
    return <div className="card-modern py-16 text-center"><p className="text-xl text-slate-300">📊 Failed to load revenue data</p></div>;
  }

  return (
    <div className="slide-in-up space-y-8">
      <div>
        <h1 className="page-title">💰 Revenue Analytics</h1>
        <p className="page-subtitle">Track your parking revenue performance</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['day', 'week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all hover-lift ${
              period === p
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'card-modern border-slate-600 text-slate-300 hover:border-blue-500/50'
            }`}
          >
            📊 {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon="💵" label="Total Revenue" value={`₹${revenue.summary.totalRevenue}`} color="from-pink-600 to-pink-400" trend="+18%" />
        <StatCard icon="📋" label="Total Bookings" value={revenue.summary.totalBookings} color="from-indigo-600 to-indigo-400" trend="+12%" />
        <StatCard icon="📈" label="Avg per Booking" value={`₹${revenue.summary.averagePerBooking}`} color="from-cyan-600 to-cyan-400" trend="+8%" />
      </div>

      <div className="card-modern p-8">
        <h3 className="section-title flex items-center gap-2">
          <span>📊</span> Revenue Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">📅 Date</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">💵 Revenue</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">📋 Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {revenue.data.map((day, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-3 font-semibold text-white">{day._id}</td>
                  <td className="px-6 py-3 font-bold text-green-400">₹{day.revenue}</td>
                  <td className="px-6 py-3 text-slate-300">{day.bookings} booking{day.bookings !== 1 ? 's' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
