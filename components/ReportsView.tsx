
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Target, Zap, Award } from 'lucide-react';
import { Student, StudentStatus, MONTHS_LABELS, Expense } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface ReportsViewProps {
  students: Student[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ students }) => {
  const currentMonth = new Date().getMonth();
  
  const expenses: Expense[] = useMemo(() => {
    const saved = localStorage.getItem('fitmanage_expenses');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Dados para Receita vs Despesas (Últimos 6 meses fictícios + atual)
  const financialData = useMemo(() => {
    return MONTHS_LABELS.map((label, index) => {
      if (index > currentMonth) return null;
      
      const revenue = students
        .filter(s => s.status === StudentStatus.ATIVO)
        .reduce((sum, s) => sum + s.monthlyFee, 0);
      
      const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === index)
        .reduce((sum, e) => sum + e.amount, 0);

      // Simulando meses passados para o gráfico ter dados
      const multiplier = 1 - ((currentMonth - index) * 0.05);
      return {
        name: label,
        receita: revenue * (index === currentMonth ? 1 : multiplier),
        despesas: (monthlyExpenses || 1500) * (index === currentMonth ? 1 : multiplier)
      };
    }).filter(d => d !== null);
  }, [students, expenses, currentMonth]);

  const activeCount = students.filter(s => s.status === StudentStatus.ATIVO).length;
  const growthRate = "+12.5%"; // Exemplo estático
  const averageTicket = activeCount > 0 
    ? (students.filter(s => s.status === StudentStatus.ATIVO).reduce((sum, s) => sum + s.monthlyFee, 0) / activeCount).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Relatórios Gerenciais</h2>
        <p className="text-slate-400">Análise de performance, crescimento e saúde financeira.</p>
      </header>

      {/* KPIs de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-20 h-20 text-emerald-500" />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Crescimento Mensal</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-white">{growthRate}</h3>
            <span className="flex items-center text-emerald-500 text-xs font-bold mb-1">
              <ArrowUpRight className="w-4 h-4" /> 2.1%
            </span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-20 h-20 text-blue-500" />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-white">R$ {averageTicket}</h3>
            <span className="flex items-center text-blue-500 text-xs font-bold mb-1">
              Fiel à meta
            </span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Award className="w-20 h-20 text-orange-500" />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Retenção de Alunos</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-white">94%</h3>
            <span className="flex items-center text-rose-500 text-xs font-bold mb-1">
              <ArrowDownRight className="w-4 h-4" /> 0.5%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Receita vs Despesas */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Fluxo de Caixa (Anual)
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

        {/* Gráfico de Crescimento de Base */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Evolução da Base
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
                <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" name="Crescimento" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Sugestões Estratégicas (IA Insight fake) */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 flex items-start gap-6">
        <div className="bg-blue-600 p-4 rounded-2xl">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h5 className="text-white font-bold text-lg mb-2">Insight Estratégico JM STUDIO</h5>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            Com base no seu ticket médio atual de <span className="text-blue-400 font-bold">R$ {averageTicket}</span> e na taxa de retenção de 94%, o sistema sugere o lançamento de um plano trimestral promocional para os horários de baixa ocupação (10:00 e 16:00), visando aumentar a ocupação dessas turmas que hoje operam com 40% da capacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
