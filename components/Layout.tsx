import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, ShoppingCart, Package, Users, Store as StoreIcon, Menu, X, Leaf } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, currentPage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const MenuLink = ({ page, icon: Icon, label }: { page: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg ${
        currentPage === page
          ? 'bg-green-700 text-white shadow-md'
          : 'text-stone-600 hover:bg-stone-200 hover:text-green-800'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-stone-50 border-r border-stone-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-stone-200 bg-white">
          <div className="flex items-center space-x-2 text-green-800 font-bold text-xl">
             <Leaf className="w-6 h-6" />
             <span>HerbalManager</span>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-4">Menu Principal</div>
          
          {user.role === UserRole.ADMIN && (
            <>
              <MenuLink page="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <MenuLink page="inventory" icon={Package} label="Estoque Global" />
              <MenuLink page="products" icon={Leaf} label="Produtos" />
              <MenuLink page="stores" icon={StoreIcon} label="Lojas" />
              <MenuLink page="users" icon={Users} label="Usuários" />
              <MenuLink page="sales_history" icon={ShoppingCart} label="Histórico Vendas" />
            </>
          )}

          {user.role === UserRole.SELLER && (
            <>
              <MenuLink page="pos" icon={ShoppingCart} label="Caixa / Venda" />
              <MenuLink page="store_inventory" icon={Package} label="Estoque da Loja" />
            </>
          )}

          {user.role === UserRole.CLIENT && (
            <MenuLink page="catalog" icon={StoreIcon} label="Catálogo Online" />
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-stone-100 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-stone-800">{user.name}</p>
                <p className="text-xs text-stone-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-stone-400 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-stone-200">
          <button onClick={() => setIsSidebarOpen(true)} className="text-stone-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-green-800">HerbalManager Pro</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

        <footer className="bg-white border-t border-stone-200 py-3 px-6 text-center text-xs text-stone-500">
          <p>Sistema desenvolvido por D22</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;