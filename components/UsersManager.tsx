import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Trash2, Plus, User as UserIcon, Shield, Store, X } from 'lucide-react';

const UsersManager: React.FC = () => {
  const { users, stores, addUser, deleteUser } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: UserRole.SELLER,
    storeId: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.username || !formData.password) return;
    // Basic validation: Seller must have a store
    if (formData.role === UserRole.SELLER && !formData.storeId) {
      alert("Vendedores precisam estar vinculados a uma loja.");
      return;
    }

    addUser({
      id: `user_${Date.now()}`,
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      storeId: formData.role === UserRole.SELLER ? formData.storeId : undefined
    });
    
    setFormData({ name: '', username: '', password: '', role: UserRole.SELLER, storeId: '' });
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Gerenciar Usuários</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-semibold text-stone-600">Usuário</th>
              <th className="p-4 font-semibold text-stone-600">Login</th>
              <th className="p-4 font-semibold text-stone-600">Função</th>
              <th className="p-4 font-semibold text-stone-600">Loja Vinculada</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center mr-3 text-stone-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </td>
                <td className="p-4 text-stone-600">{user.username}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1
                    ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                      user.role === UserRole.SELLER ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-700'}`}>
                    {user.role === UserRole.ADMIN && <Shield className="w-3 h-3" />}
                    {user.role === UserRole.SELLER && <Store className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-stone-500">
                  {user.storeId ? stores.find(s => s.id === user.storeId)?.name || 'Loja removida' : '-'}
                </td>
                <td className="p-4 text-right">
                  {user.username !== 'admin' && ( // Prevent deleting main admin
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Novo Usuário</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Login</label>
                    <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
                    <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Função</label>
                <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                >
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.SELLER}>Vendedor</option>
                    <option value={UserRole.CLIENT}>Cliente</option>
                </select>
              </div>

              {formData.role === UserRole.SELLER && (
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Loja Vinculada</label>
                    <select 
                        value={formData.storeId} 
                        onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                        className="w-full border border-stone-300 rounded-lg p-2 outline-none"
                    >
                        <option value="">Selecione uma loja...</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
              )}

              <button 
                onClick={handleSave} 
                className="w-full mt-2 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 font-medium"
              >
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;