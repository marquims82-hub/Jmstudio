
import React, { useEffect, useState, useMemo } from 'react';
import { Cake, X, Sparkles, PartyPopper } from 'lucide-react';
import { Student } from '../types';
import { generateBirthdayGreeting } from '../services/geminiService';

interface BirthdayAlertProps {
  students: Student[];
}

const BirthdayAlert: React.FC<BirthdayAlertProps> = ({ students }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lógica de filtragem: Compara apenas Dia e Mês, lidando com fusos horários de string ISO
  const birthdayStudents = useMemo(() => {
    const today = new Date();
    const tDay = today.getDate();
    const tMonth = today.getMonth();

    return students.filter(s => {
      if (!s.birthDate) return false;
      
      // Cria a data de nascimento garantindo que pegamos o dia correto da string (YYYY-MM-DD)
      const [year, month, day] = s.birthDate.split('-').map(Number);
      // Meses no Date do JS começam em 0, por isso month - 1
      return day === tDay && (month - 1) === tMonth;
    });
  }, [students]);

  // Sincroniza visibilidade com a existência de alunos e estado de fechamento manual
  useEffect(() => {
    const hasBirthdays = birthdayStudents.length > 0;
    
    if (hasBirthdays && !isDismissed) {
      setIsVisible(true);
      
      const fetchAiMessage = async () => {
        const student = birthdayStudents[currentIndex];
        // Gera mensagem personalizada via Gemini
        const msg = await generateBirthdayGreeting(student.name.split(' ')[0]);
        setAiMessage(msg || '');
      };

      fetchAiMessage();
    } else {
      setIsVisible(false);
    }
  }, [birthdayStudents, currentIndex, isDismissed]);

  // Rotaciona entre aniversariantes se houver mais de um (carrossel automático)
  useEffect(() => {
    if (birthdayStudents.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % birthdayStudents.length);
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setCurrentIndex(0);
    }
  }, [birthdayStudents.length]);

  // Renderização condicional estrita: Se não houver alunos ou o usuário fechou, não retorna NADA para o DOM
  if (!isVisible || birthdayStudents.length === 0) {
    return null;
  }

  const currentStudent = birthdayStudents[currentIndex];

  const handleWhatsApp = () => {
    const msg = aiMessage || `Parabéns, ${currentStudent.name.split(' ')[0]}! 🎉 Tudo de bom hoje! 💪`;
    const phone = currentStudent.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[290] w-[95%] max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-700">
      <style>{`
        @keyframes bday-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        .animate-bday-float {
          animation: bday-float 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/40 rounded-3xl p-5 shadow-2xl flex items-center gap-4 animate-bday-float">
        <div className="bg-gradient-to-br from-indigo-600 to-rose-500 p-3 rounded-2xl text-white shadow-xl shadow-indigo-900/40 shrink-0">
          <Cake className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              {birthdayStudents.length > 1 ? `Aniversariante (${currentIndex + 1}/${birthdayStudents.length})` : 'Aniversariante do Dia'}
            </span>
            <div className="flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
               <Sparkles className="w-2.5 h-2.5 text-rose-400" />
               <span className="text-[8px] font-black text-rose-400 uppercase">Felicitações</span>
            </div>
          </div>
          <p className="text-white text-sm font-bold leading-tight truncate">
            {aiMessage || `Hoje é o dia de ${currentStudent.name}! Celebre com muito treino!`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleWhatsApp}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap shadow-lg shadow-indigo-900/40"
          >
            Parabenizar <PartyPopper className="w-3.5 h-3.5" />
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

export default BirthdayAlert;
