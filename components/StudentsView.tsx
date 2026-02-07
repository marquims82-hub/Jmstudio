
import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Phone, Calendar, Clock, CreditCard, User, Filter, MoreVertical, ShieldCheck, Mail, MessageSquare, UserX, UserCheck } from 'lucide-react';
import { Student, StudentStatus } from '../types';

interface StudentsViewProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (student: Student) => void;
}

const StudentsView: React.FC<StudentsViewProps> = ({ students, onEditStudent, onDeleteStudent, onUpdateStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'Todos'>('Todos');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm, statusFilter]);

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Olá ${name.split(' ')[0]}! Tudo bem? 💪`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleStatus = (student: Student) => {
    const newStatus = student.status === StudentStatus.ATIVO ? StudentStatus.INATIVO : StudentStatus.ATIVO;
    const action = newStatus === StudentStatus.INATIVO ? 'inativar' : 'reativar';
    
    if (confirm(`Deseja realmente ${action} o aluno ${student.name}?`)) {
      onUpdateStudent({
        ...student,
        status: newStatus
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Base de Alunos</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Gestão de cadastros e status</p>
        </div>
        
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          {['Todos', StudentStatus.ATIVO, StudentStatus.PENDENTE, StudentStatus.INATIVO].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {status === 'Todos' ? 'Tudo' : status}
            </button>
          ))}
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl pl-14 pr-6 py-5 text-white font-bold focus:border-blue-600 outline-none transition-all shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className={`bg-slate-900/60 border rounded-[2.5rem] p-8 group transition-all shadow-2xl relative overflow-hidden ${student.status === StudentStatus.INATIVO ? 'border-rose-900/20 grayscale-[0.5] opacity-80' : 'border-slate-800 hover:border-blue-500/30'}`}>
            <div className="absolute top-0 right-0 p-6 flex gap-2">
              <button 
                onClick={() => toggleStatus(student)}
                className={`p-3 rounded-xl transition-all shadow-lg active:scale-90 ${student.status === StudentStatus.ATIVO ? 'bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                title={student.status === StudentStatus.ATIVO ? "Inativar Aluno" : "Reativar Aluno"}
              >
                {student.status === StudentStatus.ATIVO ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => onEditStudent(student)}
                className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                title="Editar Cadastro"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDeleteStudent(student.id)}
                className="p-3 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                title="Excluir Aluno"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-5 mb-8">
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-2xl ${student.status === StudentStatus.ATIVO ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 pr-24">
                <h4 className={`text-xl font-black truncate uppercase tracking-tight ${student.status === StudentStatus.ATIVO ? 'text-white' : 'text-slate-500'}`}>{student.name}</h4>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase mt-2 ${
                  student.status === StudentStatus.ATIVO ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  student.status === StudentStatus.PENDENTE ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  <ShieldCheck className="w-3 h-3" /> {student.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">WhatsApp</p>
                <p className={`font-bold text-sm ${student.status === StudentStatus.ATIVO ? 'text-white' : 'text-slate-600'}`}>{student.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Horário</p>
                <p className={`font-bold text-sm uppercase ${student.status === StudentStatus.ATIVO ? 'text-blue-400' : 'text-slate-600'}`}>{student.classTime || 'Pendente'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mensalidade</p>
                <p className={`font-black text-sm ${student.status === StudentStatus.ATIVO ? 'text-white' : 'text-slate-600'}`}>R$ {student.monthlyFee.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Vencimento</p>
                <p className={`font-bold text-sm ${student.status === StudentStatus.ATIVO ? 'text-white' : 'text-slate-600'}`}>Todo dia {student.billingDay}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/50 flex gap-3">
              <button 
                onClick={() => handleWhatsApp(student.phone, student.name)}
                className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${student.status === StudentStatus.ATIVO ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                disabled={student.status === StudentStatus.INATIVO}
              >
                <MessageSquare className="w-4 h-4" /> Contato
              </button>
              <div className="bg-slate-950 px-4 py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                  Desde {new Date(student.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-600 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
            <User className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-xs">Nenhum aluno encontrado na base</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsView;
