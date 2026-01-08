
import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, Save, Phone, DollarSign, User, Calendar, Clock, CheckCircle2, AlertCircle, QrCode, Copy, Share2, X, Edit3, Trash2 } from 'lucide-react';
import { Student, CLASS_HOURS, StudentStatus } from '../types';

interface RegistrationFormProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  editingStudent?: Student | null;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;
  onCancel?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ students, onAddStudent, editingStudent, onUpdateStudent, onDeleteStudent, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const CAPACITY = 12;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    birthDate: '',
    monthlyFee: '',
    billingDay: '5',
    classTime: '', 
    joinDate: today,
    status: StudentStatus.ATIVO,
    observations: '',
  });
  
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        phone: editingStudent.phone,
        cpf: editingStudent.cpf || '',
        birthDate: editingStudent.birthDate.split('T')[0],
        monthlyFee: editingStudent.monthlyFee.toString(),
        billingDay: editingStudent.billingDay.toString(),
        classTime: editingStudent.classTime,
        joinDate: editingStudent.joinDate.split('T')[0],
        status: editingStudent.status,
        observations: editingStudent.observations || '',
      });
    }
  }, [editingStudent]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const enrollmentLink = useMemo(() => {
    // Tenta obter a URL base limpa, removendo blob: se existir
    let base = window.location.href.replace(/^blob:/, '');
    try {
      const url = new URL(base);
      url.searchParams.set('mode', 'enroll');
      return url.toString();
    } catch (e) {
      // Fallback caso a URL seja inválida por algum motivo de ambiente
      return `${base.split('?')[0]}?mode=enroll`;
    }
  }, []);

  const getOccupancy = (time: string) => {
    return students.filter(s => s.classTime === time && s.id !== editingStudent?.id).length;
  };

  const getStatusInfo = (time: string) => {
    const count = getOccupancy(time);
    const slots = CAPACITY - count;
    if (slots <= 0) return { label: 'LOTADO', color: 'text-rose-500 bg-rose-500/10', disabled: true };
    return { label: `${slots} VAGAS`, color: 'text-emerald-500 bg-emerald-500/10', disabled: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone || !formData.classTime || !formData.monthlyFee) {
      return setError('Preencha os campos obrigatórios (*)');
    }

    const payload = {
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      monthlyFee: parseFloat(formData.monthlyFee),
      billingDay: parseInt(formData.billingDay),
      classTime: formData.classTime,
      joinDate: new Date(formData.joinDate).toISOString(),
      status: formData.status,
      observations: formData.observations,
    };

    if (editingStudent && onUpdateStudent) {
      onUpdateStudent({ ...payload, id: editingStudent.id } as Student);
      setSuccess(true);
    } else {
      onAddStudent(payload);
      setSuccess(true);
      setFormData({
        name: '', phone: '', cpf: '', birthDate: '', monthlyFee: '',
        billingDay: '5', classTime: '', joinDate: today, status: StudentStatus.ATIVO, observations: '',
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!editingStudent && (
        <div className="mb-10 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative group">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-blue-600 p-5 rounded-[2rem] shadow-xl">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-black text-xl tracking-tighter uppercase">Link de Auto-Matrícula</h4>
              <p className="text-slate-500 text-xs font-bold mt-2">O aluno preenche no próprio celular.</p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button type="button" onClick={() => {navigator.clipboard.writeText(enrollmentLink); alert('Link copiado!');}} className="bg-slate-800 text-white p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-slate-700">
                <Copy className="w-4 h-4" /> Copiar Link
              </button>
              <button type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Olá! Faça sua matrícula no JM Studio aqui: ' + enrollmentLink)}`, '_blank')} className="bg-emerald-600 text-white font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all hover:bg-emerald-500">
                <Share2 className="w-4 h-4" /> Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="bg-slate-800/20 p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-4 rounded-3xl">
              {editingStudent ? <Edit3 className="text-white w-8 h-8" /> : <UserPlus className="text-white w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {editingStudent ? 'Editar Cadastro' : 'Novo Aluno'}
              </h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                Preencha os dados do aluno abaixo
              </p>
            </div>
          </div>
          {editingStudent && onCancel && (
            <button type="button" onClick={onCancel} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all">
              <X />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {success && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-black text-xs uppercase tracking-widest">Cadastro salvo com sucesso!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold text-xs uppercase">{error}</span>
            </div>
          )}

          {/* Seção Dados Básicos */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><User className="w-3 h-3" /> Identificação</h3>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-blue-600 outline-none transition-all shadow-inner" placeholder="Ex: João Silva" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CAMPO TELEFONE EM DESTAQUE */}
              <div className="space-y-3 p-4 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/20">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Telefone / WhatsApp *
                </label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-emerald-500/30 rounded-2xl px-6 py-5 text-emerald-400 font-black focus:border-emerald-500 outline-none transition-all" placeholder="(00) 00000-0000" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data de Nascimento *</label>
                <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Seção Plano Financeiro */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><DollarSign className="w-3 h-3" /> Plano e Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CAMPO VALOR EM DESTAQUE */}
              <div className="space-y-3 p-4 bg-blue-500/5 rounded-[2rem] border border-blue-500/20 md:col-span-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Valor Mensalidade *
                </label>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 font-black">R$</span>
                   <input type="number" step="0.01" required value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: e.target.value})} className="w-full bg-slate-950 border border-blue-500/30 rounded-2xl pl-14 pr-6 py-5 text-white font-black text-2xl focus:border-blue-500 outline-none transition-all" placeholder="0,00" />
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Dia de Vencimento *</label>
                <input type="number" required min="1" max="31" value={formData.billingDay} onChange={e => setFormData({...formData, billingDay: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-black text-xl focus:border-amber-600 outline-none transition-all" />
              </div>
              
              <div className="space-y-3 pt-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Início das Aulas</label>
                <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Escolha a Turma (Horário) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CLASS_HOURS.map(h => {
                  const status = getStatusInfo(h);
                  const isSelected = formData.classTime === h;
                  return (
                    <button key={h} type="button" disabled={status.disabled} onClick={() => setFormData({...formData, classTime: h})} className={`p-4 rounded-2xl border transition-all text-left ${status.disabled ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-900' : isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-xl scale-[1.05] z-10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                      <p className="text-sm font-black">{h}</p>
                      <p className={`text-[8px] font-black uppercase mt-1 ${isSelected ? 'text-blue-100' : status.color.split(' ')[0]}`}>{status.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-95">
              <Save className="w-6 h-6" />
              {editingStudent ? 'Atualizar Aluno' : 'Confirmar Matrícula'}
            </button>
            {editingStudent && onDeleteStudent && (
              <button 
                type="button" 
                onClick={() => onDeleteStudent(editingStudent.id)}
                className="bg-rose-900/20 hover:bg-rose-600 text-rose-500 hover:text-white font-black py-6 rounded-[2rem] border border-rose-500/30 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-95"
              >
                <Trash2 className="w-6 h-6" />
                Excluir Definitivamente
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
