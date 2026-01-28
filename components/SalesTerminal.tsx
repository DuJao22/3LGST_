import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Product, SaleItem, SaleStatus } from '../types';
import { Search, Plus, Trash2, CheckCircle, AlertCircle, Terminal, Code } from 'lucide-react';

interface SalesTerminalProps {
  currentUser: User;
}

const SalesTerminal: React.FC<SalesTerminalProps> = ({ currentUser }) => {
  const { products, getStock, processSale, stores } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentStore = stores.find(s => s.id === currentUser.storeId);

  if (!currentStore) {
    return <div className="p-4 text-red-500 font-mono">CRITICAL ERROR: OPERATOR_NODE_UNLINKED. CONTACT ADMIN.</div>;
  }

  const filteredProducts = products.filter(p => 
    p.active && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    const stockQty = getStock(product.id, currentStore.id);
    const inCart = cart.find(item => item.productId === product.id);
    const currentQtyInCart = inCart ? inCart.quantity : 0;

    if (currentQtyInCart + 1 > stockQty) {
      setErrorMsg(`INSUFFICIENT RESOURCES: ${product.name}`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    if (inCart) {
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
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.productId === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            const stockQty = getStock(productId, currentStore.id);
            if (newQty > stockQty) {
                setErrorMsg(`RESOURCE LIMIT EXCEEDED.`);
                setTimeout(() => setErrorMsg(''), 2000);
                return item;
            }
            return { ...item, quantity: newQty, total: newQty * item.unitPrice };
        }
        return item;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // POS Sales are always COMPLETED immediately
    processSale(currentStore.id, currentUser.id, currentUser.name, cart, customerName || 'Walk-in_Subject', SaleStatus.COMPLETED);
    
    setSuccessMsg('TRANSACTION COMMITTED.');
    setCart([]);
    setCustomerName('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Left: Product Selection */}
      <div className="flex-1 bg-zinc-900 rounded-sm border border-green-900/30 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-green-900/50 bg-black">
          <h2 className="text-lg font-bold text-green-500 mb-2 uppercase tracking-widest font-mono">Catalog: {currentStore.name}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700 w-5 h-5" />
            <input
              type="text"
              placeholder="SEARCH_QUERY..."
              className="w-full bg-zinc-900 border border-green-900 rounded-sm pl-10 pr-4 py-2 text-green-400 focus:border-green-500 focus:outline-none font-mono placeholder-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start custom-scrollbar">
          {filteredProducts.map(product => {
             const stock = getStock(product.id, currentStore.id);
             return (
              <div key={product.id} className="border border-green-900/30 rounded-sm p-3 hover:border-green-500 transition-colors bg-zinc-900 flex flex-col justify-between group">
                <div>
                  <div className="h-32 mb-3 rounded-sm overflow-hidden bg-black border border-green-900/20 flex items-center justify-center">
                      {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-80" />
                      ) : (
                          <Terminal className="w-8 h-8 text-green-900" />
                      )}
                  </div>
                  <h3 className="font-bold text-green-400 font-mono text-sm uppercase">{product.name}</h3>
                  <p className="text-[10px] text-zinc-500 mb-2 font-mono">{product.category} :: {product.weightUnit}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white font-mono">R$ {product.price.toFixed(2)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${stock > 0 ? 'bg-green-900/20 text-green-500 border-green-900' : 'bg-red-900/20 text-red-500 border-red-900'}`}>
                      QTY: {stock}
                    </span>
                  </div>
                </div>
                <button
                  disabled={stock <= 0}
                  onClick={() => addToCart(product)}
                  className={`w-full flex items-center justify-center py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                    stock > 0 
                    ? 'bg-zinc-800 text-green-400 hover:bg-green-600 hover:text-black border border-green-900' 
                    : 'bg-black text-zinc-700 cursor-not-allowed border border-zinc-800'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1" /> Append
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 bg-zinc-900 rounded-sm border border-green-900/30 flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="p-4 border-b border-green-900/50 bg-black">
          <h2 className="text-lg font-bold text-green-500 flex items-center uppercase tracking-widest font-mono">
            <Terminal className="mr-2 w-5 h-5" /> Active_Buffer
          </h2>
        </div>

        {errorMsg && (
            <div className="bg-red-900/20 text-red-500 border-b border-red-900 px-4 py-2 text-xs font-mono flex items-center animate-pulse">
                <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
            </div>
        )}
        {successMsg && (
            <div className="bg-green-900/20 text-green-400 border-b border-green-900 px-4 py-2 text-xs font-mono flex items-center animate-pulse">
                <CheckCircle className="w-4 h-4 mr-2" /> {successMsg}
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono">
              <Code className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-xs">[BUFFER EMPTY]</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-start border-b border-green-900/30 pb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-green-400 text-xs font-mono uppercase">{item.productName}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">R$ {item.unitPrice.toFixed(2)} un.</p>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="flex items-center border border-green-900/50 rounded-sm bg-black">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 py-0.5 hover:bg-green-900/30 text-green-600 font-mono">-</button>
                        <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 py-0.5 hover:bg-green-900/30 text-green-600 font-mono">+</button>
                   </div>
                  <div className="text-right">
                      <p className="font-bold text-sm text-white font-mono">R$ {item.total.toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-red-700 hover:text-red-500 font-mono uppercase">
                        [DELETE]
                      </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-black border-t border-green-900/50">
          <div className="mb-4">
             <label className="block text-[10px] font-bold text-green-700 mb-1 uppercase tracking-widest">Subject ID (Optional)</label>
             <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-zinc-900 border border-green-900 rounded-sm px-2 py-1 text-sm text-green-400 outline-none font-mono placeholder-zinc-700"
                placeholder="ANONYMOUS"
             />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 text-xs uppercase font-mono">Total_Value</span>
            <span className="text-2xl font-bold text-green-500 font-mono">R$ {cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-sm font-bold text-sm uppercase tracking-widest transition-all ${
                cart.length > 0 
                ? 'bg-green-600 text-black hover:bg-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                : 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
            }`}
          >
            Execute_Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;