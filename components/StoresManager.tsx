import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Store } from '../types';
import { Trash2, Plus, MapPin, Store as StoreIcon, X } from 'lucide-react';

const StoresManager: React.FC = () => {
  const { stores, addStore, deleteStore } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });

  const handleSave = () => {
    if (!formData.name || !formData.location) return;
    addStore({
      id: `store_${Date.now()}`,
      name: formData.name,
      location: formData.location
    });
    setFormData({ name: '', location: '' });
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Gerenciar Lojas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Loja
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-stone-100 rounded-lg text-stone-600">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-800">{store.name}</h3>
                  <p className="text-xs text-stone-400">ID: {store.id}</p>
                </div>
              </div>
              <div className="flex items-center text-stone-500 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                {store.location}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => deleteStore(store.id)}
                className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remover Loja
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Nova Loja</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Filial Centro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Endereço / Localização</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>
              <button 
                onClick={handleSave} 
                className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 font-medium"
              >
                Cadastrar Loja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresManager;