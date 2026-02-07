
import React, { useEffect, useState, useMemo } from 'react';
import { ChevronRight, X, Sparkles, UserX } from 'lucide-react';
import { Student, StudentStatus } from '../types';
import { generateOverdueAlertMessage } from '../services/geminiService';

interface OverdueAlertProps {
  students: Student[];
  onAction?: () => void;
}

const OverdueAlert: React.FC<OverdueAlertProps> = ({ students, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  const overdueStudents = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return students.filter(s => {
      const hasPaid = s.payments?.some(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid');
      return s.status === StudentStatus.ATIVO && !hasPaid && s.billingDay < currentDay;
    });
  }, [students]);

  const overdueNames = useMemo(() => overdueStudents.map(s => s.name.split(' ')[0]), [overdueStudents]);

  useEffect(() => {
    if (overdueStudents.length > 0 && !isDismissed) {
      setIsVisible(true);
      
      const fetchAiMessage = async () => {
        const msg = await generateOverdueAlertMessage(overdueStudents.length, overdueNames);
        setAiMessage(msg || '');
      };

      fetchAiMessage();
    } else {
      setIsVisible(false);
    }
  }, [overdueStudents, isDismissed, overdueNames]);

  if (!isVisible) return null;

  const namesString = overdueNames.length > 3 
    ? `${overdueNames.slice(0, 3).join(', ')} e mais ${overdueNames.length - 3}` 
    : overdueNames.join(', ');

  const defaultMessage = `Atenção: Mensalidade em atraso de ${namesString}.`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-[95%] max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-500">
      <style>{`
        @keyframes alert-pulse {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .animate-alert-pulse {
          animation: alert-pulse 2s infinite;
        }
      `}</style>
      
      <div className="bg-slate-900/90 backdrop-blur-xl border border-rose-500/50 rounded-3xl p-5 shadow-2xl flex items-center gap-4 animate-alert-pulse">
        <div className="bg-rose-600 p-3 rounded-2xl text-white shadow-lg shadow-rose-900/40 shrink-0">
          <UserX className="w-6 h-6 animate-bounce" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Inadimplência Detectada</span>
            <div className="flex items-center gap-1 bg-blue-600/10 px-1.5 py-0.5 rounded border border-blue-500/20">
               <Sparkles className="w-2.5 h-2.5 text-blue-400" />
               <span className="text-[8px] font-black text-blue-400 uppercase">IA Insight</span>
            </div>
          </div>
          <p className="text-white text-sm font-bold leading-tight">
            {aiMessage || defaultMessage}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onAction}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            Listar <ChevronRight className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="p-2.5 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverdueAlert;
