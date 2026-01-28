import React from 'react';
import { useData } from '../context/DataContext';
import { Calendar, ShoppingCart, User, MapPin } from 'lucide-react';

const SalesHistory: React.FC = () => {
  const { sales, stores } = useData();

  // Sort by newest
  const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-800">Histórico de Vendas</h1>
        <div className="text-sm text-stone-500">
            Total de registros: {sortedSales.length}
        </div>
      </div>

      <div className="space-y-4">
        {sortedSales.length === 0 ? (
            <div className="text-center p-12 text-stone-400 bg-white rounded-xl border border-stone-200">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma venda registrada ainda.</p>
            </div>
        ) : (
            sortedSales.map(sale => {
                const storeName = stores.find(s => s.id === sale.storeId)?.name || 'Loja Desconhecida';
                return (
                    <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                        <div className="bg-stone-50 p-4 border-b border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-xs text-stone-400">#{sale.id.slice(-6)}</span>
                                <div className="flex items-center text-sm text-stone-600">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(sale.timestamp)}
                                </div>
                                <div className="flex items-center text-sm text-stone-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {storeName}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-sm text-stone-600">
                                    <User className="w-4 h-4 mr-1" />
                                    {sale.sellerName}
                                </div>
                                <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    R$ {sale.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-2 text-xs font-semibold text-stone-500 uppercase">Itens da Venda</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 rounded bg-stone-50 border border-stone-100">
                                        <div>
                                            <p className="font-medium text-sm text-stone-800">{item.productName}</p>
                                            <p className="text-xs text-stone-500">{item.quantity} x R$ {item.unitPrice.toFixed(2)}</p>
                                        </div>
                                        <span className="font-bold text-stone-700 text-sm">R$ {item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            {sale.customerName && (
                                <div className="mt-3 text-xs text-stone-400">
                                    Cliente: <span className="text-stone-600">{sale.customerName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default SalesHistory;