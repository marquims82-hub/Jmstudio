
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, DollarSign, Edit2, Search, Cake, LayoutGrid, 
  TrendingUp, Activity, Target, Zap, ArrowUpRight, 
  ChevronRight, CalendarDays, MessageSquare, Phone, CheckCircle2
} from 'lucide-react';
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
  const activeCount = students?.filter(s => s.status === StudentStatus.ATIVO).length || 0;
  const totalRevenue = students?.filter(s => s.status === StudentStatus.ATIVO).reduce((sum, s) => sum + (s.monthlyFee || 0), 0) || 0;
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Command Center</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> JM STUDIO PERSONAL • {MONTHS_LABELS[currentMonth]} {currentYear}
          </p>
        </div>

        {birthdayTodayStudents.length > 0 && (
          <div className="bg-gradient-to-r from-rose-600 to-indigo-600 rounded-[2rem] p-0.5 shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-950 rounded-[1.9rem] px-6 py-4 flex items-center gap-4">
              <div className="bg-rose-500 p-2.5 rounded-xl animate-bounce">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-[140px]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Niver Hoje!</p>
                <p className="text-white font-black text-sm truncate uppercase tracking-tighter">{birthdayTodayStudents[activeBirthdayIndex]?.name}</p>
              </div>
              <button 
                onClick={() => {
                  const s = birthdayTodayStudents[activeBirthdayIndex];
                  window.open(`https://wa.me/${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Parabéns, ' + s.name.split(' ')[0] + '! 🎉 Que seu dia seja incrível! 💪')}`, '_blank');
                }}
                className="p-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all active:scale-90"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><Users className="w-24 h-24 text-blue-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Base de Alunos</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">{activeCount}</h3>
            <span className="text-blue-500 font-bold text-xs mb-1 uppercase tracking-tighter">Ativos</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><LayoutGrid className="w-24 h-24 text-emerald-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Ocupação Turmas</p>
          <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">{occupancyRate}%</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Capacidade Otimizada</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><DollarSign className="w-24 h-24 text-blue-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Receita Recorrente</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">R$ {totalRevenue.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-emerald-500 mt-2">
             <TrendingUp className="w-3 h-3" />
             <span className="text-[10px] font-black uppercase tracking-widest">Saúde Financeira OK</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><Zap className="w-24 h-24 text-amber-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Status Operacional</p>
          <h3 className="text-4xl font-black text-amber-500 tracking-tighter">High</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Performance Máxima</p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700/50 shadow-inner">
            <button 
              onClick={() => setActiveTab('pendentes')} 
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'pendentes' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Target className="w-4 h-4" /> Pendentes ({pendingStudentsList.length})
            </button>
            <button 
              onClick={() => setActiveTab('pagos')} 
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'pagos' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <CheckCircle2 className="w-4 h-4" /> Pagos ({paidStudentsList.length})
            </button>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Localizar aluno..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold text-sm focus:border-blue-600 outline-none transition-all shadow-inner" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredList.map(student => (
            <div key={student.id} className="group relative bg-slate-950/40 border border-slate-800 rounded-[2.5rem] p-6 hover:border-blue-500/30 transition-all shadow-xl hover:shadow-blue-900/10 active:scale-[0.98]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-black text-xl shadow-lg">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h4 className="text-lg font-black text-white truncate uppercase tracking-tighter">{student.name}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">
                    <CalendarDays className="w-3 h-3" /> Vence dia {student.billingDay}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                 <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Turma</p>
                    <p className="text-xs font-bold text-white uppercase">{student.classTime}</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => onEditStudent && onEditStudent(student)}
                      className="p-3 bg-slate-900 hover:bg-blue-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + student.name.split(' ')[0] + '! 💪')}`, '_blank')}
                      className="p-3 bg-slate-900 hover:bg-emerald-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {activeTab === 'pendentes' && (
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
          ))}
          
          {filteredList.length === 0 && (
            <div className="col-span-full py-24 text-center text-slate-700 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-black uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
