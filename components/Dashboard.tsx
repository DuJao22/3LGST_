import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, DollarSign, Package, ShoppingBag, Terminal, Activity } from 'lucide-react';

const COLORS = ['#22c55e', '#15803d', '#4ade80', '#166534', '#86efac'];

const Dashboard: React.FC = () => {
  const { sales, products, stock, stores } = useData();

  // Metrics
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalSalesCount = sales.length;
  const totalItemsSold = sales.reduce((acc, sale) => acc + sale.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  
  // Chart Data: Sales by Store
  const salesByStore = stores.map(store => {
    const storeSales = sales.filter(s => s.storeId === store.id);
    const revenue = storeSales.reduce((acc, s) => acc + s.totalAmount, 0);
    return { name: store.name, revenue };
  });

  // Chart Data: Top Products
  const productSalesMap: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      productSalesMap[item.productName] = (productSalesMap[item.productName] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productSalesMap)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Low Stock Alerts
  const lowStockThreshold = 10;
  const lowStockItems = products.flatMap(p => 
    stores.map(s => {
       const qty = stock.find(st => st.productId === p.id && st.storeId === s.id)?.quantity || 0;
       return { product: p, store: s, qty };
    })
  ).filter(item => item.qty < lowStockThreshold);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-green-900/30 pb-4">
        <h1 className="text-2xl font-bold text-green-500 uppercase tracking-widest flex items-center">
            <Activity className="w-6 h-6 mr-2 animate-pulse" /> Visão_Geral_Sistema
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-sm border border-green-900/50 hover:border-green-500 transition-colors group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-green-700 uppercase tracking-widest mb-1 group-hover:text-green-400">Receita Total</p>
              <h3 className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-black border border-green-900 rounded-sm text-green-500 group-hover:text-green-400 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-sm border border-green-900/50 hover:border-green-500 transition-colors group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-green-700 uppercase tracking-widest mb-1 group-hover:text-green-400">Transações</p>
              <h3 className="text-2xl font-bold text-white">{totalSalesCount}</h3>
            </div>
            <div className="p-3 bg-black border border-green-900 rounded-sm text-green-500 group-hover:text-green-400 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-sm border border-green-900/50 hover:border-green-500 transition-colors group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-green-700 uppercase tracking-widest mb-1 group-hover:text-green-400">Unidades Vendidas</p>
              <h3 className="text-2xl font-bold text-white">{totalItemsSold}</h3>
            </div>
            <div className="p-3 bg-black border border-green-900 rounded-sm text-green-500 group-hover:text-green-400 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-sm border border-red-900/30 hover:border-red-500 transition-colors group">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-red-800 uppercase tracking-widest mb-1 group-hover:text-red-500">Alertas de Estoque</p>
              <h3 className="text-2xl font-bold text-red-500">{lowStockItems.length}</h3>
            </div>
            <div className="p-3 bg-black border border-red-900 rounded-sm text-red-600 group-hover:text-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Store Chart */}
        <div className="bg-zinc-900 p-6 rounded-sm border border-green-900/50">
          <h3 className="text-sm font-bold text-green-400 mb-6 uppercase tracking-wider flex items-center">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
             Receita_Por_Unidade
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByStore}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4ade80" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4ade80" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#22c55e', color: '#fff' }}
                    itemStyle={{ color: '#4ade80' }}
                    cursor={{fill: '#14532d'}}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-zinc-900 p-6 rounded-sm border border-green-900/50">
          <h3 className="text-sm font-bold text-green-400 mb-6 uppercase tracking-wider flex items-center">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
             Produtos_Mais_Vendidos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.substring(0,10)}.. ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                  stroke="#000"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#22c55e', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      <div className="bg-zinc-900 p-6 rounded-sm border border-green-900/50">
        <h3 className="text-sm font-bold text-red-500 mb-4 flex items-center uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Níveis_Críticos_Estoque
        </h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-green-900/30 text-green-700 text-xs uppercase">
                        <th className="py-3 px-2">Ref_Img</th>
                        <th className="py-3 px-2">Nome_Item</th>
                        <th className="py-3 px-2">Unidade_Local</th>
                        <th className="py-3 px-2">Qtd_Atual</th>
                        <th className="py-3 px-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {lowStockItems.length === 0 ? (
                        <tr><td colSpan={5} className="py-6 text-center text-zinc-600 text-xs">TODOS OS SISTEMAS NORMAIS. SEM ALERTAS.</td></tr>
                    ) : (
                        lowStockItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-green-900/10 hover:bg-green-900/5 transition-colors">
                                <td className="py-2 px-2">
                                     <div className="w-8 h-8 rounded-sm overflow-hidden bg-black border border-green-900 flex items-center justify-center">
                                        {item.product.imageUrl ? (
                                            <img src={item.product.imageUrl} className="w-full h-full object-cover opacity-70" />
                                        ) : (
                                            <Terminal className="w-4 h-4 text-green-900" />
                                        )}
                                     </div>
                                </td>
                                <td className="py-2 px-2 font-medium text-zinc-300 text-xs">{item.product.name}</td>
                                <td className="py-2 px-2 text-zinc-500 text-xs">{item.store.name}</td>
                                <td className="py-2 px-2 text-red-500 font-bold font-mono">{item.qty}</td>
                                <td className="py-2 px-2"><span className="px-2 py-0.5 text-[10px] bg-red-900/20 border border-red-900 text-red-500 rounded-sm">CRÍTICO</span></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;