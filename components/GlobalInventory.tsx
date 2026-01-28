import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { Search, Settings2, Package, Save, Terminal } from 'lucide-react';

const GlobalInventory: React.FC = () => {
  const { products, stores, stock, updateStock } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockForProduct = (productId: string, storeId: string) => {
    return stock.find(s => s.productId === productId && s.storeId === storeId)?.quantity || 0;
  };

  const handleStockUpdate = (storeId: string, newQty: number) => {
    if (!selectedProduct) return;
    updateStock(selectedProduct.id, storeId, newQty);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
        {/* Left: Product List */}
        <div className="flex-1 bg-zinc-900 rounded-sm border border-green-900/30 flex flex-col overflow-hidden shadow-lg">
             <div className="p-4 border-b border-green-900/50 bg-black">
                <h2 className="text-xl font-bold text-green-500 mb-4 uppercase tracking-wider font-mono">Matriz_Estoque_Global</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700 w-5 h-5" />
                    <input
                    type="text"
                    placeholder="ESCANEAR_ID_ITEM..."
                    className="w-full bg-zinc-900 border border-green-900 rounded-sm pl-10 pr-4 py-2 text-green-400 focus:border-green-500 outline-none font-mono placeholder-zinc-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>
             <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                {filteredProducts.map(product => {
                    const totalStock = stores.reduce((acc, store) => acc + getStockForProduct(product.id, store.id), 0);
                    const isSelected = selectedProduct?.id === product.id;

                    return (
                        <div 
                            key={product.id} 
                            onClick={() => setSelectedProduct(product)}
                            className={`flex items-center p-3 rounded-sm mb-2 cursor-pointer transition-all border ${isSelected ? 'bg-green-900/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-zinc-900 border-zinc-800 hover:border-green-900 hover:bg-black'}`}
                        >
                            <div className="w-12 h-12 rounded-sm bg-black border border-green-900 overflow-hidden flex-shrink-0">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} className="w-full h-full object-cover grayscale opacity-70" />
                                ) : (
                                    <Terminal className="w-full h-full p-3 text-green-900" />
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className={`font-bold font-mono text-sm uppercase ${isSelected ? 'text-green-400' : 'text-zinc-400'}`}>{product.name}</h3>
                                <p className="text-[10px] text-zinc-600 font-mono">{product.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-white font-mono">{totalStock} unid.</p>
                                <p className="text-[10px] text-zinc-600 uppercase">Total_Sys</p>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>

        {/* Right: Stock Detail & Edit */}
        <div className="w-full lg:w-96 bg-zinc-900 rounded-sm border border-green-900/30 flex flex-col">
            <div className="p-4 border-b border-green-900/50 bg-black">
                <h3 className="font-bold text-green-500 flex items-center uppercase tracking-wider font-mono">
                    <Settings2 className="w-5 h-5 mr-2" /> Modificar_Alocações
                </h3>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {selectedProduct ? (
                    <div className="space-y-6">
                        <div className="text-center pb-4 border-b border-green-900/30">
                            <h2 className="text-xl font-bold text-green-400 font-mono uppercase">{selectedProduct.name}</h2>
                            <p className="text-xs text-zinc-500 font-mono">{selectedProduct.weightUnit} - R$ {selectedProduct.price.toFixed(2)}</p>
                        </div>

                        <div className="space-y-4">
                            {stores.map(store => {
                                const qty = getStockForProduct(selectedProduct.id, store.id);
                                return (
                                    <div key={store.id} className="bg-black p-4 rounded-sm border border-green-900/50 hover:border-green-700 transition-colors">
                                        <label className="block text-xs font-bold text-green-700 mb-2 uppercase tracking-widest">{store.name}</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="flex-1 bg-zinc-900 border border-green-900 rounded-sm p-2 text-center font-mono font-bold text-white focus:border-green-500 outline-none"
                                                value={qty}
                                                onChange={(e) => handleStockUpdate(store.id, parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-xs text-zinc-600 font-mono uppercase w-12">unid.</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-xs text-center uppercase">[AGUARDANDO_SELEÇÃO]</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default GlobalInventory;