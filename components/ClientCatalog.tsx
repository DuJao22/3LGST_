import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { User, SaleItem, Product } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, Store as StoreIcon, CheckCircle, Terminal, X, Code2 } from 'lucide-react';

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
      alert("INSUFFICIENT STOCK AT SELECTED NODE.");
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
            alert("MAX STOCK LIMIT REACHED.");
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
    processSale(selectedStoreId, user.id, "Auto-Terminal (Web)", cart, user.name);
    
    setCart([]);
    setSuccessMsg("ORDER EXECUTED SUCCESSFULLY. PROCEED TO PICKUP.");
    setIsCartOpen(false);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Header / Controls */}
      <div className="bg-zinc-900 p-4 rounded-sm border border-green-900/50 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div>
           <h1 className="text-xl font-bold text-green-500 tracking-widest uppercase">Public_Access_Terminal</h1>
           <p className="text-zinc-500 text-xs font-mono">Select items for acquisition.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-black border border-green-900 px-3 py-2 rounded-sm flex-1 md:flex-none">
                <StoreIcon className="w-4 h-4 text-green-600" />
                <select 
                    value={selectedStoreId}
                    onChange={(e) => {
                        setSelectedStoreId(e.target.value);
                        setCart([]); // Clear cart if store changes to avoid stock inconsistencies
                    }}
                    className="bg-transparent border-none outline-none text-xs font-mono text-green-400 w-full uppercase"
                >
                    {stores.map(store => (
                        <option key={store.id} value={store.id} className="bg-black text-green-400">{store.name}</option>
                    ))}
                </select>
            </div>

            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative bg-green-900/20 border border-green-600 text-green-400 p-2 rounded-sm hover:bg-green-500 hover:text-black transition-all hover:shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-sm border border-black">
                        {cartItemCount}
                    </span>
                )}
            </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-900/20 border border-green-500 text-green-400 p-4 rounded-sm mb-6 flex items-center animate-pulse font-mono text-sm">
            <CheckCircle className="w-5 h-5 mr-3" />
            {successMsg}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.filter(p => p.active).map(product => {
            const stockQty = getStockForProduct(product.id);
            const hasStock = stockQty > 0;
            
            return (
                <div key={product.id} className="bg-zinc-900 border border-green-900/30 rounded-sm overflow-hidden flex flex-col h-full hover:border-green-500 transition-colors group">
                    <div className="h-48 bg-black flex items-center justify-center overflow-hidden relative border-b border-green-900/30">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                        ) : (
                            <Terminal className="w-12 h-12 text-green-900" />
                        )}
                        {!hasStock && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center border border-red-900 m-2">
                                <span className="text-red-500 text-xs font-bold font-mono tracking-widest border border-red-500 px-2 py-1">[OUT_OF_STOCK]</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-sm text-green-400 leading-tight uppercase font-mono">{product.name}</h3>
                        </div>
                        <p className="text-xs text-zinc-500 mb-4 line-clamp-2 flex-1 font-mono">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-900/30">
                             <div>
                                <p className="text-[10px] text-zinc-600 uppercase">{product.weightUnit}</p>
                                <p className="text-lg font-bold text-white font-mono">R$ {product.price.toFixed(2)}</p>
                             </div>
                             <button 
                                onClick={() => addToCart(product)}
                                disabled={!hasStock}
                                className={`p-2 rounded-sm transition-all border ${
                                    hasStock 
                                    ? 'bg-black border-green-600 text-green-500 hover:bg-green-500 hover:text-black shadow-[0_0_5px_rgba(34,197,94,0.2)]' 
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                                }`}
                             >
                                <Plus className="w-5 h-5" />
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <div className="relative bg-zinc-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-green-900">
                <div className="p-4 bg-black border-b border-green-900 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-green-500 flex items-center font-mono">
                        <Code2 className="w-5 h-5 mr-2" /> CART_CONTENTS
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-red-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono">
                            <Terminal className="w-12 h-12 mb-3 opacity-20" />
                            <p>BUFFER EMPTY.</p>
                            <button onClick={() => setIsCartOpen(false)} className="mt-4 text-green-600 text-xs hover:text-green-400 uppercase border border-green-900 px-3 py-1">
                                [RETURN_TO_CATALOG]
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex items-center gap-3 bg-black border border-green-900/50 p-3 rounded-sm">
                                <div className="flex-1">
                                    <h4 className="font-bold text-green-400 text-xs uppercase line-clamp-1">{item.productName}</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono">R$ {item.unitPrice.toFixed(2)} / un</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-green-900 rounded-sm bg-zinc-900">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-green-900/50 text-green-600"><Minus className="w-3 h-3" /></button>
                                        <span className="w-8 text-center text-xs font-mono text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-green-900/50 text-green-600"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="text-right min-w-[60px]">
                                        <p className="font-bold text-sm text-white font-mono">R$ {item.total.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-900 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-green-900 bg-black">
                    <div className="flex justify-between items-center mb-4 font-mono">
                        <span className="text-zinc-500 text-xs uppercase">Total_Value</span>
                        <span className="text-2xl font-bold text-green-500">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className={`w-full py-3 rounded-sm font-bold text-sm uppercase tracking-widest transition-all ${
                            cart.length > 0
                            ? 'bg-green-600 text-black hover:bg-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]'
                            : 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                        }`}
                    >
                        [EXECUTE_ORDER]
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientCatalog;