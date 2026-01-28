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
import { AuthState, User, UserRole } from './types';
import { Leaf, Lock } from 'lucide-react';

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
      setError('Credenciais inválidas.');
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
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-700">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">HerbalManager Pro</h1>
            <p className="text-stone-500 text-sm">Sistema Privado de Gestão</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">{error}</div>}
            
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ex: admin"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••"
              />
            </div>

            <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center justify-center">
              <Lock className="w-4 h-4 mr-2" /> Entrar
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-stone-400">
            <p>Acesso restrito a funcionários autorizados.</p>
            <p className="mt-2">Credenciais Demo:</p>
            <p>admin / admin</p>
            <p>vendedor / 123</p>
            <p>cliente / 123</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return auth.user?.role === UserRole.ADMIN ? <Dashboard /> : <div className="p-4">Acesso Negado</div>;
      case 'inventory':
        return auth.user?.role === UserRole.ADMIN ? <GlobalInventory /> : <div className="p-4">Acesso Negado</div>;
      case 'products':
        return auth.user?.role === UserRole.ADMIN ? <ProductsManager /> : <div className="p-4">Acesso Negado</div>;
      case 'stores':
        return auth.user?.role === UserRole.ADMIN ? <StoresManager /> : <div className="p-4">Acesso Negado</div>;
      case 'users':
        return auth.user?.role === UserRole.ADMIN ? <UsersManager /> : <div className="p-4">Acesso Negado</div>;
      case 'sales_history':
        return auth.user?.role === UserRole.ADMIN ? <SalesHistory /> : <div className="p-4">Acesso Negado</div>;
      
      case 'pos':
        return auth.user?.role === UserRole.SELLER ? <SalesTerminal currentUser={auth.user} /> : <div className="p-4">Acesso Negado. Apenas vendedores.</div>;
      case 'store_inventory':
        return auth.user?.role === UserRole.SELLER ? <StoreInventory user={auth.user} /> : <div className="p-4">Acesso Negado. Apenas vendedores.</div>;
        
      case 'catalog':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <h1 className="col-span-full text-2xl font-bold mb-4">Catálogo de Produtos</h1>
                {useData().products.filter(p => p.active).map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                        <div className="h-48 bg-stone-100 rounded-lg mb-4 flex items-center justify-center text-stone-400 overflow-hidden">
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <Leaf className="w-8 h-8" />
                            )}
                        </div>
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-sm text-stone-500 mb-2 line-clamp-2">{p.description}</p>
                        <p className="font-bold text-green-700">R$ {p.price.toFixed(2)}</p>
                        <button className="w-full mt-3 bg-stone-800 text-white py-2 rounded text-sm hover:bg-stone-700">Solicitar Compra</button>
                    </div>
                ))}
            </div>
        );
      default:
        return <div>Página não encontrada</div>;
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