
import React from 'react';
import { LayoutDashboard, UserPlus, Users, DollarSign, Dumbbell, Calendar, GraduationCap, LogOut, Weight, Database, BarChart3, CreditCard, DownloadCloud, Contact } from 'lucide-react';
import { AppSection } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  canInstall?: boolean;
  onInstall?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onLogout, isOpen, canInstall, onInstall }) => {
  const menuItems = [
    { id: AppSection.DASHBOARD, label: 'Painel', icon: LayoutDashboard },
    { id: AppSection.CADASTRO, label: 'Novo Aluno', icon: UserPlus },
    { id: AppSection.ALUNOS, label: 'Alunos', icon: Contact },
    { id: AppSection.TURMAS, label: 'Turmas', icon: Users },
    { id: AppSection.PAGAMENTOS, label: 'Pagamentos', icon: CreditCard },
    { id: AppSection.PROFESSORES, label: 'Professores', icon: GraduationCap },
    { id: AppSection.CALENDARIO, label: 'Calendário', icon: Calendar },
    { id: AppSection.FINANCEIRO, label: 'Financeiro', icon: DollarSign },
    { id: AppSection.TREINO, label: 'Treinos', icon: Dumbbell },
    { id: AppSection.RELATORIOS, label: 'Relatórios', icon: BarChart3 },
    { id: AppSection.CONFIGURACAO, label: 'Sistema', icon: Database },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-[180] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col items-center gap-1 mb-8">
        <div className="relative flex items-center justify-center">
           <Weight className="text-white w-12 h-12" />
           <span className="absolute text-[10px] font-black text-slate-900 mt-1">JM</span>
        </div>
        <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase text-center leading-tight">
          JM STUDIO<br/><span className="text-blue-500">PERSONAL</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="mt-auto space-y-2 pt-6 border-t border-slate-800">
        {canInstall && (
          <button 
            onClick={onInstall}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all duration-200 font-bold text-xs uppercase tracking-widest border border-emerald-500/20"
          >
            <DownloadCloud className="w-5 h-5" /> Instalar App
          </button>
        )}
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 font-bold text-sm"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
