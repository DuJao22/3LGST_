import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SalesTerminal from './components/SalesTerminal';
import ProductsManager from './components/ProductsManager';
import StoresManager from './components/StoresManager';
import UsersManager from './components/UsersManager';
import GlobalInventory from './components/GlobalInventory';
import StoreInventory from './components/StoreInventory';
import SalesHistory from './components/SalesHistory';
import ClientCatalog from './components/ClientCatalog';
import { AuthState, User, UserRole } from './types';
import { Terminal, Lock, Cpu, Code2 } from 'lucide-react';

const AuthApp: React.FC = () => {
  const { users } = useData();
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setAuth({ user: foundUser, isAuthenticated: true });
      if (foundUser.role === UserRole.SELLER) setCurrentPage('pos');
      else if (foundUser.role === UserRole.CLIENT) setCurrentPage('catalog');
      else setCurrentPage('dashboard');
    } else {
      setError('Acesso negado. Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setUsername('');
    setPassword('');
    setError('');
  };

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Matrix background effect simulation */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="bg-zinc-900 p-8 rounded-sm shadow-[0_0_20px_rgba(34,197,94,0.2)] w-full max-w-md border border-green-800 z-10 relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-black border border-green-500 rounded-sm flex items-center justify-center mb-4 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              <Terminal className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-green-500 tracking-tighter">3L GESTÃO</h1>
            <p className="text-green-800 text-xs mt-1 font-mono">SYSTEM_VERSION_2.0 // ACCESS_REQUIRED</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-3 rounded-sm text-xs font-mono text-center animate-pulse">
                    [ERROR] {error}
                </div>
            )}
            
            <div className="group">
              <label className="block text-xs font-bold text-green-700 uppercase mb-1 tracking-widest group-focus-within:text-green-400">User_ID</label>
              <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black border border-green-900 rounded-sm p-3 pl-10 text-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono"
                    placeholder="admin"
                  />
                  <Cpu className="absolute left-3 top-3.5 w-4 h-4 text-green-800" />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-xs font-bold text-green-700 uppercase mb-1 tracking-widest group-focus-within:text-green-400">Password_Key</label>
              <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-green-900 rounded-sm p-3 pl-10 text-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono"
                    placeholder="••••••"
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-green-800" />
              </div>
            </div>

            <button type="submit" className="w-full bg-green-900/30 text-green-400 border border-green-600 py-3 rounded-sm font-bold hover:bg-green-500 hover:text-black transition-all flex items-center justify-center uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Code2 className="w-4 h-4 mr-2" /> Initialize_Session
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] text-green-900 font-mono">
            <p>RESTRICTED AREA. UNAUTHORIZED ACCESS IS LOGGED.</p>
            <p className="mt-2 opacity-50">Demo Credentials:</p>
            <p className="opacity-50">admin / admin | vendedor / 123</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return auth.user?.role === UserRole.ADMIN ? <Dashboard /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      case 'inventory':
        return auth.user?.role === UserRole.ADMIN ? <GlobalInventory /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      case 'products':
        return auth.user?.role === UserRole.ADMIN ? <ProductsManager /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      case 'stores':
        return auth.user?.role === UserRole.ADMIN ? <StoresManager /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      case 'users':
        return auth.user?.role === UserRole.ADMIN ? <UsersManager /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      case 'sales_history':
        return auth.user?.role === UserRole.ADMIN ? <SalesHistory /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      
      case 'pos':
        return auth.user?.role === UserRole.SELLER ? <SalesTerminal currentUser={auth.user} /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      case 'store_inventory':
        return auth.user?.role === UserRole.SELLER ? <StoreInventory user={auth.user} /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
        
      case 'catalog':
        return auth.user?.role === UserRole.CLIENT ? <ClientCatalog user={auth.user} /> : <div className="p-4 text-red-500">ACCESS DENIED</div>;
      default:
        return <div>404 - MODULE NOT FOUND</div>;
    }
  };

  return (
    <Layout 
      user={auth.user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthApp />
    </DataProvider>
  );
};

export default App;