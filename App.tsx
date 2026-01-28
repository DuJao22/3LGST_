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
import { Leaf, Lock, User as UserIcon, Sprout } from 'lucide-react';

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
      setError('Credenciais incorretas. Tente novamente.');
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
      <div className="min-h-screen bg-[#022c22] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-900/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-900/30 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="glass-panel p-8 rounded-3xl shadow-2xl w-full max-w-md border border-lime-500/30 z-10 relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-green-700 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
              <Leaf className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-lime-400 tracking-tight">3L GESTÃO</h1>
            <p className="text-lime-200/70 text-sm mt-1 font-medium">Sistema Integrado</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}
            
            <div className="group">
              <label className="block text-xs font-bold text-lime-300 uppercase mb-2 tracking-wider ml-1">Usuário / ID</label>
              <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#064e3b] border border-green-800 rounded-xl p-4 pl-12 text-lime-100 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all placeholder-green-700"
                    placeholder="Seu usuário"
                  />
                  <UserIcon className="absolute left-4 top-4 w-5 h-5 text-green-500" />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-xs font-bold text-lime-300 uppercase mb-2 tracking-wider ml-1">Senha de Acesso</label>
              <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#064e3b] border border-green-800 rounded-xl p-4 pl-12 text-lime-100 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all placeholder-green-700"
                    placeholder="••••••"
                  />
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-green-500" />
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-lime-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-lime-500 hover:to-green-600 transition-all shadow-lg hover:shadow-lime-900/50 flex items-center justify-center transform active:scale-95">
              <Sprout className="w-5 h-5 mr-2" /> Acessar Sistema
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-lime-800/60 font-medium">
            <p className="uppercase tracking-wider">Desenvolvido por D22</p>
            <p className="mt-2 opacity-50">Demo: admin/admin | vendedor/123 | cliente/123</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return auth.user?.role === UserRole.ADMIN ? <Dashboard /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      case 'inventory':
        return auth.user?.role === UserRole.ADMIN ? <GlobalInventory /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      case 'products':
        return auth.user?.role === UserRole.ADMIN ? <ProductsManager /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      case 'stores':
        return auth.user?.role === UserRole.ADMIN ? <StoresManager /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      case 'users':
        return auth.user?.role === UserRole.ADMIN ? <UsersManager /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      case 'sales_history':
        return auth.user?.role === UserRole.ADMIN ? <SalesHistory /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      
      case 'pos':
        return auth.user?.role === UserRole.SELLER ? <SalesTerminal currentUser={auth.user} /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      case 'store_inventory':
        return auth.user?.role === UserRole.SELLER ? <StoreInventory user={auth.user} /> : <div className="p-4 text-red-400">Acesso Negado</div>;
        
      case 'catalog':
        return auth.user?.role === UserRole.CLIENT ? <ClientCatalog user={auth.user} /> : <div className="p-4 text-red-400">Acesso Negado</div>;
      default:
        return <div>404 - Página não encontrada</div>;
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