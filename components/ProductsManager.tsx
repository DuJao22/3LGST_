import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product, ProductCategory } from '../types';
import { Edit2, Trash2, Plus, X, Image as ImageIcon, Terminal } from 'lucide-react';

const ProductsManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: ProductCategory.HERB,
    weightUnit: '',
    price: 0,
    description: '',
    imageUrl: '',
    active: true
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: ProductCategory.HERB,
        weightUnit: '100g',
        price: 0,
        description: '',
        imageUrl: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingId) {
      updateProduct({ ...formData, id: editingId } as Product);
    } else {
      addProduct({ ...formData, id: `prod_${Date.now()}` } as Product);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
      if (window.confirm(`ATENÇÃO: Confirmar exclusão do produto "${name}"?\n\nIsso removerá este item do catálogo e zerará o estoque em TODAS as lojas.`)) {
          deleteProduct(id);
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-500 uppercase tracking-wider">Banco_de_Dados_Produtos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-900/30 text-green-400 border border-green-600 px-4 py-2 rounded-sm hover:bg-green-500 hover:text-black transition-all flex items-center font-mono text-xs uppercase"
        >
          <Plus className="w-4 h-4 mr-2" /> NOVA_ENTRADA
        </button>
      </div>

      <div className="bg-zinc-900 rounded-sm border border-green-900/30 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black border-b border-green-900">
            <tr>
              <th className="p-4 font-mono text-xs text-green-700 uppercase w-20">Ref</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Nome_Item</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Tipo</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Custo</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Unidade</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Estado</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase text-right">Comandos</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-green-900/10 hover:bg-green-900/10 transition-colors">
                <td className="p-4">
                  <div className="w-10 h-10 rounded-sm bg-black border border-green-900 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Terminal className="w-4 h-4 text-green-900" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-mono text-zinc-300 font-bold">{product.name}</td>
                <td className="p-4 text-zinc-500 font-mono text-xs">{product.category}</td>
                <td className="p-4 text-green-400 font-mono">R$ {product.price.toFixed(2)}</td>
                <td className="p-4 text-zinc-500 font-mono text-xs">{product.weightUnit}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${product.active ? 'bg-green-900/20 text-green-500 border-green-900' : 'bg-red-900/20 text-red-500 border-red-900'}`}>
                    {product.active ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(product)} className="text-blue-500 hover:text-blue-300">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="text-red-900 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-green-500 rounded-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 border-b border-green-900/50 pb-2">
               <h2 className="text-xl font-bold text-green-500 uppercase font-mono">{editingId ? 'Modificar Item' : 'Criar Item'}</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-zinc-500 hover:text-red-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Nome do Item</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono uppercase"
                  >
                    {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Unidade / Peso</label>
                   <input
                    type="text"
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">URL da Imagem</label>
                <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono text-xs"
                      placeholder="https://..."
                    />
                    {formData.imageUrl && (
                        <div className="w-10 h-10 rounded-sm border border-green-900 overflow-hidden flex-shrink-0 bg-black">
                             <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Descrição (Metadados)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded-sm bg-black border-green-900 focus:ring-green-500"
                />
                <label className="ml-2 text-xs font-bold text-green-700 uppercase">Item Ativo</label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-500 hover:text-white rounded-sm font-mono text-xs uppercase">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-700 text-black rounded-sm hover:bg-green-500 font-bold uppercase tracking-wider">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;