import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Product } from '../types';
import { Search, Package, Save, RefreshCw } from 'lucide-react';

// Assuming we pass current user or use context to get it. 
// Since App.tsx has useData, let's stick to props or assume auth is available. 
// Actually, App.tsx passes props. Let's create an interface.

interface StoreInventoryProps {
    user: User;
}

const StoreInventory: React.FC<StoreInventoryProps> = ({ user }) => {
  const { products, stock, updateStock, stores } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentStore = stores.find(s => s.id === user.storeId);

  if (!currentStore) return <div className="p-4 text-red-600">Erro: Vendedor sem loja vinculada.</div>;

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
            <h1 className="text-2xl font-bold text-stone-800">Estoque: {currentStore.name}</h1>
            <p className="text-stone-500">Gerenciamento local de inventário</p>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Filtrar produtos..."
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                    <th className="p-4 font-semibold text-stone-600">Produto</th>
                    <th className="p-4 font-semibold text-stone-600 text-center">Quantidade Atual</th>
                    <th className="p-4 font-semibold text-stone-600 text-center">Ajuste Rápido</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts.map(product => {
                    const qty = getMyStock(product.id);
                    return (
                        <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50">
                            <td className="p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded bg-stone-100 overflow-hidden flex-shrink-0 mr-3">
                                        {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Package className="p-2 text-stone-400" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-stone-800">{product.name}</p>
                                        <p className="text-xs text-stone-500">{product.weightUnit}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${qty < 5 ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-800'}`}>
                                    {qty}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleQuickUpdate(product, -1)} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center font-bold text-lg">-</button>
                                    <button onClick={() => handleQuickUpdate(product, 1)} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-green-100 hover:text-green-600 transition-colors flex items-center justify-center font-bold text-lg">+</button>
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