import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, DollarSign, Package, ShoppingBag, Leaf } from 'lucide-react';
import { analyzeSalesTrends } from '../services/geminiService';

const COLORS = ['#15803d', '#b45309', '#0f766e', '#be185d'];

const Dashboard: React.FC = () => {
  const { sales, products, stock, stores } = useData();
  const [analysis, setAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    const summary = `Total Revenue: R$${totalRevenue.toFixed(2)}. Top selling product: ${topProducts[0]?.name || 'N/A'}. Total transactions: ${totalSalesCount}.`;
    const result = await analyzeSalesTrends(summary);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard Administrativo</h1>
        <button 
            onClick={handleAnalyze} 
            disabled={loadingAnalysis}
            className="mt-2 md:mt-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
            {loadingAnalysis ? "Analisando com IA..." : "Gerar Insights IA"}
        </button>
      </div>

      {analysis && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-indigo-800 text-sm">
            <h3 className="font-bold flex items-center gap-2 mb-1">
                ✨ Insights do Gemini
            </h3>
            <p>{analysis}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">Receita Total</p>
              <h3 className="text-2xl font-bold text-stone-800">R$ {totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">Vendas Realizadas</p>
              <h3 className="text-2xl font-bold text-stone-800">{totalSalesCount}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">Itens Vendidos</p>
              <h3 className="text-2xl font-bold text-stone-800">{totalItemsSold}</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">Alertas Estoque</p>
              <h3 className="text-2xl font-bold text-red-600">{lowStockItems.length}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Store Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Vendas por Loja</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByStore}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Top 5 Produtos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Alertas de Estoque Baixo (Global)
        </h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-sm">
                        <th className="py-2">Img</th>
                        <th className="py-2">Produto</th>
                        <th className="py-2">Loja</th>
                        <th className="py-2">Quantidade Atual</th>
                        <th className="py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {lowStockItems.length === 0 ? (
                        <tr><td colSpan={5} className="py-4 text-center text-stone-500">Nenhum alerta de estoque.</td></tr>
                    ) : (
                        lowStockItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50">
                                <td className="py-2">
                                     <div className="w-8 h-8 rounded overflow-hidden bg-stone-100 border border-stone-200">
                                        {item.product.imageUrl ? (
                                            <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <Leaf className="w-full h-full p-1 text-stone-300" />
                                        )}
                                     </div>
                                </td>
                                <td className="py-2 font-medium text-stone-700">{item.product.name}</td>
                                <td className="py-2 text-stone-600">{item.store.name}</td>
                                <td className="py-2 text-red-600 font-bold">{item.qty}</td>
                                <td className="py-2"><span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Crítico</span></td>
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