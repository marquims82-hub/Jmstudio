
import React, { useState } from 'react';
import { Weight, CheckCircle2, User, Phone, Cake, Fingerprint, Clock, Send, Sparkles, ShieldCheck, AlertTriangle, Ban, Users, CalendarDays, Info } from 'lucide-react';
import { Student, CLASS_HOURS, StudentStatus } from '../types';

interface PublicEnrollmentProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
}

const PublicEnrollment: React.FC<PublicEnrollmentProps> = ({ students, onAddStudent }) => {
  const CAPACITY = 12;
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    birthDate: '',
    billingDay: '5',
    classTime: '', 
    observations: '',
  });

  const getOccupancy = (time: string) => {
    return students.filter(s => s.classTime === time).length;
  };

  const getStatusInfo = (time: string) => {
    const count = getOccupancy(time);
    const slots = CAPACITY - count;
    
    if (slots <= 0) return { label: 'LOTADO', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: Ban, disabled: true };
    if (slots <= 3) return { label: `${slots} VAGAS`, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle, disabled: false };
    return { label: `${slots} VAGAS`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, disabled: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classTime) {
      alert("Por favor, selecione um horário de treino.");
      return;
    }
    
    onAddStudent({
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      monthlyFee: 0, 
      billingDay: parseInt(formData.billingDay),
      classTime: formData.classTime,
      joinDate: new Date().toISOString(),
      status: StudentStatus.PENDENTE,
      observations: formData.observations,
    });

    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-3xl opacity-20 bg-blue-500 rounded-full"></div>
            <div className="relative bg-emerald-500 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/40">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Enviado! 🚀</h2>
            <p className="text-slate-400 text-lg">
              Olá <span className="text-white font-bold">{formData.name.split(' ')[0]}</span>! Sua pré-matrícula foi enviada com sucesso. Reservamos sua vaga às <span className="text-blue-500 font-bold">{formData.classTime}</span>. O professor entrará em contato em breve para confirmar o início e valores!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-12 lg:p-20 bg-slate-950 flex flex-col items-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-5 space-y-10 animate-in slide-in-from-left duration-700">
          <div className="space-y-6">
            <div className="bg-blue-600 w-16 h-16 rounded-3xl shadow-2xl shadow-blue-900/40 flex items-center justify-center">
              <Weight className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              TREINE NO <br/>
              <span className="text-blue-500">JM STUDIO</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Realize sua pré-matrícula online. O formulário é rápido e garante sua reserva em nossas turmas exclusivas de personal trainer.
            </p>
          </div>

          <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-start gap-4">
             <div className="bg-blue-600 p-2 rounded-xl mt-1">
                <Info className="w-4 h-4 text-white" />
             </div>
             <p className="text-xs text-blue-200 leading-relaxed font-bold uppercase tracking-wider">
               Após o envio, o professor entrará em contato via WhatsApp para combinar o valor da mensalidade e tirar dúvidas.
             </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Horários Disponíveis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CLASS_HOURS.map(h => {
                const status = getStatusInfo(h);
                const isSelected = formData.classTime === h;
                
                return (
                  <button
                    key={h}
                    disabled={status.disabled}
                    onClick={() => setFormData({...formData, classTime: h})}
                    className={`p-4 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                      status.disabled ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800' :
                      isSelected ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/20 scale-[1.02]' :
                      'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-300'}`}>{h}</p>
                    <div className={`mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter ${isSelected ? 'text-blue-100' : status.color.split(' ')[0]}`}>
                      <status.icon className="w-2.5 h-2.5" />
                      {status.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-right duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -z-10" />
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-2xl text-blue-500">
                <User className="w-6 h-6" />
              </div>
              Seus Dados
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-800"
                  placeholder="Seu nome aqui"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Seu WhatsApp</label>
                  <input 
                    type="tel" required value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-800"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nascimento</label>
                  <input 
                    type="date" required value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Melhor dia p/ pagar</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/50" />
                    <input 
                      type="number" required min="1" max="31" value={formData.billingDay}
                      onChange={e => setFormData({...formData, billingDay: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-amber-600 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CPF (Opcional)</label>
                  <input 
                    type="text" value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-800"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={!formData.classTime}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                  Garantir Minha Vaga
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
      
      <div className="mt-20 flex flex-col items-center gap-4">
        <div className="flex items-center gap-8 opacity-40">
           <ShieldCheck className="w-6 h-6 text-slate-500" />
           <Sparkles className="w-6 h-6 text-slate-500" />
           <Users className="w-6 h-6 text-slate-500" />
        </div>
        <div className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">
          JM STUDIO PERSONAL • EXCLUSIVIDADE & RESULTADO
        </div>
      </div>
    </div>
  );
};

export default PublicEnrollment;
