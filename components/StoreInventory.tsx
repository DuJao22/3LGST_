import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Product } from '../types';
import { Search, Package, Save, RefreshCw, Terminal } from 'lucide-react';

interface StoreInventoryProps {
    user: User;
}

const StoreInventory: React.FC<StoreInventoryProps> = ({ user }) => {
  const { products, stock, updateStock, stores } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentStore = stores.find(s => s.id === user.storeId);

  if (!currentStore) return <div className="p-4 text-red-500 font-mono">ERRO FATAL: OPERADOR_SEM_VÍNCULO.</div>;

  const filteredProducts = products.filter(p => 
    p.active && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMyStock = (productId: string) => {
    return stock.find(s => s.productId === productId && s.storeId === currentStore.id)?.quantity || 0;
  };

  const handleQuickUpdate = (product: Product, delta: number) => {
    const currentQty = getMyStock(product.id);
    const newQty = Math.max(0, currentQty + delta);
    updateStock(product.id, currentStore.id, newQty);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-green-500 uppercase tracking-wider font-mono">Armazenamento: {currentStore.name}</h1>
            <p className="text-zinc-500 text-xs font-mono">Subsistema de gestão de inventário local.</p>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700 w-5 h-5" />
            <input
                type="text"
                placeholder="FILTRAR_ATIVOS..."
                className="w-full bg-zinc-900 border border-green-900 rounded-sm pl-10 pr-4 py-2 text-green-400 focus:border-green-500 outline-none font-mono placeholder-zinc-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-sm border border-green-900/30 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-black border-b border-green-900">
                <tr>
                    <th className="p-4 font-mono text-xs text-green-700 uppercase">ID_Ativo</th>
                    <th className="p-4 font-mono text-xs text-green-700 uppercase text-center">Nível_Atual</th>
                    <th className="p-4 font-mono text-xs text-green-700 uppercase text-center">Ajuste_Rápido</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts.map(product => {
                    const qty = getMyStock(product.id);
                    return (
                        <tr key={product.id} className="border-b border-green-900/10 hover:bg-green-900/5 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-sm bg-black border border-green-900 overflow-hidden flex-shrink-0 mr-3">
                                        {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover grayscale opacity-70" /> : <Terminal className="p-2 text-green-900" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-400 font-mono text-sm uppercase">{product.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono">{product.weightUnit}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-sm text-xs font-bold font-mono border ${qty < 5 ? 'bg-red-900/20 text-red-500 border-red-900' : 'bg-green-900/20 text-green-500 border-green-900'}`}>
                                    {qty}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleQuickUpdate(product, -1)} className="w-8 h-8 rounded-sm bg-black border border-green-900 hover:bg-red-900/30 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center font-bold text-lg text-zinc-500">-</button>
                                    <button onClick={() => handleQuickUpdate(product, 1)} className="w-8 h-8 rounded-sm bg-black border border-green-900 hover:bg-green-900/30 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center font-bold text-lg text-zinc-500">+</button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreInventory;