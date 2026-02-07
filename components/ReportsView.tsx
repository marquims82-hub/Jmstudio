
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Users, ArrowUpRight, ArrowDownRight, 
  Target, Zap, Award, CreditCard, UserCheck, CalendarDays, 
  Printer, ChevronLeft, ChevronRight, Calendar, Search, FileText, X, Eye, ShieldCheck
} from 'lucide-react';
import { Student, StudentStatus, MONTHS_LABELS, Expense, PaymentRecord } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area
} from 'recharts';

interface ReportsViewProps {
  students: Student[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ students }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  
  const selectedMonth = viewDate.getMonth();
  const selectedYear = viewDate.getFullYear();
  
  const expenses: Expense[] = useMemo(() => {
    const saved = localStorage.getItem('fitmanage_expenses');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const paidStudentsInPeriod = useMemo(() => {
    return students.filter(s => 
      s.payments?.some(p => p.month === selectedMonth && p.year === selectedYear && p.status === 'paid')
    ).filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Ordena por data de pagamento (mais recente primeiro)
      const pA = a.payments?.find(p => p.month === selectedMonth && p.year === selectedYear);
      const pB = b.payments?.find(p => p.month === selectedMonth && p.year === selectedYear);
      if (pA?.paymentDate && pB?.paymentDate) {
        return new Date(pB.paymentDate).getTime() - new Date(pA.paymentDate).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [students, selectedMonth, selectedYear, searchTerm]);

  const totalCollectedInPeriod = useMemo(() => {
    return paidStudentsInPeriod.reduce((sum, s) => sum + s.monthlyFee, 0);
  }, [paidStudentsInPeriod]);

  const financialData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const revenue = students.reduce((sum, s) => {
        const paid = s.payments?.some(p => p.month === m && p.year === y && p.status === 'paid');
        return sum + (paid ? s.monthlyFee : 0);
      }, 0);

      const monthlyExpenses = expenses
        .filter(e => {
          const expDate = new Date(e.date);
          return expDate.getMonth() === m && expDate.getFullYear() === y;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      data.push({
        name: `${MONTHS_LABELS[m]}`,
        receita: revenue,
        despesas: monthlyExpenses
      });
    }
    return data;
  }, [students, expenses, selectedMonth, selectedYear]);

  const activeCount = students.filter(s => s.status === StudentStatus.ATIVO).length;
  const averageTicket = activeCount > 0 
    ? (students.filter(s => s.status === StudentStatus.ATIVO).reduce((sum, s) => sum + s.monthlyFee, 0) / activeCount).toFixed(2)
    : "0.00";

  const handlePrintPaidStudents = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const monthYear = `${MONTHS_LABELS[selectedMonth]} / ${selectedYear}`;
    
    let tableRows = paidStudentsInPeriod.map((s, index) => {
      const pRecord = s.payments?.find(p => p.month === selectedMonth && p.year === selectedYear);
      const pDate = pRecord?.paymentDate ? new Date(pRecord.paymentDate).toLocaleDateString('pt-BR') : 'N/A';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px;">${index + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px;">${s.name.toUpperCase()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; text-align: center;">${s.classTime || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; text-align: center;">${pDate}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right;">R$ ${s.monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Pagantes - ${monthYear}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 30px; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
            .header span { color: #3b82f6; font-weight: 900; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; background: #f8fafc; padding: 12px 10px; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .footer { margin-top: 40px; text-align: right; border-top: 2px solid #e2e8f0; padding-top: 20px; }
            .total-value { font-size: 20px; font-weight: 900; color: #10b981; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JM STUDIO <span>PERSONAL</span></h1>
            <p>Relatório de Alunos Pagantes - ${monthYear}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Aluno</th>
                <th style="text-align: center;">Turma</th>
                <th style="text-align: center;">Data Pagto</th>
                <th style="text-align: right;">Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Total Arrecadado no Período:</p>
            <div class="total-value">R$ ${totalCollectedInPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p style="font-size: 10px; color: #94a3b8; margin-top: 10px;">Emitido em: ${todayStr}</p>
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Inteligência Gerencial</h2>
          
          <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl w-fit">
            <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-6 text-center min-w-[150px]">
               <p className="text-white font-black text-xs uppercase tracking-widest">{MONTHS_LABELS[selectedMonth]} {selectedYear}</p>
            </div>
            <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
           >
             <FileText className="w-5 h-5" /> Abrir Relatório do Mês
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-20 h-20 text-emerald-500" />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Arrecadação do Período</p>
          <h3 className="text-3xl font-black text-emerald-500">R$ {totalCollectedInPeriod.toLocaleString()}</h3>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-20 h-20 text-blue-500" />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio Geral</p>
          <h3 className="text-3xl font-black text-white">R$ {averageTicket}</h3>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-20 h-20 text-indigo-500" />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Base Ativa Atual</p>
          <h3 className="text-3xl font-black text-indigo-500">{activeCount} Alunos</h3>
        </div>
      </div>

      {/* Seção de Visualização de Pagantes */}
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 md:p-10 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Visualizar Pagantes</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Lista detalhada de recebimentos em {MONTHS_LABELS[selectedMonth]} {selectedYear}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Filtrar nesta lista..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handlePrintPaidStudents}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all shadow-xl active:scale-95 text-[10px] font-black uppercase tracking-widest"
            >
              <Printer className="w-4 h-4" /> Imprimir Relatório
            </button>
          </div>
        </div>
        
        <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paidStudentsInPeriod.map(student => {
              const pRecord = student.payments?.find(p => p.month === selectedMonth && p.year === selectedYear);
              const pDateFormatted = pRecord?.paymentDate ? new Date(pRecord.paymentDate).toLocaleDateString() : 'N/A';

              return (
                <div key={student.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-[2rem] flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-black">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate uppercase">{student.name}</p>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{student.classTime}</span>
                        <span className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest flex items-center gap-1">
                          <CreditCard className="w-2.5 h-2.5" /> Pago
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-slate-600 font-black uppercase tracking-tighter">
                        <CalendarDays className="w-2.5 h-2.5" /> {pDateFormatted}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">R$ {student.monthlyFee.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {paidStudentsInPeriod.length === 0 && (
              <div className="col-span-full py-24 text-center bg-slate-800/10 rounded-3xl border-2 border-dashed border-slate-800">
                <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Nenhum pagamento localizado para este período.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Comparativo Financeiro (Últimos 6 Meses)
            </h4>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Bar dataKey="receita" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Receita" />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Curva de Recebimento
            </h4>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" name="Receita" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal do Relatório Digital */}
      {showReportModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] flex flex-col shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            
            <header className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Visualizador de Relatório</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{MONTHS_LABELS[selectedMonth]} {selectedYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrintPaidStudents}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir Agora
                </button>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="p-3 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-600 transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-100">
               {/* Simulação da Folha A4 */}
               <div className="bg-white mx-auto shadow-xl p-16 min-h-[1100px] max-w-[800px] border border-slate-200 rounded-sm">
                  <div className="text-center border-b-2 border-blue-600 pb-10 mb-10">
                     <h1 className="text-2xl font-black tracking-[0.2em] text-slate-900 uppercase">
                        JM STUDIO <span className="text-blue-600">PERSONAL</span>
                     </h1>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
                        Relatório de Recebimento Mensal
                     </p>
                  </div>

                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-10">
                    <span>Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
                    <span>Período: {MONTHS_LABELS[selectedMonth]} / {selectedYear}</span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200">#</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200">Aluno</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200 text-center">Horário</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200 text-center">Data Pagto</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 border-b-2 border-slate-200 text-right">Valor Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paidStudentsInPeriod.map((student, idx) => {
                        const pRec = student.payments?.find(p => p.month === selectedMonth && p.year === selectedYear);
                        const pDateStr = pRec?.paymentDate ? new Date(pRec.paymentDate).toLocaleDateString('pt-BR') : 'N/A';
                        
                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-4 text-xs font-black text-slate-800 uppercase">{student.name}</td>
                            <td className="p-4 text-xs font-bold text-slate-500 text-center">{student.classTime}</td>
                            <td className="p-4 text-xs font-bold text-slate-500 text-center">{pDateStr}</td>
                            <td className="p-4 text-xs font-black text-slate-900 text-right">R$ {student.monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {paidStudentsInPeriod.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl mt-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum dado localizado para este período.</p>
                    </div>
                  )}

                  <div className="mt-20 pt-10 border-t-2 border-slate-100 flex flex-col items-end">
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 min-w-[300px]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Arrecadado ({paidStudentsInPeriod.length} Alunos)</p>
                      <p className="text-4xl font-black text-emerald-600 tracking-tighter text-right">
                        R$ {totalCollectedInPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="mt-16 text-center w-full">
                       <div className="w-64 h-0.5 bg-slate-900 mx-auto mb-2"></div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Responsável Administrativo</p>
                    </div>
                  </div>

                  <div className="mt-32 flex justify-center opacity-20">
                    <div className="flex items-center gap-4 border-2 border-blue-600 px-6 py-2 rounded-full">
                       <ShieldCheck className="w-5 h-5 text-blue-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Sistema JM Studio v2.0</span>
                    </div>
                  </div>
               </div>
            </div>

            <footer className="p-6 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Este documento é uma representação digital da base de dados do JM Studio Personal.</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
