
import React, { useState, useMemo, useRef } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Search, CheckCircle2, AlertCircle, X, Plus, Receipt, Save, Paperclip, Eye, Download, Trash2, Edit2, History, User, Users, Wallet, Calendar } from 'lucide-react';
import { Student, StudentStatus, MONTHS_LABELS, Expense, PaymentRecord } from '../types';

interface FinancialControlProps {
  students: Student[];
  onUpdateStudent?: (student: Student) => void;
}

const FinancialControl: React.FC<FinancialControlProps> = ({ students, onUpdateStudent }) => {
  const [activeTab, setActiveTab] = useState<'receitas' | 'despesas'>('receitas');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForStudentId, setUploadingForStudentId] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('fitmanage_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'outros' as Expense['category'],
    date: new Date().toISOString().split('T')[0]
  });

  const saveExpenses = (newExps: Expense[]) => {
    setExpenses(newExps);
    localStorage.setItem('fitmanage_expenses', JSON.stringify(newExps));
  };

  const handleAddOrUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      const updated = expenses.map(ex => ex.id === editingExpense.id ? { ...editingExpense, description: newExpense.description, amount: parseFloat(newExpense.amount), date: newExpense.date, category: newExpense.category } : ex);
      saveExpenses(updated);
    } else {
      const exp: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        category: newExpense.category
      };
      saveExpenses([...expenses, exp]);
    }
    closeExpenseModal();
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    setNewExpense({ description: '', amount: '', category: 'outros', date: new Date().toISOString().split('T')[0] });
  };

  const handleEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setNewExpense({
      description: exp.description,
      amount: exp.amount.toString(),
      category: exp.category,
      date: exp.date
    });
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("Deseja realmente excluir esta despesa?")) {
      saveExpenses(expenses.filter(ex => ex.id !== id));
    }
  };

  const isPaid = (student: Student) => {
    return student.payments?.some(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid');
  };

  const handleTogglePayment = (student: Student) => {
    if (!onUpdateStudent) return;
    const paid = isPaid(student);
    let newPayments = [...(student.payments || [])];

    if (paid) {
      if (!confirm(`Remover registro de pagamento de ${student.name} para ${MONTHS_LABELS[currentMonth]}?`)) return;
      newPayments = newPayments.filter(p => !(p.month === currentMonth && p.year === currentYear));
    } else {
      newPayments.push({ month: currentMonth, year: currentYear, status: 'paid' });
    }

    onUpdateStudent({
      ...student,
      payments: newPayments,
      status: !paid ? StudentStatus.ATIVO : student.status
    });
  };

  const filteredStudents = useMemo(() => 
    students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
  , [students, searchTerm]);

  const totalRevenueActual = useMemo(() => {
    return students.reduce((sum, s) => {
      const paidThisMonth = s.payments?.filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid') || [];
      return sum + (paidThisMonth.length > 0 ? s.monthlyFee : 0);
    }, 0);
  }, [students, currentMonth, currentYear]);

  const totalRevenuePotential = useMemo(() => 
    students.filter(s => s.status === StudentStatus.ATIVO).reduce((sum, s) => sum + s.monthlyFee, 0)
  , [students]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  
  const pendingCount = students.filter(s => s.status === StudentStatus.ATIVO && !isPaid(s)).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
      {/* Input File Oculto para Comprovantes no Histórico */}
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && uploadingForStudentId && onUpdateStudent) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const student = students.find(s => s.id === uploadingForStudentId);
            if (student) {
              const payments = [...(student.payments || [])];
              // Tenta encontrar pagamento do mês atual ou adiciona
              const pIdx = payments.findIndex(p => p.month === currentMonth && p.year === currentYear);
              if (pIdx > -1) {
                payments[pIdx].receipt = reader.result as string;
              } else {
                payments.push({ month: currentMonth, year: currentYear, status: 'paid', receipt: reader.result as string });
              }
              onUpdateStudent({ ...student, payments });
              setUploadingForStudentId(null);
            }
          };
          reader.readAsDataURL(file);
        }
      }} className="hidden" accept="image/*" />

      {/* Visualizador de Comprovante */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button onClick={() => setViewingReceipt(null)} className="absolute -top-16 right-0 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="w-8 h-8" /></button>
            <div className="bg-slate-900 p-2 rounded-[2rem] overflow-hidden max-h-[80vh] shadow-2xl border border-white/10">
              <img src={viewingReceipt} alt="Comprovante" className="max-w-full h-auto object-contain rounded-2xl" />
            </div>
            <p className="text-white font-bold mt-6 text-lg">Comprovante de Pagamento</p>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Fluxo de Caixa</h2>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">{MONTHS_LABELS[currentMonth]} / {currentYear}</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('receitas')} 
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'receitas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ArrowUpCircle className="w-4 h-4" /> Receitas
          </button>
          <button 
            onClick={() => setActiveTab('despesas')} 
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'despesas' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ArrowDownCircle className="w-4 h-4" /> Despesas
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Recebido (Mês)</p>
          <h3 className="text-3xl font-black text-emerald-500">R$ {totalRevenueActual.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Meta: R$ {totalRevenuePotential.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/60 border border-rose-500/20 rounded-3xl p-6 shadow-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Saídas Totais</p>
          <h3 className="text-3xl font-black text-rose-500">R$ {totalExpenses.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{expenses.length} registros ativos</p>
        </div>
        <div className="bg-slate-900/60 border border-blue-500/20 rounded-3xl p-6 shadow-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Líquido</p>
          <h3 className="text-3xl font-black text-white">R$ {(totalRevenueActual - totalExpenses).toLocaleString()}</h3>
          <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${Math.min((totalRevenueActual / (totalExpenses || 1)) * 50, 100)}%` }} />
          </div>
        </div>
        <div className="bg-slate-900/60 border border-orange-500/20 rounded-3xl p-6 shadow-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Inadimplência</p>
          <h3 className="text-3xl font-black text-orange-500">{pendingCount}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Alunos Pendentes</p>
        </div>
      </div>

      {activeTab === 'receitas' ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/10 p-3 rounded-2xl">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mensalidades de Alunos</h3>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar por nome do aluno..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-bold text-sm focus:border-blue-600 outline-none transition-all shadow-inner" 
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-6 py-5">Aluno</th>
                  <th className="px-6 py-5">Horário</th>
                  <th className="px-6 py-5">Vencimento</th>
                  <th className="px-6 py-5">Valor</th>
                  <th className="px-6 py-5">Status ({MONTHS_LABELS[currentMonth]})</th>
                  <th className="px-6 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredStudents.map(student => {
                  const paid = isPaid(student);
                  return (
                    <tr key={student.id} className="group hover:bg-slate-800/20 transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${paid ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-white font-bold">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400 font-bold text-sm uppercase">{student.classTime}</td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-800 px-3 py-1 rounded-lg text-slate-300 font-black text-xs">Dia {student.billingDay}</span>
                      </td>
                      <td className="px-6 py-5 text-white font-black">R$ {student.monthlyFee.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${paid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                          {paid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {paid ? 'Recebido' : 'Pendente'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleTogglePayment(student)}
                            className={`p-3 rounded-xl transition-all shadow-lg ${paid ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'}`}
                            title={paid ? "Estornar Pagamento" : "Confirmar Recebimento"}
                          >
                            {paid ? <Trash2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => setHistoryStudent(student)}
                            className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-slate-500"
                            title="Ver Histórico de Pagamentos"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="py-20 text-center text-slate-600 flex flex-col items-center">
                <Users className="w-16 h-16 opacity-10 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Nenhum aluno encontrado</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-rose-600/10 p-3 rounded-2xl">
                <Receipt className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Controle de Despesas</h3>
            </div>
            <button 
              onClick={() => setIsExpenseModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 uppercase text-xs tracking-widest active:scale-95"
            >
              <Plus className="w-5 h-5" /> Nova Despesa
            </button>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-6 py-5">Descrição</th>
                  <th className="px-6 py-5">Categoria</th>
                  <th className="px-6 py-5">Valor</th>
                  <th className="px-6 py-5">Vencimento</th>
                  <th className="px-6 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-slate-800/20 transition-all">
                    <td className="px-6 py-5 text-white font-bold">{exp.description}</td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded-lg uppercase text-[10px] font-black tracking-widest">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-rose-500 font-black">R$ {exp.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-slate-400 font-bold">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEditExpense(exp)} className="p-2.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteExpense(exp.id)} className="p-2.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="py-20 text-center text-slate-600 flex flex-col items-center">
                <ArrowDownCircle className="w-16 h-16 opacity-10 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Sem despesas registradas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Histórico de Pagamentos do Aluno */}
      {historyStudent && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/30">
                  {historyStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{historyStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Histórico de Mensalidades</p>
                </div>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
              {historyStudent.payments && historyStudent.payments.length > 0 ? (
                historyStudent.payments
                  .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))
                  .map((p, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between hover:border-slate-700 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-white font-black text-lg uppercase tracking-tight">{MONTHS_LABELS[p.month]} {p.year}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Pago</span>
                            {p.receipt && (
                               <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md font-black uppercase tracking-widest flex items-center gap-1">
                                 <Paperclip className="w-2.5 h-2.5" /> Comprovante
                               </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.receipt ? (
                          <button 
                            onClick={() => setViewingReceipt(p.receipt!)} 
                            className="p-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg"
                            title="Ver Comprovante"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setUploadingForStudentId(historyStudent.id); fileInputRef.current?.click(); }}
                            className="p-3 bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-slate-700"
                            title="Anexar Comprovante"
                          >
                            <Paperclip className="w-5 h-5" />
                          </button>
                        )}
                        <p className="text-xl font-black text-white ml-4">R$ {historyStudent.monthlyFee.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-20 flex flex-col items-center text-slate-600 opacity-20">
                  <History className="w-20 h-20 mb-4" />
                  <p className="font-black uppercase tracking-[0.3em] text-xs">Sem histórico registrado</p>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setHistoryStudent(null)} 
                className="bg-blue-600 text-white font-black px-12 py-4 rounded-2xl uppercase text-xs tracking-[0.2em] hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-900/30"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Despesa */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h3>
              <button onClick={closeExpenseModal} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all"><X /></button>
            </div>
            <form onSubmit={handleAddOrUpdateExpense} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">O que foi pago?</label>
                <input type="text" required placeholder="Ex: Conta de Luz" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-600 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input type="number" step="0.01" required placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black text-lg focus:border-rose-600 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                  <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-600 outline-none transition-all appearance-none">
                  <option value="aluguel">🏠 Aluguel</option>
                  <option value="energia">⚡ Energia</option>
                  <option value="manutencao">🛠️ Manutenção</option>
                  <option value="marketing">📣 Marketing</option>
                  <option value="outros">📦 Outros</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 uppercase text-xs tracking-widest active:scale-95 mt-4">
                <Save className="w-5 h-5" /> {editingExpense ? 'Salvar Alterações' : 'Salvar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialControl;
