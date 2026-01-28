import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Trash2, Plus, User as UserIcon, Shield, Store, X, Terminal } from 'lucide-react';

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
    if (formData.role === UserRole.SELLER && !formData.storeId) {
      alert("ERRO: VENDEDOR NECESSITA DE UMA UNIDADE VINCULADA");
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
        <h1 className="text-2xl font-bold text-green-500 uppercase tracking-wider">Permissões_de_Usuário</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-900/30 text-green-400 border border-green-600 px-4 py-2 rounded-sm hover:bg-green-500 hover:text-black transition-all flex items-center font-mono text-xs uppercase"
        >
          <Plus className="w-4 h-4 mr-2" /> CRIAR_USUÁRIO
        </button>
      </div>

      <div className="bg-zinc-900 rounded-sm border border-green-900/30 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black border-b border-green-900">
            <tr>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Identidade</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Chave_Acesso</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Classe</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase">Unidade_Atribuída</th>
              <th className="p-4 font-mono text-xs text-green-700 uppercase text-right">Ops</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-green-900/10 hover:bg-green-900/10 transition-colors">
                <td className="p-4 flex items-center">
                  <div className="w-8 h-8 rounded-sm bg-black border border-green-900 flex items-center justify-center mr-3 text-green-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-zinc-300 font-mono">{user.name}</span>
                </td>
                <td className="p-4 text-zinc-500 font-mono">{user.username}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border
                    ${user.role === UserRole.ADMIN ? 'bg-purple-900/20 text-purple-400 border-purple-900' : 
                      user.role === UserRole.SELLER ? 'bg-blue-900/20 text-blue-400 border-blue-900' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {user.role === UserRole.ADMIN && <Shield className="w-3 h-3" />}
                    {user.role === UserRole.SELLER && <Store className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-zinc-500 font-mono text-xs">
                  {user.storeId ? stores.find(s => s.id === user.storeId)?.name || 'NÓ_DESCONHECIDO' : '-'}
                </td>
                <td className="p-4 text-right">
                  {user.username !== 'admin' && ( 
                    <button onClick={() => deleteUser(user.id)} className="text-red-900 hover:text-red-500">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-green-500 rounded-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-green-900/50 pb-2">
               <h2 className="text-xl font-bold text-green-500 uppercase font-mono">ADICIONAR NOVO OPERADOR</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-zinc-500 hover:text-red-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">NOME COMPLETO</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-green-700 mb-1 uppercase">ID DE ACESSO</label>
                    <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-green-700 mb-1 uppercase">SENHA</label>
                    <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">NÍVEL DE PERMISSÃO</label>
                <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono uppercase"
                >
                    <option value={UserRole.ADMIN}>Administrador (Root)</option>
                    <option value={UserRole.SELLER}>Vendedor (Operador de Nó)</option>
                    <option value={UserRole.CLIENT}>Cliente (Público)</option>
                </select>
              </div>

              {formData.role === UserRole.SELLER && (
                <div>
                    <label className="block text-xs font-bold text-green-700 mb-1 uppercase">VINCULAR UNIDADE</label>
                    <select 
                        value={formData.storeId} 
                        onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                        className="w-full bg-black border border-green-900 rounded-sm p-2 text-green-400 focus:border-green-500 outline-none font-mono uppercase"
                    >
                        <option value="">SELECIONAR UNIDADE...</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
              )}

              <button 
                onClick={handleSave} 
                className="w-full mt-4 bg-green-700 text-black py-2 rounded-sm hover:bg-green-500 font-bold uppercase tracking-wider"
              >
                REGISTRAR USUÁRIO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;