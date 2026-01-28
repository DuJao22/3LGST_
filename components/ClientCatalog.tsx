import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { User, SaleItem, Product } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, Store as StoreIcon, CheckCircle, Leaf, X } from 'lucide-react';

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
      alert("Estoque insuficiente nesta loja.");
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
    // We use the client's name as customerName and "Pedido Online" as sellerName or similar to distinguish
    processSale(selectedStoreId, user.id, "Auto-Atendimento (App)", cart, user.name);
    
    setCart([]);
    setSuccessMsg("Pedido realizado com sucesso! Retire na loja selecionada.");
    setIsCartOpen(false);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Header / Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <div>
           <h1 className="text-2xl font-bold text-stone-800">Faça seu Pedido</h1>
           <p className="text-stone-500 text-sm">Selecione os produtos e retire na loja.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-lg flex-1 md:flex-none">
                <StoreIcon className="w-4 h-4 text-stone-500" />
                <select 
                    value={selectedStoreId}
                    onChange={(e) => {
                        setSelectedStoreId(e.target.value);
                        setCart([]); // Clear cart if store changes to avoid stock inconsistencies
                    }}
                    className="bg-transparent border-none outline-none text-sm font-medium text-stone-700 w-full"
                >
                    {stores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                </select>
            </div>

            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative bg-green-700 text-white p-2 rounded-lg hover:bg-green-800 transition-colors"
            >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {cartItemCount}
                    </span>
                )}
            </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl mb-6 flex items-center animate-pulse">
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
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="h-48 bg-stone-100 flex items-center justify-center overflow-hidden relative">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <Leaf className="w-12 h-12 text-stone-300" />
                        )}
                        {!hasStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Esgotado nesta loja</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-stone-800 leading-tight">{product.name}</h3>
                        </div>
                        <p className="text-sm text-stone-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                             <div>
                                <p className="text-xs text-stone-400">{product.weightUnit}</p>
                                <p className="text-lg font-bold text-green-700">R$ {product.price.toFixed(2)}</p>
                             </div>
                             <button 
                                onClick={() => addToCart(product)}
                                disabled={!hasStock}
                                className={`p-2 rounded-full transition-colors ${
                                    hasStock 
                                    ? 'bg-stone-800 text-white hover:bg-green-700' 
                                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
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
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-green-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2" /> Seu Carrinho
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="text-stone-500 hover:text-stone-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400">
                            <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                            <p>Seu carrinho está vazio.</p>
                            <button onClick={() => setIsCartOpen(false)} className="mt-4 text-green-700 font-medium hover:underline">
                                Continuar comprando
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex items-center gap-3 bg-white border border-stone-100 p-3 rounded-lg shadow-sm">
                                <div className="flex-1">
                                    <h4 className="font-medium text-stone-800 line-clamp-1">{item.productName}</h4>
                                    <p className="text-xs text-stone-500">R$ {item.unitPrice.toFixed(2)} / un</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-stone-200 text-stone-600"><Minus className="w-3 h-3" /></button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-stone-200 text-stone-600"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="text-right min-w-[60px]">
                                        <p className="font-bold text-sm text-stone-800">R$ {item.total.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-stone-100 bg-stone-50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-stone-600">Total do Pedido</span>
                        <span className="text-2xl font-bold text-green-800">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className={`w-full py-3 rounded-xl font-bold text-lg shadow-sm transition-transform active:scale-95 ${
                            cart.length > 0
                            ? 'bg-green-700 text-white hover:bg-green-800'
                            : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        }`}
                    >
                        Finalizar Pedido
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientCatalog;