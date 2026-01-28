import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { Search, Settings2, Package, Save } from 'lucide-react';

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
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
             <div className="p-4 border-b border-stone-200">
                <h2 className="text-xl font-bold text-stone-800 mb-4">Estoque Global</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                    <input
                    type="text"
                    placeholder="Buscar produto..."
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>
             <div className="overflow-y-auto flex-1 p-2">
                {filteredProducts.map(product => {
                    const totalStock = stores.reduce((acc, store) => acc + getStockForProduct(product.id, store.id), 0);
                    const isSelected = selectedProduct?.id === product.id;

                    return (
                        <div 
                            key={product.id} 
                            onClick={() => setSelectedProduct(product)}
                            className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors border ${isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-stone-100 hover:bg-stone-50'}`}
                        >
                            <div className="w-12 h-12 rounded bg-stone-200 overflow-hidden flex-shrink-0">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-full h-full p-3 text-stone-400" />
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-stone-800">{product.name}</h3>
                                <p className="text-xs text-stone-500">{product.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-stone-700">{totalStock} unid.</p>
                                <p className="text-xs text-stone-400">Total Global</p>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>

        {/* Right: Stock Detail & Edit */}
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col">
            <div className="p-4 border-b border-stone-200 bg-stone-50">
                <h3 className="font-bold text-stone-700 flex items-center">
                    <Settings2 className="w-5 h-5 mr-2" /> Gerenciar Estoque
                </h3>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
                {selectedProduct ? (
                    <div className="space-y-6">
                        <div className="text-center pb-4 border-b border-stone-100">
                            <h2 className="text-xl font-bold text-green-800">{selectedProduct.name}</h2>
                            <p className="text-sm text-stone-500">{selectedProduct.weightUnit} - R$ {selectedProduct.price.toFixed(2)}</p>
                        </div>

                        <div className="space-y-4">
                            {stores.map(store => {
                                const qty = getStockForProduct(selectedProduct.id, store.id);
                                return (
                                    <div key={store.id} className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                        <label className="block text-sm font-semibold text-stone-700 mb-2">{store.name}</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="flex-1 border border-stone-300 rounded p-2 text-center font-mono font-bold"
                                                value={qty}
                                                onChange={(e) => handleStockUpdate(store.id, parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-sm text-stone-500 w-12">unid.</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <p>Selecione um produto ao lado para ajustar o estoque por loja.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default GlobalInventory;