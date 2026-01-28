import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SaleStatus, User, UserRole } from '../types';
import { CheckCircle, XCircle, Clock, Package, User as UserIcon, MapPin, ListFilter } from 'lucide-react';

interface OrdersManagerProps {
    currentUser: User;
}

const OrdersManager: React.FC<OrdersManagerProps> = ({ currentUser }) => {
  const { sales, updateSaleStatus, stores } = useData();
  const [filterStatus, setFilterStatus] = useState<SaleStatus | 'ALL'>('ALL');

  // Filter logic:
  // 1. If Admin, see all. If Seller, see only their store's orders.
  // 2. Filter by Status tab.
  const filteredSales = sales.filter(sale => {
      const belongsToStore = currentUser.role === UserRole.ADMIN || sale.storeId === currentUser.storeId;
      const matchesStatus = filterStatus === 'ALL' ? true : sale.status === filterStatus;
      return belongsToStore && matchesStatus;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const handleStatusChange = (saleId: string, newStatus: SaleStatus) => {
      if (window.confirm(`Confirmar alteração de status para ${newStatus}?`)) {
          updateSaleStatus(saleId, newStatus);
      }
  };

  const getStatusColor = (status: SaleStatus) => {
      switch (status) {
          case SaleStatus.PENDING: return 'text-yellow-500 border-yellow-500 bg-yellow-900/20';
          case SaleStatus.COMPLETED: return 'text-green-500 border-green-500 bg-green-900/20';
          case SaleStatus.CANCELLED: return 'text-red-500 border-red-500 bg-red-900/20';
          default: return 'text-zinc-500 border-zinc-500';
      }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-green-500 uppercase tracking-widest font-mono">Pedidos_Recebidos</h1>
            <p className="text-zinc-500 text-xs font-mono">Gerenciar solicitações de clientes e entregas.</p>
        </div>
        
        {/* Status Filters */}
        <div className="flex bg-zinc-900 rounded-sm border border-green-900/30 p-1">
            <button 
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-1 rounded-sm text-xs font-bold font-mono transition-colors ${filterStatus === 'ALL' ? 'bg-green-600 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
                TODOS
            </button>
            <button 
                onClick={() => setFilterStatus(SaleStatus.PENDING)}
                className={`px-4 py-1 rounded-sm text-xs font-bold font-mono transition-colors flex items-center gap-2 ${filterStatus === SaleStatus.PENDING ? 'bg-yellow-600 text-black' : 'text-zinc-400 hover:text-yellow-400'}`}
            >
                PENDENTES
                {sales.filter(s => s.status === SaleStatus.PENDING && (currentUser.role === UserRole.ADMIN || s.storeId === currentUser.storeId)).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
            </button>
            <button 
                onClick={() => setFilterStatus(SaleStatus.COMPLETED)}
                className={`px-4 py-1 rounded-sm text-xs font-bold font-mono transition-colors ${filterStatus === SaleStatus.COMPLETED ? 'bg-green-600 text-black' : 'text-zinc-400 hover:text-green-400'}`}
            >
                CONCLUÍDOS
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {filteredSales.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-700 font-mono border border-dashed border-green-900/30 rounded-sm">
                <ListFilter className="w-12 h-12 mb-3 opacity-20" />
                <p>NENHUM PEDIDO NA FILA.</p>
            </div>
        ) : (
            filteredSales.map(sale => {
                const storeName = stores.find(s => s.id === sale.storeId)?.name;
                return (
                    <div key={sale.id} className={`bg-zinc-900 border rounded-sm p-4 transition-all ${sale.status === SaleStatus.PENDING ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-green-900/30 opacity-75 hover:opacity-100'}`}>
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-zinc-800 pb-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(sale.status)}`}>
                                        {sale.status === 'PENDING' ? 'PENDENTE' : sale.status === 'COMPLETED' ? 'CONCLUÍDO' : 'CANCELADO'}
                                    </span>
                                    <span className="font-mono text-xs text-zinc-500">ID: {sale.id.slice(-6)}</span>
                                    <span className="font-mono text-xs text-zinc-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatDate(sale.timestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <UserIcon className="w-4 h-4 text-green-600" />
                                    <span className="font-bold text-green-400 font-mono text-sm uppercase">{sale.customerName || sale.sellerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                    <MapPin className="w-3 h-3" /> {storeName}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end justify-center">
                                <span className="font-bold text-xl text-white font-mono">R$ {sale.totalAmount.toFixed(2)}</span>
                                <span className="text-[10px] text-zinc-500 uppercase">{sale.items.length} Itens</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {sale.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-black p-2 rounded-sm border border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <Package className="w-4 h-4 text-green-800" />
                                        <div>
                                            <p className="font-bold text-xs text-zinc-300 font-mono uppercase">{item.productName}</p>
                                            <p className="text-[10px] text-zinc-600 font-mono">{item.quantity} un.</p>
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs text-green-600">R$ {item.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {sale.status === SaleStatus.PENDING && (
                            <div className="flex gap-3 justify-end pt-2 border-t border-zinc-800">
                                <button 
                                    onClick={() => handleStatusChange(sale.id, SaleStatus.CANCELLED)}
                                    className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/50 rounded-sm font-bold text-xs uppercase flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Cancelar / Estornar
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(sale.id, SaleStatus.COMPLETED)}
                                    className="px-4 py-2 bg-green-600 text-black hover:bg-green-500 rounded-sm font-bold text-xs uppercase flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" /> Marcar Entregue
                                </button>
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default OrdersManager;