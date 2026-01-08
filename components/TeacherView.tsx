
import React, { useState } from 'react';
import { GraduationCap, Plus, Search, Mail, Phone, Calendar, DollarSign, Trash2, Edit2, X, Save, UserCheck, Briefcase } from 'lucide-react';
import { Teacher } from '../types';

interface TeacherViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

const TeacherView: React.FC<TeacherViewProps> = ({ teachers, onAddTeacher, onUpdateTeacher, onDeleteTeacher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    salary: '',
    hireDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      specialty: formData.specialty,
      phone: formData.phone,
      email: formData.email,
      salary: parseFloat(formData.salary),
      hireDate: new Date(formData.hireDate).toISOString()
    };

    if (editingTeacher) {
      onUpdateTeacher({ ...data, id: editingTeacher.id });
    } else {
      onAddTeacher(data);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      salary: '',
      hireDate: new Date().toISOString().split('T')[0]
    });
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      specialty: teacher.specialty,
      phone: teacher.phone,
      email: teacher.email,
      salary: teacher.salary.toString(),
      hireDate: teacher.hireDate.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayroll = teachers.reduce((sum, t) => sum + t.salary, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Equipe JM STUDIO</h2>
          <p className="text-slate-400">Gestão de professores e especialistas da academia.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Professor
        </button>
      </header>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total de Professores</p>
          </div>
          <h3 className="text-3xl font-black text-white">{teachers.length}</h3>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Folha Salarial</p>
          </div>
          <h3 className="text-3xl font-black text-emerald-500">R$ {totalPayroll.toLocaleString()}</h3>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Especialidades</p>
          </div>
          <h3 className="text-3xl font-black text-white">
            {new Set(teachers.map(t => t.specialty.toLowerCase())).size}
          </h3>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar professor por nome ou especialidade..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map(teacher => (
          <div key={teacher.id} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 group hover:border-indigo-500/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(teacher)} className="p-2 bg-slate-900/80 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDeleteTeacher(teacher.id)} className="p-2 bg-slate-900/80 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-2xl">
                {teacher.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{teacher.name}</h4>
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{teacher.specialty}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">{teacher.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Desde {new Date(teacher.hireDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Remuneração</p>
                <p className="text-lg font-black text-emerald-500">R$ {teacher.salary.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                Colaborador
              </div>
            </div>
          </div>
        ))}
        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600">
            <GraduationCap className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-bold">Nenhum professor encontrado</p>
            <p className="text-sm">Clique no botão "Novo Professor" para começar.</p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-500" />
                {editingTeacher ? 'Editar Professor' : 'Cadastrar Professor'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Ex: Prof. Ricardo Alves"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Especialidade</label>
                  <input 
                    type="text" required value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ex: Crossfit"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Salário (R$)</label>
                  <input 
                    type="number" required value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                  <input 
                    type="tel" required value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data de Contratação</label>
                  <input 
                    type="date" required value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                <input 
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="email@jmsstudiopersonal.com"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/10">
                  <Save className="w-5 h-5" />
                  {editingTeacher ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherView;
