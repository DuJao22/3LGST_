import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, ShoppingCart, Package, Users, Store as StoreIcon, Menu, Terminal, Power } from 'lucide-react';

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
      className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-bold transition-all border-l-2 ${
        currentPage === page
          ? 'bg-green-900/20 text-green-400 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
          : 'text-zinc-500 border-transparent hover:text-green-200 hover:bg-zinc-900 hover:border-green-800'
      }`}
    >
      <Icon className={`w-4 h-4 mr-3 ${currentPage === page ? 'text-green-400' : 'text-zinc-600'}`} />
      <span className="uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-black overflow-hidden font-mono">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-green-900/50 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-green-900/50 bg-black">
          <div className="flex items-center space-x-2 text-green-500 font-bold text-xl tracking-widest">
             <Terminal className="w-6 h-6" />
             <span>3L GESTÃO</span>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          <div className="text-[10px] font-bold text-green-900 uppercase tracking-widest mb-2 px-4 border-b border-green-900/30 pb-1">
            System_Modules
          </div>
          
          {user.role === UserRole.ADMIN && (
            <>
              <MenuLink page="dashboard" icon={LayoutDashboard} label="Mainframe" />
              <MenuLink page="inventory" icon={Package} label="Global_Stock" />
              <MenuLink page="products" icon={Terminal} label="Products_DB" />
              <MenuLink page="stores" icon={StoreIcon} label="Nodes/Stores" />
              <MenuLink page="users" icon={Users} label="User_Access" />
              <MenuLink page="sales_history" icon={ShoppingCart} label="Trans_Logs" />
            </>
          )}

          {user.role === UserRole.SELLER && (
            <>
              <MenuLink page="pos" icon={ShoppingCart} label="POS_Terminal" />
              <MenuLink page="store_inventory" icon={Package} label="Local_Stock" />
            </>
          )}

          {user.role === UserRole.CLIENT && (
            <MenuLink page="catalog" icon={StoreIcon} label="Public_Catalog" />
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-green-900/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-sm bg-green-900/20 border border-green-800 flex items-center justify-center text-green-500 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-bold text-green-400">{user.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-red-900 hover:text-red-500 transition-colors">
              <Power className="w-5 h-5" />
            </button>
          </div>
          <div className="text-[9px] text-green-900 text-center mt-2">
             CONNECTED: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black text-zinc-300">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-green-900">
          <button onClick={() => setIsSidebarOpen(true)} className="text-green-500">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-green-500 tracking-widest">3L SYSTEM</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;