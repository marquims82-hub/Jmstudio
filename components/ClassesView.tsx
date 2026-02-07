
import React, { useState } from 'react';
import { Clock, Users, ChevronRight, User, AlertCircle, TrendingUp, X, Phone, ShieldCheck, Cake, Info, CheckCircle2, AlertTriangle, Ban, Sparkles, Zap, Edit2, UserMinus, RefreshCw, Trash2 } from 'lucide-react';
import { Student, CLASS_HOURS, StudentStatus } from '../types';

interface ClassesViewProps {
  students: Student[];
  onEditStudent?: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
}

const ClassesView: React.FC<ClassesViewProps> = ({ students, onEditStudent, onUpdateStudent }) => {
  const [selectedClassTime, setSelectedClassTime] = useState<string | null>(null);
  const CAPACITY = 12;

  const getAvailabilityStatus = (count: number) => {
    const slots = CAPACITY - count;
    const occupancy = (count / CAPACITY) * 100;
    if (slots <= 0) return { label: 'TURMA ESGOTADA', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', icon: Ban, critical: true, barColor: 'bg-rose-500' };
    if (occupancy >= 80) return { label: 'VAGAS LIMITADAS', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', icon: AlertTriangle, critical: true, barColor: 'bg-amber-500' };
    return { label: `${slots} VAGAS LIVRES`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2, critical: false, barColor: 'bg-emerald-500' };
  };

  const handleRemoveFromClass = (student: Student) => {
    if (!onUpdateStudent) return;

    const confirmacao = window.confirm(
      `CONFIRMAR REMOÇÃO:\n\nDeseja realmente remover o aluno "${student.name}" da turma das ${student.classTime}?\n\nO aluno continuará cadastrado no sistema, mas ficará com status "Pendente" até que você escolha um novo horário para ele.`
    );
    
    if (confirmacao) {
      const updatedStudent: Student = { 
        ...student, 
        classTime: '', 
        status: StudentStatus.PENDENTE 
      };
      
      onUpdateStudent(updatedStudent);
    }
  };

  // APENAS ALUNOS ATIVOS CONTAM PARA OCUPAÇÃO E APARECEM NAS TURMAS
  const activeStudents = students.filter(s => s.status === StudentStatus.ATIVO);
  
  const totalCapacity = CLASS_HOURS.length * CAPACITY;
  const totalOccupied = activeStudents.filter(s => s.classTime && s.classTime !== '').length;
  const totalFree = totalCapacity - totalOccupied;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Turmas e Horários</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Gestão de ocupação estratégica (Ativos).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900/80 p-5 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col items-center justify-center min-w-[140px]">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Total Livre</p>
            <p className="text-2xl font-black text-emerald-500 tracking-tighter">{totalFree}</p>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col items-center justify-center min-w-[140px]">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Ocupação Global</p>
            <p className="text-2xl font-black text-blue-500 tracking-tighter">{Math.round((totalOccupied / (totalCapacity || 1)) * 100)}%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CLASS_HOURS.map((hour) => {
          // Filtra apenas os ativos para este horário
          const studentsInHour = activeStudents.filter(s => s.classTime === hour);
          const occupancyPercentage = Math.round((studentsInHour.length / CAPACITY) * 100);
          const status = getAvailabilityStatus(studentsInHour.length);
          
          return (
            <div key={hour} className={`bg-slate-900/60 border rounded-[3rem] p-7 hover:border-slate-600 transition-all flex flex-col shadow-2xl h-[520px] group ${status.critical ? 'border-amber-500/20 shadow-amber-900/5' : 'border-slate-800'}`}>
              <div className={`mb-6 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                <status.icon className="w-4 h-4" /> {status.label}
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-blue-500 shadow-inner"><Clock className="w-6 h-6" /></div>
                  <div>
                    <span className="text-3xl font-black text-white tracking-tighter">{hour}</span>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Horário Fixado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white tracking-tighter">{occupancyPercentage}%</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">Ocupado</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <span>Alunos: {studentsInHour.length}</span>
                  <span>Meta: {CAPACITY}</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                  <div 
                    className={`h-full ${status.barColor} transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.5)]`} 
                    style={{ width: `${Math.min(occupancyPercentage, 100)}%` }} 
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
                {studentsInHour.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-2xl border bg-slate-950/40 border-slate-800/60 group/item hover:bg-slate-800 hover:border-slate-700 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-[11px] font-black shadow-lg">
                      {student.name.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-slate-300 truncate flex-1 uppercase tracking-tight">{student.name}</p>
                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditStudent?.(student); }} 
                        className="p-2 text-blue-500/70 hover:text-blue-500 bg-blue-500/5 rounded-lg border border-blue-500/10" 
                        title="Trocar de Turma"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {studentsInHour.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                    <Users className="w-16 h-16 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Turma Vazia</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedClassTime(hour)} 
                className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] border text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 border-slate-800 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg"
              >
                Gerenciar Painel <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {selectedClassTime && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-900/30">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Painel da Turma {selectedClassTime}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Gestão focal de alunos ativos</p>
                </div>
              </div>
              <button onClick={() => setSelectedClassTime(null)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"><X className="w-8 h-8" /></button>
            </div>
            <div className="p-10 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
              {activeStudents.filter(s => s.classTime === selectedClassTime).length === 0 ? (
                <div className="py-20 text-center text-slate-700 font-black uppercase text-[11px] tracking-[0.5em]">Nenhum aluno ativo alocado.</div>
              ) : (
                activeStudents.filter(s => s.classTime === selectedClassTime).map(student => (
                  <div key={student.id} className="bg-slate-950/50 border border-slate-800 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-slate-700 transition-all animate-in slide-in-from-left duration-300 shadow-lg">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-black text-2xl shadow-inner">{student.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-black text-white truncate uppercase tracking-tight">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Phone className="w-3.5 h-3.5 text-blue-500/50" /> {student.phone}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { onEditStudent?.(student); setSelectedClassTime(null); }}
                        className="p-5 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-blue-900/30 active:scale-90"
                        title="Trocar de Turma"
                      >
                        <RefreshCw className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase hidden md:inline tracking-widest">Trocar</span>
                      </button>
                      <button 
                        onClick={() => handleRemoveFromClass(student)}
                        className="p-5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl transition-all flex items-center gap-2 border border-rose-500/20 active:scale-90 shadow-lg"
                        title="Remover da Turma"
                      >
                        <UserMinus className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase hidden md:inline tracking-widest">Remover</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-10 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button onClick={() => setSelectedClassTime(null)} className="bg-slate-800 hover:bg-slate-700 text-white font-black px-14 py-5 rounded-[1.5rem] uppercase text-[11px] tracking-[0.3em] transition-all active:scale-95 shadow-xl">Fechar Painel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesView;
