import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Product, SaleItem } from '../types';
import { Search, Plus, Trash2, CheckCircle, AlertCircle, Leaf } from 'lucide-react';

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
    return <div className="p-4 text-red-600">Erro: Vendedor não associado a uma loja válida. Contate o administrador.</div>;
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
      setErrorMsg(`Estoque insuficiente para ${product.name}`);
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
                setErrorMsg(`Limite de estoque atingido para este item.`);
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

    processSale(currentStore.id, currentUser.id, currentUser.name, cart, customerName || 'Cliente Balcão');
    
    setSuccessMsg('Venda realizada com sucesso!');
    setCart([]);
    setCustomerName('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Left: Product Selection */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <h2 className="text-lg font-bold text-stone-800 mb-2">Catálogo - {currentStore.name}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produto..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {filteredProducts.map(product => {
             const stock = getStock(product.id, currentStore.id);
             return (
              <div key={product.id} className="border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                <div>
                  <div className="h-32 mb-3 rounded-md overflow-hidden bg-stone-100 flex items-center justify-center">
                      {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                          <Leaf className="w-8 h-8 text-stone-300" />
                      )}
                  </div>
                  <h3 className="font-semibold text-stone-800">{product.name}</h3>
                  <p className="text-xs text-stone-500 mb-2">{product.category} • {product.weightUnit}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-green-700">R$ {product.price.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Estoque: {stock}
                    </span>
                  </div>
                </div>
                <button
                  disabled={stock <= 0}
                  onClick={() => addToCart(product)}
                  className={`w-full flex items-center justify-center py-2 rounded-md text-sm font-medium transition-colors ${
                    stock > 0 
                    ? 'bg-stone-800 text-white hover:bg-stone-700' 
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col">
        <div className="p-4 border-b border-stone-200 bg-green-50">
          <h2 className="text-lg font-bold text-green-900 flex items-center">
            <span className="mr-2">🛒</span> Caixa Aberto
          </h2>
        </div>

        {errorMsg && (
            <div className="bg-red-100 text-red-800 px-4 py-2 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
            </div>
        )}
        {successMsg && (
            <div className="bg-green-100 text-green-800 px-4 py-2 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> {successMsg}
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <p>O carrinho está vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-start border-b border-stone-100 pb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-stone-800 text-sm">{item.productName}</h4>
                  <p className="text-xs text-stone-500">R$ {item.unitPrice.toFixed(2)} un.</p>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="flex items-center border border-stone-300 rounded">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 py-0.5 hover:bg-stone-100 text-stone-600">-</button>
                        <span className="px-2 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 py-0.5 hover:bg-stone-100 text-stone-600">+</button>
                   </div>
                  <div className="text-right">
                      <p className="font-bold text-sm">R$ {item.total.toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-xs text-red-500 hover:underline">
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200">
          <div className="mb-4">
             <label className="block text-xs font-medium text-stone-600 mb-1">Cliente (Opcional)</label>
             <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
                placeholder="Nome do cliente"
             />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-600">Total</span>
            <span className="text-2xl font-bold text-green-800">R$ {cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-lg font-bold text-lg shadow-sm transition-transform active:scale-95 ${
                cart.length > 0 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;