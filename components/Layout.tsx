import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, ShoppingCart, Package, Users, Store as StoreIcon, Menu, Leaf, Power, Sprout, ClipboardList } from 'lucide-react';

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
      className={`flex items-center w-full px-6 py-4 mb-2 text-sm font-bold transition-all rounded-r-2xl border-l-4 ${
        currentPage === page
          ? 'bg-gradient-to-r from-lime-900/30 to-transparent text-lime-400 border-lime-500'
          : 'text-lime-100/50 border-transparent hover:text-lime-200 hover:bg-green-900/20'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${currentPage === page ? 'text-lime-400' : 'text-lime-700'}`} />
      <span className="tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#022c22] overflow-hidden font-rubik text-lime-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#022c22]/90 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#064e3b] border-r border-green-800 shadow-2xl transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 rounded-r-3xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-24 border-b border-green-800/50">
          <div className="flex items-center space-x-3 text-lime-400 font-black text-2xl tracking-tighter">
             <div className="bg-lime-500/20 p-2 rounded-lg">
                <Leaf className="w-6 h-6" />
             </div>
             <span>3L GESTÃO</span>
          </div>
        </div>

        <nav className="py-6 space-y-1 overflow-y-auto h-[calc(100vh-10rem)]">
          <div className="px-6 pb-2 mb-2 text-xs font-bold text-lime-600/70 uppercase tracking-widest">
            Navegação Principal
          </div>
          
          {user.role === UserRole.ADMIN && (
            <>
              <MenuLink page="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <MenuLink page="orders" icon={ClipboardList} label="Gestão de Pedidos" />
              <MenuLink page="inventory" icon={Package} label="Estoque Global" />
              <MenuLink page="products" icon={Sprout} label="Produtos / Strains" />
              <MenuLink page="stores" icon={StoreIcon} label="Unidades" />
              <MenuLink page="users" icon={Users} label="Equipe" />
              <MenuLink page="sales_history" icon={ShoppingCart} label="Vendas" />
            </>
          )}

          {user.role === UserRole.SELLER && (
            <>
              <MenuLink page="pos" icon={ShoppingCart} label="PDV - Balcão" />
              <MenuLink page="orders" icon={ClipboardList} label="Pedidos (Solicitações)" />
              <MenuLink page="store_inventory" icon={Package} label="Estoque Local" />
            </>
          )}

          {user.role === UserRole.CLIENT && (
            <MenuLink page="catalog" icon={StoreIcon} label="Catálogo Premium" />
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#022c22] to-[#064e3b] border-t border-green-800/50 rounded-br-3xl">
          <div className="flex items-center justify-between mb-2 p-3 bg-green-900/30 rounded-xl border border-green-800/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-bold text-lime-100">{user.name}</p>
                <p className="text-[10px] text-lime-300/70 uppercase font-medium">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-red-400/70 hover:text-red-400 transition-colors p-2 hover:bg-red-900/20 rounded-lg">
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#022c22] relative">
         {/* Background Glow */}
         <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-lime-900/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#064e3b] border-b border-green-800">
          <button onClick={() => setIsSidebarOpen(true)} className="text-lime-400">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lime-400 tracking-tight">3L GESTÃO</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;