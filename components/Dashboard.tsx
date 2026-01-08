import React, { useState, useEffect, useMemo } from 'react';
import { Users, DollarSign, Edit2, Search, Cake, LayoutGrid } from 'lucide-react';
import { Student, StudentStatus, AppSection, CLASS_HOURS, MONTHS_LABELS } from '../types';

interface DashboardProps {
  students: Student[];
  setActiveSection?: (section: AppSection) => void;
  onUpdateStudent?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students = [], setActiveSection, onUpdateStudent, onEditStudent, onDeleteStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBirthdayIndex, setActiveBirthdayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'pagos'>('pendentes');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const CAPACITY_PER_CLASS = 12;
  const totalCapacity = (CLASS_HOURS?.length || 0) * CAPACITY_PER_CLASS;
  const totalRevenue = students?.reduce((sum, s) => sum + (s.monthlyFee || 0), 0) || 0;
  const activeCount = students?.filter(s => s.status === StudentStatus.ATIVO).length || 0;
  const availableSpots = Math.max(0, totalCapacity - activeCount);
  const occupancyRate = totalCapacity > 0 ? Math.round((activeCount / totalCapacity) * 100) : 0;
  
  const hasPaidCurrentMonth = (student: Student) => {
    return student.payments?.some(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid');
  };

  const paidStudentsList = useMemo(() => students?.filter(s => s.status === StudentStatus.ATIVO && hasPaidCurrentMonth(s)) || [], [students, currentMonth, currentYear]);
  const pendingStudentsList = useMemo(() => students?.filter(s => s.status === StudentStatus.ATIVO && !hasPaidCurrentMonth(s)) || [], [students, currentMonth, currentYear]);

  const birthdayTodayStudents = useMemo(() => students?.filter(s => {
    if (!s.birthDate) return false;
    const today = new Date();
    const birth = new Date(s.birthDate);
    return today.getDate() === birth.getUTCDate() && today.getMonth() === birth.getUTCMonth();
  }) || [], [students]);

  useEffect(() => {
    if (birthdayTodayStudents.length > 1) {
      const interval = setInterval(() => {
        setActiveBirthdayIndex((prev) => (prev + 1) % birthdayTodayStudents.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [birthdayTodayStudents]);

  const filteredList = (activeTab === 'pendentes' ? pendingStudentsList : paidStudentsList)
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Painel de Gestão</h2>
        <p className="text-slate-400">JM STUDIO PERSONAL • {MONTHS_LABELS[currentMonth]} / {currentYear}</p>
      </header>

      {birthdayTodayStudents.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600/40 to-purple-600/40 border border-rose-500/50 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md"><Cake className="w-8 h-8 text-white animate-bounce" /></div>
            <div className="flex-1">
              <h4 className="text-white font-black text-xl tracking-tighter uppercase">Aniversário Hoje! 🎉</h4>
              <p className="text-rose-100 text-sm font-bold truncate">{birthdayTodayStudents[activeBirthdayIndex]?.name}</p>
              <button onClick={() => {
                const s = birthdayTodayStudents[activeBirthdayIndex];
                window.open(`https://wa.me/${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Parabéns! 🎉')}`, '_blank');
              }} className="mt-3 bg-white text-rose-600 font-black px-4 py-2 rounded-xl text-xs">PARABENIZAR</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <Users className="w-6 h-6 text-blue-500 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Alunos Ativos</p>
          <h3 className="text-3xl font-black text-white">{activeCount}</h3>
          <div className="mt-4 h-1.5 w-full bg-slate-900 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${occupancyRate}%` }} /></div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <LayoutGrid className="w-6 h-6 text-emerald-500 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Vagas Disponíveis</p>
          <h3 className="text-3xl font-black text-emerald-500">{availableSpots}</h3>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <DollarSign className="w-6 h-6 text-green-500 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Receita Estimada</p>
          <h3 className="text-3xl font-black text-white">R$ {totalRevenue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex bg-slate-800 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('pendentes')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'pendentes' ? 'bg-orange-600 text-white' : 'text-slate-500'}`}>Pendentes</button>
            <button onClick={() => setActiveTab('pagos')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'pagos' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Pagos</button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-white w-full text-sm outline-none focus:border-blue-600 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map(student => (
            <div key={student.id} className="group flex items-center gap-4 p-5 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black">{student.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{student.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{student.classTime}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEditStudent && onEditStudent(student)} 
                  className="p-3 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-blue-600 rounded-xl transition-all"
                  title="Editar Cadastro Completo"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-600 italic text-sm">
              Nenhum aluno encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;