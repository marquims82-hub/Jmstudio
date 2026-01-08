
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
    if (slots <= 0) return { label: 'TURMA ESGOTADA', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', icon: Ban, critical: true };
    if (occupancy >= 80) return { label: 'VAGAS LIMITADAS', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', icon: AlertTriangle, critical: true };
    return { label: `${slots} VAGAS LIVRES`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2, critical: false };
  };

  const handleRemoveFromClass = (student: Student) => {
    if (!onUpdateStudent) return;

    // CONFIRMAÇÃO SOLICITADA PELO USUÁRIO
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

  const totalCapacity = CLASS_HOURS.length * CAPACITY;
  const totalOccupied = students.filter(s => s.classTime && s.classTime !== '').length;
  const totalFree = totalCapacity - totalOccupied;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Turmas e Horários</h2>
          <p className="text-slate-400">Gerenciamento de ocupação e presença por horário.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Vagas Livres</p>
            <p className="text-lg font-black text-white">{totalFree}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ocupação Geral</p>
            <p className="text-lg font-black text-white">{Math.round((totalOccupied / (totalCapacity || 1)) * 100)}%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CLASS_HOURS.map((hour) => {
          const studentsInHour = students.filter(s => s.classTime === hour);
          const status = getAvailabilityStatus(studentsInHour.length);
          const occupancyPercentage = (studentsInHour.length / CAPACITY) * 100;
          
          return (
            <div key={hour} className={`bg-slate-900/60 border rounded-[2.5rem] p-6 hover:border-slate-600 transition-all flex flex-col shadow-2xl h-[480px] ${status.critical ? 'border-amber-500/20' : 'border-slate-800'}`}>
              <div className={`mb-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest ${status.color}`}>
                <status.icon className="w-4 h-4" /> {status.label}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-blue-500"><Clock className="w-5 h-5" /></div>
                  <span className="text-2xl font-black text-white tracking-tighter">{hour}</span>
                </div>
                <p className="text-sm font-black text-white">{studentsInHour.length} <span className="text-slate-600 text-xs">/ {CAPACITY}</span></p>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-6 border border-slate-800/50">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min(occupancyPercentage, 100)}%` }} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
                {studentsInHour.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-2.5 rounded-xl border bg-slate-950/40 border-slate-800/60 group hover:bg-slate-900 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center text-[10px] font-black">{student.name.charAt(0)}</div>
                    <p className="text-xs font-bold text-slate-300 truncate flex-1">{student.name}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditStudent?.(student); }} 
                        className="p-1.5 text-blue-500/70 hover:text-blue-500" 
                        title="Trocar de Turma"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {studentsInHour.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <Users className="w-12 h-12 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Vazia</p>
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedClassTime(hour)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800 flex items-center justify-center gap-3 mt-auto transition-colors">
                Gerenciar Alunos <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {selectedClassTime && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">Turma das {selectedClassTime}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gerencie os alunos deste horário</p>
              </div>
              <button onClick={() => setSelectedClassTime(null)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
              {students.filter(s => s.classTime === selectedClassTime).length === 0 ? (
                <div className="py-10 text-center text-slate-500 italic">Esta turma está vazia.</div>
              ) : (
                students.filter(s => s.classTime === selectedClassTime).map(student => (
                  <div key={student.id} className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl flex items-center gap-5 group hover:border-slate-700 transition-all animate-in slide-in-from-left duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black text-lg">{student.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-white truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{student.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { onEditStudent?.(student); setSelectedClassTime(null); }}
                        className="p-4 bg-blue-600 text-white hover:bg-blue-500 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-90"
                        title="Trocar de Turma"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase hidden md:inline">Trocar</span>
                      </button>
                      <button 
                        onClick={() => handleRemoveFromClass(student)}
                        className="p-4 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all flex items-center gap-2 border border-rose-500/30 active:scale-90"
                        title="Remover da Turma"
                      >
                        <UserMinus className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase hidden md:inline">Remover</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-8 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button onClick={() => setSelectedClassTime(null)} className="bg-slate-800 text-white font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-700 transition-all active:scale-95">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesView;
