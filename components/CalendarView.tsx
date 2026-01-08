
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Cake, DollarSign, Clock, Users, X, 
  Calendar as CalendarIcon, PartyPopper, Phone, AlertCircle, 
  CalendarClock, ArrowRight, User, Filter, CheckCircle2, Search,
  CreditCard, MessageSquare
} from 'lucide-react';
import { Student, MONTHS_LABELS, StudentStatus, CLASS_HOURS } from '../types';

interface CalendarViewProps {
  students: Student[];
}

type CalendarFilter = 'all' | 'birthdays' | 'payments';

const CalendarView: React.FC<CalendarViewProps> = ({ students }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<CalendarFilter>('all');

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(today.getDate());
  };

  const getEventsForDay = (day: number) => {
    const birthdays = students.filter(s => {
      if (!s.birthDate) return false;
      const bDate = new Date(s.birthDate);
      return bDate.getUTCDate() === day && bDate.getUTCMonth() === month;
    });

    const dueDates = students.filter(s => {
      // Usamos o billingDay para definir o vencimento mensal
      return s.billingDay === day && s.status === StudentStatus.ATIVO;
    });

    return { birthdays, dueDates };
  };

  const isWithinNext7Days = (day: number) => {
    const checkDate = new Date(year, month, day);
    const diffTime = checkDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const upcomingAlerts = useMemo(() => {
    const alerts: { student: Student; type: 'birthday' | 'due'; date: Date; diff: number }[] = [];
    
    students.forEach(s => {
      if (s.birthDate) {
        const b = new Date(s.birthDate);
        const thisYearBday = new Date(today.getFullYear(), b.getUTCMonth(), b.getUTCDate());
        const diffTime = thisYearBday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          alerts.push({ student: s, type: 'birthday', date: thisYearBday, diff: diffDays });
        }
      }

      if (s.status === StudentStatus.ATIVO) {
        const thisMonthDue = new Date(today.getFullYear(), today.getMonth(), s.billingDay);
        if (thisMonthDue.getTime() < today.setHours(0,0,0,0)) {
          thisMonthDue.setMonth(thisMonthDue.getMonth() + 1);
        }
        
        const diffTime = thisMonthDue.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          alerts.push({ student: s, type: 'due', date: thisMonthDue, diff: diffDays });
        }
      }
    });

    return alerts.sort((a, b) => a.diff - b.diff);
  }, [students, today]);

  const dayElements = [];
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  for (let i = 0; i < offset; i++) {
    dayElements.push(<div key={`empty-${i}`} className="h-20 md:h-28 bg-slate-900/10 border border-slate-800/30 rounded-2xl opacity-10" />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const { birthdays, dueDates } = getEventsForDay(day);
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    
    // Aplicar filtros visualmente
    const showBday = activeFilter === 'all' || activeFilter === 'birthdays';
    const showDue = activeFilter === 'all' || activeFilter === 'payments';

    dayElements.push(
      <div 
        key={day} 
        onClick={() => setSelectedDay(day)}
        className={`h-20 md:h-28 border rounded-[1.5rem] p-3 transition-all cursor-pointer group relative flex flex-col justify-between
          ${isToday ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20' : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-600 hover:bg-slate-800/40'}
        `}
      >
        <div className="flex justify-between items-start">
          <span className={`text-xs font-black ${isToday ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
            {day.toString().padStart(2, '0')}
          </span>
          <div className="flex gap-1">
            {showBday && birthdays.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />}
            {showDue && dueDates.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
          </div>
        </div>
        
        <div className="hidden md:flex flex-col gap-1 overflow-hidden">
          {showBday && birthdays.slice(0, 1).map(b => (
            <div key={b.id} className="text-[7px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-lg border border-rose-500/20 truncate font-black uppercase">
              🎂 {b.name.split(' ')[0]}
            </div>
          ))}
          {showDue && dueDates.slice(0, 1).map(d => (
            <div key={d.id} className="text-[7px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-lg border border-emerald-500/20 truncate font-black uppercase">
              💰 R$ {d.monthlyFee}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Agenda Inteligente</h2>
          <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            CONTROLE DE EVENTOS E MENSALIDADES
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtros */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-xl">
            {(['all', 'birthdays', 'payments'] as CalendarFilter[]).map((f) => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'Tudo' : f === 'birthdays' ? 'Nivers' : 'Mensais'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-4 text-center min-w-[120px]">
               <p className="text-white font-black text-xs uppercase tracking-widest">{MONTHS_LABELS[month]} {year}</p>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
          
          <button onClick={goToToday} className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Hoje</button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Lado Esquerdo: Alertas Próximos */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 blur-[50px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Próximos 7 Dias
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {upcomingAlerts.length === 0 ? (
                  <p className="text-slate-600 text-xs italic font-medium py-4">Nenhum evento próximo.</p>
                ) : (
                  upcomingAlerts.map(({ student, type, date, diff }, idx) => (
                    <div key={`${student.id}-${type}-${idx}`} className={`p-4 rounded-2xl border transition-all hover:border-slate-600 ${type === 'birthday' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${diff === 0 ? 'bg-white text-slate-900 animate-bounce' : 'bg-slate-800 text-slate-400'}`}>
                          {diff === 0 ? 'HOJE' : `EM ${diff} DIAS`}
                        </span>
                        {type === 'birthday' ? <Cake className="w-3.5 h-3.5 text-rose-500" /> : <DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-white font-bold text-sm truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{student.classTime}</p>
                      
                      <button 
                        onClick={() => {
                          const msg = type === 'birthday' ? `Parabéns ${student.name.split(' ')[0]}! 🎉` : `Olá ${student.name.split(' ')[0]}! Lembrete da mensalidade. 💪`;
                          window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-3 h-3" /> Contatar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Calendário Principal */}
        <div className="xl:col-span-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            <div className="grid grid-cols-7 gap-3 mb-6">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase text-slate-600 tracking-widest py-2">
                  {day}
                </div>
              ))}
              {dayElements}
            </div>
            
            <div className="flex flex-wrap gap-8 items-center justify-center mt-6 pt-6 border-t border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aniversários</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mensalidades</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Hoje</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Dia Selecionado */}
      {selectedDay && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-900/30 text-white font-black text-xl">
                  {selectedDay.toString().padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Eventos do Dia</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{MONTHS_LABELS[month]} {year}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"><X className="w-7 h-7" /></button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Seção Turmas do Dia */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><Users className="w-3.5 h-3.5" /> Turmas Previstas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CLASS_HOURS.map(h => {
                    const count = students.filter(s => s.classTime === h && s.status === StudentStatus.ATIVO).length;
                    return (
                      <div key={h} className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                         <span className="text-xs font-black text-slate-400">{h}</span>
                         <span className="text-sm font-black text-white">{count} <Users className="w-3 h-3 inline ml-1 opacity-30" /></span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Eventos Especiais */}
              <div className="space-y-6">
                {selectedDayEvents?.birthdays.length === 0 && selectedDayEvents?.dueDates.length === 0 ? (
                  <div className="py-10 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest bg-slate-950/30 rounded-[2rem] border border-slate-900">
                    Nenhum evento especial registrado para este dia.
                  </div>
                ) : (
                  <>
                    {selectedDayEvents?.birthdays.map(student => (
                      <div key={student.id} className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-[2rem] flex items-center gap-6 relative group overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-all"><PartyPopper className="w-24 h-24 text-rose-500" /></div>
                        <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-900/40">{student.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-lg font-black text-white">{student.name}</p>
                          <p className="text-xs font-bold text-rose-500 uppercase flex items-center gap-2 mt-1"><Cake className="w-3.5 h-3.5" /> Aniversariante!</p>
                        </div>
                        <button 
                          onClick={() => window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Parabéns, ' + student.name.split(' ')[0] + '! 🎉 Treino pago hoje? 💪')}`, '_blank')}
                          className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-2xl transition-all shadow-xl shadow-rose-900/30"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {selectedDayEvents?.dueDates.map(student => (
                      <div key={student.id} className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center gap-6 group overflow-hidden relative">
                         <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-all"><DollarSign className="w-24 h-24 text-emerald-500" /></div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-900/40">{student.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-lg font-black text-white">{student.name}</p>
                          <p className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2 mt-1"><CreditCard className="w-3.5 h-3.5" /> Vencimento de R$ {student.monthlyFee}</p>
                        </div>
                        <button 
                          onClick={() => window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + student.name.split(' ')[0] + '! Tudo bem? Lembrete da sua mensalidade do JM Studio. Bons treinos! 💪')}`, '_blank')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/30"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <div className="p-8 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button onClick={() => setSelectedDay(null)} className="bg-slate-800 hover:bg-slate-700 text-white font-black px-12 py-5 rounded-2xl uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95">Fechar Agenda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
