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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`ATENÇÃO: Você tem certeza que deseja deletar a unidade "${name}"?\n\nIsso apagará todo o estoque vinculado a esta loja e desvinculará os vendedores.`)) {
      deleteStore(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-500 uppercase tracking-wider">Gestão_de_Unidades</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-900/30 text-green-400 border border-green-600 px-4 py-2 rounded-sm hover:bg-green-500 hover:text-black transition-all flex items-center font-mono text-xs uppercase"
        >
          <Plus className="w-4 h-4 mr-2" /> ADD_UNIDADE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="bg-zinc-900 p-6 rounded-sm border border-green-900/30 flex flex-col justify-between hover:border-green-500 transition-colors group">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-black border border-green-900 rounded-sm text-green-600 group-hover:text-green-400">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-400 font-mono uppercase">{store.name}</h3>
                  <p className="text-[10px] text-zinc-600 font-mono">ID: {store.id}</p>
                </div>
              </div>
              <div className="flex items-center text-zinc-400 text-xs mb-4 font-mono">
                <MapPin className="w-4 h-4 mr-2 text-green-700" />
                {store.location}
              </div>
            </div>
            <div className="pt-4 border-t border-green-900/30 flex justify-end">
              <button 
                onClick={() => handleDelete(store.id, store.name)}
                className="text-red-900 hover:text-red-500 flex items-center text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Encerrar_Nó
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-green-500 rounded-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-green-900/50 pb-2">
               <h2 className="text-xl font-bold text-green-500 uppercase font-mono">Nova Unidade</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-zinc-500 hover:text-red-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Identificador (Nome)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                  placeholder="EX: MATRIZ CENTRAL"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Coordenadas Físicas (Endereço)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                  placeholder="EX: RUA SETOR 7"
                />
              </div>
              <button 
                onClick={handleSave} 
                className="w-full bg-green-700 text-black py-2 rounded-sm hover:bg-green-500 font-bold uppercase tracking-wider mt-4"
              >
                Implantar Unidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresManager;