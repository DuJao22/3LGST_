import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product, ProductCategory } from '../types';
import { Edit2, Trash2, Plus, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService';

const ProductsManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);

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

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
        alert("Preencha o nome e categoria primeiro.");
        return;
    }
    setGeneratingDesc(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setGeneratingDesc(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Gerenciar Produtos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-semibold text-stone-600 w-20">Img</th>
              <th className="p-4 font-semibold text-stone-600">Nome</th>
              <th className="p-4 font-semibold text-stone-600">Categoria</th>
              <th className="p-4 font-semibold text-stone-600">Preço</th>
              <th className="p-4 font-semibold text-stone-600">Unidade</th>
              <th className="p-4 font-semibold text-stone-600">Status</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="p-4">
                  <div className="w-10 h-10 rounded bg-stone-100 overflow-hidden flex items-center justify-center border border-stone-200">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-stone-500">{product.category}</td>
                <td className="p-4">R$ {product.price.toFixed(2)}</td>
                <td className="p-4 text-stone-500">{product.weightUnit}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                  >
                    {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Unidade / Peso</label>
                   <input
                    type="text"
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">URL da Imagem</label>
                <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                      placeholder="https://..."
                    />
                    {formData.imageUrl && (
                        <div className="w-10 h-10 rounded border border-stone-200 overflow-hidden flex-shrink-0 bg-stone-100">
                             <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-stone-700">Descrição</label>
                    <button 
                        onClick={handleGenerateDescription}
                        disabled={generatingDesc}
                        className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                        <Sparkles className="w-3 h-3 mr-1" /> {generatingDesc ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <label className="ml-2 text-sm text-stone-700">Produto Ativo</label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;