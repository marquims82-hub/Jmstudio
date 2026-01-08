
import React, { useState, useMemo } from 'react';
import { Search, CreditCard, CheckCircle2, MessageSquare, Edit2 } from 'lucide-react';
import { Student, StudentStatus, MONTHS_LABELS } from '../types';

interface PaymentsViewProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
}

const PaymentsView: React.FC<PaymentsViewProps> = ({ students, onUpdateStudent, onEditStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isPaid = (student: Student) => {
    return student.payments?.some(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid');
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const paid = isPaid(s);
      if (filter === 'pendentes') return matchesSearch && !paid && s.status === StudentStatus.ATIVO;
      if (filter === 'pagos') return matchesSearch && paid;
      return matchesSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm, filter]);

  const togglePayment = (student: Student) => {
    const paid = isPaid(student);
    let newPayments = [...(student.payments || [])];

    if (paid) {
      newPayments = newPayments.filter(p => !(p.month === currentMonth && p.year === currentYear));
    } else {
      newPayments.push({ month: currentMonth, year: currentYear, status: 'paid' });
    }

    // O status do aluno permanece o mesmo ao registrar pagamento (geralmente ATIVO)
    onUpdateStudent({
      ...student,
      payments: newPayments
    });
  };

  const handleWhatsApp = (student: Student) => {
    const paid = isPaid(student);
    const message = paid 
      ? `Olá ${student.name.split(' ')[0]}! Confirmamos o recebimento da sua mensalidade de ${MONTHS_LABELS[currentMonth]}. Obrigado! 💪`
      : `Olá ${student.name.split(' ')[0]}! Passando para lembrar do vencimento da sua mensalidade de ${MONTHS_LABELS[currentMonth]}. Bons treinos! 💪`;
    window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Pagamentos</h2>
          <p className="text-slate-400">{MONTHS_LABELS[currentMonth]} / {currentYear}</p>
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          <button onClick={() => setFilter('todos')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === 'todos' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Todos</button>
          <button onClick={() => setFilter('pendentes')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === 'pendentes' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>Pendentes</button>
          <button onClick={() => setFilter('pagos')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === 'pagos' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Pagos</button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-3xl pl-12 pr-6 py-5 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const paid = isPaid(student);
          return (
            <div key={student.id} className={`bg-slate-900/60 border rounded-[2.5rem] p-6 transition-all flex flex-col shadow-2xl relative ${paid ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800'}`}>
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${paid ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{student.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-white truncate">{student.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase">{student.classTime}</p>
                </div>
                {onEditStudent && (
                  <button onClick={() => onEditStudent(student)} className="p-2 text-slate-600 hover:text-white bg-slate-800/50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                )}
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-4 bg-slate-950/40 rounded-2xl">
                  <span className="text-xs text-slate-500 font-bold uppercase">Valor</span>
                  <span className="text-lg font-black text-white">R$ {student.monthlyFee}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button onClick={() => togglePayment(student)} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${paid ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-blue-600 text-white'}`}>
                  {paid ? 'PAGO' : 'PAGAR'}
                </button>
                <button onClick={() => handleWhatsApp(student)} className="py-4 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 font-black text-[10px] uppercase flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> AVISAR
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentsView;
