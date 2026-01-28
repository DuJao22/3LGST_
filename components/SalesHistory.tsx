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
      <div className="flex justify-between items-center border-b border-green-900/30 pb-4">
        <h1 className="text-2xl font-bold text-green-500 uppercase tracking-widest font-mono">Transaction_Logs</h1>
        <div className="text-xs text-zinc-500 font-mono">
            LOG_ENTRIES: {sortedSales.length}
        </div>
      </div>

      <div className="space-y-4">
        {sortedSales.length === 0 ? (
            <div className="text-center p-12 text-zinc-700 bg-zinc-900 rounded-sm border border-green-900/30 font-mono">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>NO DATA LOGGED.</p>
            </div>
        ) : (
            sortedSales.map(sale => {
                const storeName = stores.find(s => s.id === sale.storeId)?.name || 'UNKNOWN_NODE';
                return (
                    <div key={sale.id} className="bg-zinc-900 rounded-sm border border-green-900/30 overflow-hidden hover:border-green-500 transition-colors">
                        <div className="bg-black p-4 border-b border-green-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">ID: {sale.id.slice(-8)}</span>
                                <div className="flex items-center text-xs text-zinc-400 font-mono">
                                    <Calendar className="w-3 h-3 mr-1 text-green-700" />
                                    {formatDate(sale.timestamp)}
                                </div>
                                <div className="flex items-center text-xs text-zinc-400 font-mono">
                                    <MapPin className="w-3 h-3 mr-1 text-green-700" />
                                    {storeName}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-xs text-zinc-400 font-mono">
                                    <User className="w-3 h-3 mr-1 text-green-700" />
                                    {sale.sellerName}
                                </div>
                                <span className="font-bold text-green-400 bg-green-900/20 px-3 py-1 rounded-sm border border-green-900 font-mono text-sm">
                                    R$ {sale.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-2 text-[10px] font-bold text-green-800 uppercase tracking-widest">Manifest</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 rounded-sm bg-black border border-green-900/30">
                                        <div>
                                            <p className="font-bold text-xs text-zinc-300 font-mono uppercase">{item.productName}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">{item.quantity} x R$ {item.unitPrice.toFixed(2)}</p>
                                        </div>
                                        <span className="font-bold text-green-600 text-xs font-mono">R$ {item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            {sale.customerName && (
                                <div className="mt-3 text-[10px] text-zinc-600 font-mono border-t border-green-900/20 pt-2">
                                    SUBJECT: <span className="text-zinc-400 uppercase">{sale.customerName}</span>
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