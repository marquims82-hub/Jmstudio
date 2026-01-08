
import React, { useState, useMemo, useRef } from 'react';
import { 
  DollarSign, ArrowUpCircle, ArrowDownCircle, Search, CheckCircle2, 
  AlertCircle, X, Plus, Receipt, Save, Paperclip, Eye, Download, 
  Trash2, Edit2, History, User, Users, Wallet, Calendar, 
  ChevronLeft, ChevronRight, Printer, FileText, TrendingUp, 
  TrendingDown, MessageSquare, ExternalLink
} from 'lucide-react';
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
  
  // Estado para navegação de data
  const [viewDate, setViewDate] = useState(new Date());
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

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

  // Adiciona handleEditExpense para preencher o formulário com os dados da despesa existente para edição
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

  // Adiciona handleDeleteExpense para remover uma despesa da lista e persistir a alteração
  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Excluir esta despesa permanentemente?')) {
      const updated = expenses.filter(ex => ex.id !== id);
      saveExpenses(updated);
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

  const currentMonthExpenses = useMemo(() => 
    expenses.filter(ex => {
      const d = new Date(ex.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
  , [expenses, currentMonth, currentYear]);

  const totalExpenses = useMemo(() => currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0), [currentMonthExpenses]);
  
  const pendingCount = students.filter(s => s.status === StudentStatus.ATIVO && !isPaid(s)).length;

  const handlePrintMonthlyReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const netProfit = totalRevenueActual - totalExpenses;
    const reportDate = `${MONTHS_LABELS[currentMonth]} / ${currentYear}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Financeiro - ${reportDate}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 800; color: #1e40af; }
            .stats { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .stat-value { font-size: 20px; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; font-size: 10px; background: #f1f5f9; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; }
            .positive { color: #10b981; }
            .negative { color: #f43f5e; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">JM STUDIO PERSONAL</div>
            <div style="font-size: 14px; font-weight: 600; color: #64748b;">FECHAMENTO FINANCEIRO - ${reportDate}</div>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Total Recebido</div>
              <div class="stat-value positive">R$ ${totalRevenueActual.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Despesas</div>
              <div class="stat-value negative">R$ ${totalExpenses.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Lucro Líquido</div>
              <div class="stat-value ${netProfit >= 0 ? 'positive' : 'negative'}">R$ ${netProfit.toLocaleString()}</div>
            </div>
          </div>

          <h3>Detalhamento de Despesas</h3>
          <table>
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr>
            </thead>
            <tbody>
              ${currentMonthExpenses.map(ex => `
                <tr>
                  <td>${new Date(ex.date).toLocaleDateString()}</td>
                  <td>${ex.description}</td>
                  <td>${ex.category}</td>
                  <td class="negative">R$ ${ex.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">Relatório gerado em ${new Date().toLocaleString()} • JM Studio Intelligence</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCategoryIcon = (category: Expense['category']) => {
    switch(category) {
      case 'aluguel': return '🏠';
      case 'energia': return '⚡';
      case 'manutencao': return '🛠️';
      case 'marketing': return '📣';
      default: return '📦';
    }
  };

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const occupancyRate = totalRevenuePotential > 0 ? (totalRevenueActual / totalRevenuePotential) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
      {/* Modais e Hidden Inputs mantidos conforme estrutura original */}
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && uploadingForStudentId && onUpdateStudent) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const student = students.find(s => s.id === uploadingForStudentId);
            if (student) {
              const payments = [...(student.payments || [])];
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

      {viewingReceipt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button onClick={() => setViewingReceipt(null)} className="absolute -top-16 right-0 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="w-8 h-8" /></button>
            <div className="bg-slate-900 p-2 rounded-[2rem] overflow-hidden max-h-[80vh] shadow-2xl border border-white/10">
              <img src={viewingReceipt} alt="Comprovante" className="max-w-full h-auto object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Fluxo de Caixa</h2>
          
          <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl w-fit">
            <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-6 text-center min-w-[150px]">
               <p className="text-white font-black text-xs uppercase tracking-widest">{MONTHS_LABELS[currentMonth]} {currentYear}</p>
            </div>
            <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button 
              onClick={() => setActiveTab('receitas')} 
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'receitas' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Receitas
            </button>
            <button 
              onClick={() => setActiveTab('despesas')} 
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'despesas' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Despesas
            </button>
          </div>

          <button 
            onClick={handlePrintMonthlyReport}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all shadow-xl active:scale-90"
            title="Gerar Relatório do Mês"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Dashboard de KPIs Aprimorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><TrendingUp className="w-24 h-24 text-emerald-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Faturamento Atual</p>
          <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">R$ {totalRevenueActual.toLocaleString()}</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500">
               <span>Meta Mensal</span>
               <span>{Math.round(occupancyRate)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(occupancyRate, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-rose-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><TrendingDown className="w-24 h-24 text-rose-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Despesas do Mês</p>
          <h3 className="text-4xl font-black text-rose-500 tracking-tighter">R$ {totalExpenses.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{currentMonthExpenses.length} REGISTROS</p>
        </div>

        <div className="bg-slate-900/60 border border-blue-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><Wallet className="w-24 h-24 text-blue-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Lucro Líquido</p>
          <h3 className={`text-4xl font-black tracking-tighter ${(totalRevenueActual - totalExpenses) >= 0 ? 'text-white' : 'text-rose-400'}`}>
            R$ {(totalRevenueActual - totalExpenses).toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">RESULTADO OPERACIONAL</p>
        </div>

        <div className="bg-slate-900/60 border border-orange-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-all"><AlertCircle className="w-24 h-24 text-orange-500" /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Pendências Ativas</p>
          <h3 className="text-4xl font-black text-orange-500 tracking-tighter">{pendingCount}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">ALUNOS NÃO RECEBIDOS</p>
        </div>
      </div>

      {activeTab === 'receitas' ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Gestão de Mensalidades</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Controle de recebimentos por aluno</p>
              </div>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar por nome do aluno..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold text-sm focus:border-blue-600 outline-none transition-all shadow-inner" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map(student => {
              const paid = isPaid(student);
              return (
                <div key={student.id} className={`p-6 rounded-[2.5rem] border transition-all group relative overflow-hidden ${paid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'}`}>
                   <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${paid ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black text-white truncate uppercase tracking-tight">{student.name}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{student.classTime}</p>
                      </div>
                      <button 
                        onClick={() => setHistoryStudent(student)}
                        className="p-3 bg-slate-800/50 text-slate-400 hover:text-white rounded-xl transition-all"
                      >
                        <History className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-950/40 rounded-2xl">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Valor</p>
                        <p className="text-white font-black">R$ {student.monthlyFee.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-slate-950/40 rounded-2xl">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Vencimento</p>
                        <p className="text-white font-black">Dia {student.billingDay}</p>
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <button 
                        onClick={() => handleTogglePayment(student)}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${paid ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/30'}`}
                      >
                        {paid ? <Trash2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {paid ? 'Remover' : 'Recebido'}
                      </button>
                      <button 
                        onClick={() => {
                          const msg = `Olá ${student.name.split(' ')[0]}! Lembrete da mensalidade de ${MONTHS_LABELS[currentMonth]} no JM Studio. 💪`;
                          window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all shadow-lg active:scale-90"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-rose-600 p-4 rounded-2xl shadow-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Lançamento de Despesas</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão de custos e investimentos</p>
              </div>
            </div>
            <button 
              onClick={() => setIsExpenseModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 uppercase text-[10px] tracking-widest active:scale-95"
            >
              <Plus className="w-5 h-5" /> Nova Despesa
            </button>
          </div>
          
          <div className="space-y-4">
            {currentMonthExpenses.map((exp) => (
              <div key={exp.id} className="bg-slate-950/40 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group hover:border-slate-600 transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                      {getCategoryIcon(exp.category)}
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">{exp.description}</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-2 py-0.5 bg-slate-800 rounded">{exp.category}</span>
                         <span className="text-[9px] font-bold text-slate-600">{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-8">
                   <p className="text-xl font-black text-rose-500">R$ {exp.amount.toLocaleString()}</p>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditExpense(exp)} className="p-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="p-3 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              </div>
            ))}
            {currentMonthExpenses.length === 0 && (
              <div className="py-24 text-center text-slate-600 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                <ArrowDownCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p className="font-black uppercase tracking-widest text-xs">Sem despesas para este período</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reuso do Modal de Histórico e Despesa com refinamentos visuais */}
      {historyStudent && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                  {historyStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{historyStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Histórico de Mensalidades</p>
                </div>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X className="w-7 h-7" /></button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
              {historyStudent.payments && historyStudent.payments.length > 0 ? (
                historyStudent.payments
                  .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))
                  .map((p, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-slate-700 transition-all group">
                      <div className="flex items-center gap-6">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-white font-black text-lg uppercase tracking-tight">{MONTHS_LABELS[p.month]} {p.year}</p>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-black uppercase tracking-widest">Pago</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {p.receipt ? (
                          <button onClick={() => setViewingReceipt(p.receipt!)} className="p-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg"><Eye className="w-5 h-5" /></button>
                        ) : (
                          <button onClick={() => { setUploadingForStudentId(historyStudent.id); fileInputRef.current?.click(); }} className="p-3 bg-slate-800 text-slate-400 hover:bg-blue-600 rounded-xl transition-all"><Paperclip className="w-5 h-5" /></button>
                        )}
                        <p className="text-xl font-black text-white">R$ {historyStudent.monthlyFee.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-20 flex flex-col items-center text-slate-600 opacity-20">
                  <History className="w-20 h-20 mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">Sem histórico registrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h3>
              <button onClick={closeExpenseModal} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleAddOrUpdateExpense} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">O que foi pago?</label>
                <input type="text" required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-blue-600 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Valor (R$)</label>
                  <input type="number" step="0.01" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-black text-lg focus:border-rose-600 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</label>
                  <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-blue-600 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-blue-600 outline-none appearance-none">
                  <option value="aluguel">🏠 Aluguel</option>
                  <option value="energia">⚡ Energia</option>
                  <option value="manutencao">🛠️ Manutenção</option>
                  <option value="marketing">📣 Marketing</option>
                  <option value="outros">📦 Outros</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-blue-900/40 uppercase text-xs tracking-widest active:scale-95">
                <Save className="w-5 h-5 inline mr-3" /> Salvar Despesa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialControl;
