import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { User, SaleItem, Product } from '../types';
import { ShoppingBag, Plus, Minus, Trash2, MapPin, CheckCircle, Leaf, X, Sprout, Wind } from 'lucide-react';

interface ClientCatalogProps {
  user: User;
}

const ClientCatalog: React.FC<ClientCatalogProps> = ({ user }) => {
  const { products, stores, stock, processSale } = useData();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Set default store on load
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores]);

  const getStockForProduct = (productId: string) => {
    if (!selectedStoreId) return 0;
    return stock.find(s => s.productId === productId && s.storeId === selectedStoreId)?.quantity || 0;
  };

  const addToCart = (product: Product) => {
    const currentStock = getStockForProduct(product.id);
    const existingItem = cart.find(item => item.productId === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + 1 > currentStock) {
      alert("Estoque insuficiente nesta unidade.");
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }]);
      setIsCartOpen(true); // Auto open cart on first add
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item; // Cannot go below 1 here, use remove button
        
        const currentStock = getStockForProduct(productId);
        if (newQty > currentStock) {
            alert("Limite de estoque atingido.");
            return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleCheckout = () => {
    if (!selectedStoreId || cart.length === 0) return;
    
    // Process sale acting as "Online Order"
    processSale(selectedStoreId, user.id, "App 3L Green", cart, user.name);
    
    setCart([]);
    setSuccessMsg("Pedido confirmado! Sua reserva está pronta.");
    setIsCartOpen(false);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] font-rubik">
      {/* Header / Controls */}
      <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-4">
           <div className="bg-lime-500/20 p-3 rounded-xl text-lime-400">
             <Sprout className="w-8 h-8" />
           </div>
           <div>
             <h1 className="text-2xl font-black text-lime-400 tracking-tight">3L GESTÃO</h1>
             <p className="text-lime-200/60 text-sm font-medium">Catálogo de Strains Premium</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-[#022c22]/80 border border-green-800 px-4 py-3 rounded-xl flex-1 md:flex-none hover:border-lime-600/50 transition-colors">
                <MapPin className="w-5 h-5 text-lime-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-green-400 font-bold uppercase">Retirar em:</span>
                    <select 
                        value={selectedStoreId}
                        onChange={(e) => {
                            setSelectedStoreId(e.target.value);
                            setCart([]); // Clear cart if store changes to avoid stock inconsistencies
                        }}
                        className="bg-transparent border-none outline-none text-sm font-bold text-lime-100 w-full cursor-pointer"
                    >
                        {stores.map(store => (
                            <option key={store.id} value={store.id} className="bg-[#022c22] text-lime-100">{store.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative bg-gradient-to-r from-lime-600 to-green-700 text-white p-4 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all shadow-lg hover:shadow-lime-900/40 active:scale-95 group"
            >
                <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#022c22]">
                        {cartItemCount}
                    </span>
                )}
            </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-900/30 border border-lime-500/50 text-lime-300 p-4 rounded-2xl mb-8 flex items-center animate-pulse shadow-lg backdrop-blur-sm">
            <CheckCircle className="w-6 h-6 mr-3 text-lime-500" />
            <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.filter(p => p.active).map(product => {
            const stockQty = getStockForProduct(product.id);
            const hasStock = stockQty > 0;
            
            return (
                <div key={product.id} className="bg-[#064e3b]/40 border border-green-800/50 rounded-3xl overflow-hidden flex flex-col h-full hover:border-lime-500/50 transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-900/20 group backdrop-blur-sm">
                    <div className="h-56 bg-[#022c22] flex items-center justify-center overflow-hidden relative">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                        ) : (
                            <Leaf className="w-16 h-16 text-green-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b] via-transparent to-transparent opacity-80" />
                        
                        {!hasStock && (
                            <div className="absolute inset-0 bg-[#022c22]/80 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-red-400 text-xs font-bold tracking-widest border-2 border-red-500/50 px-4 py-2 rounded-lg bg-red-900/20">ESGOTADO</span>
                            </div>
                        )}
                        
                        <div className="absolute top-4 right-4 bg-[#022c22]/80 backdrop-blur-md px-3 py-1 rounded-full border border-lime-500/20">
                           <span className="text-lime-300 font-bold text-sm">R$ {product.price.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col relative">
                        <div className="mb-3">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-lime-600 bg-lime-900/20 px-2 py-1 rounded-md mb-2 inline-block">
                                {product.category}
                             </span>
                             <h3 className="font-bold text-xl text-lime-100 leading-tight group-hover:text-lime-400 transition-colors">{product.name}</h3>
                        </div>
                        <p className="text-sm text-lime-100/60 mb-6 line-clamp-3 leading-relaxed flex-1">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-800/30">
                             <div className="flex items-center text-lime-200/50 text-xs font-medium">
                                <Wind className="w-4 h-4 mr-1" />
                                {product.weightUnit}
                             </div>
                             <button 
                                onClick={() => addToCart(product)}
                                disabled={!hasStock}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    hasStock 
                                    ? 'bg-lime-500 text-[#022c22] hover:bg-lime-400 hover:scale-110 shadow-lg shadow-lime-900/50' 
                                    : 'bg-green-900 text-green-700 cursor-not-allowed'
                                }`}
                             >
                                <Plus className="w-6 h-6" />
                             </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Cart Sidebar Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-[#022c22]/90 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
            <div className="relative bg-[#064e3b] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-green-800 transform transition-transform duration-300">
                <div className="p-6 bg-[#022c22] border-b border-green-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-lime-400 flex items-center">
                        <ShoppingBag className="w-6 h-6 mr-3" /> SUA SACA
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="text-lime-200/50 hover:text-red-400 transition-colors bg-green-900/30 p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-lime-200/30">
                            <Leaf className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium text-lg">Sua saca está vazia.</p>
                            <p className="text-sm mt-2 text-center max-w-[200px]">Adicione as melhores strains e produtos ao seu pedido.</p>
                            <button onClick={() => setIsCartOpen(false)} className="mt-8 text-lime-400 text-sm font-bold hover:text-lime-300 uppercase tracking-widest border-b border-lime-500/30 pb-1">
                                Ver Produtos
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex items-center gap-4 bg-[#022c22]/50 border border-green-800/50 p-4 rounded-2xl shadow-sm hover:border-lime-500/30 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-bold text-lime-100 text-sm mb-1">{item.productName}</h4>
                                    <p className="text-xs text-lime-200/50">R$ {item.unitPrice.toFixed(2)} / un</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-[#064e3b] rounded-lg border border-green-800">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-2 hover:bg-green-800 text-lime-500 rounded-l-lg"><Minus className="w-3 h-3" /></button>
                                        <span className="w-8 text-center text-sm font-bold text-lime-100">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-2 hover:bg-green-800 text-lime-500 rounded-r-lg"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="text-right min-w-[70px]">
                                        <p className="font-bold text-sm text-lime-400">R$ {item.total.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-900 hover:text-red-400 bg-red-900/10 p-2 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-green-800 bg-[#022c22]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lime-200/50 text-sm font-medium">TOTAL ESTIMADO</span>
                        <span className="text-3xl font-black text-lime-400">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all shadow-lg ${
                            cart.length > 0
                            ? 'bg-gradient-to-r from-lime-600 to-green-600 text-white hover:from-lime-500 hover:to-green-500 shadow-lime-900/40 active:scale-95'
                            : 'bg-green-900/50 text-green-700 cursor-not-allowed'
                        }`}
                    >
                        Confirmar Pedido
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientCatalog;