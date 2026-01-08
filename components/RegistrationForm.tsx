
import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, Save, Phone, DollarSign, User, Calendar, Clock, CheckCircle2, AlertCircle, QrCode, Copy, Share2, X, Edit3, Trash2, CalendarDays, Hash, Users } from 'lucide-react';
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
    let base = window.location.href.replace(/^blob:/, '');
    try {
      const url = new URL(base);
      url.searchParams.set('mode', 'enroll');
      return url.toString();
    } catch (e) {
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
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {!editingStudent && (
        <div className="mb-10 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative group overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10" />
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl shadow-blue-900/40">
              <QrCode className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Link de Auto-Matrícula</h4>
              <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">Agilize o processo: O próprio aluno faz o cadastro.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button type="button" onClick={() => {navigator.clipboard.writeText(enrollmentLink); alert('Link copiado!');}} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all">
                <Copy className="w-4 h-4 text-blue-500" /> Copiar Link
              </button>
              <button type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Olá! Faça sua matrícula no JM Studio aqui: ' + enrollmentLink)}`, '_blank')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/30">
                <Share2 className="w-4 h-4" /> Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl overflow-hidden relative">
        <div className="bg-slate-800/20 p-10 md:p-12 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="bg-blue-600 p-5 rounded-[2rem] shadow-xl shadow-blue-900/30">
              {editingStudent ? <Edit3 className="text-white w-10 h-10" /> : <UserPlus className="text-white w-10 h-10" />}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                {editingStudent ? 'Atualizar Perfil' : 'Registro de Aluno'}
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-500" /> Dados cadastrais e financeiros
              </p>
            </div>
          </div>
          {editingStudent && onCancel && (
            <button type="button" onClick={onCancel} className="p-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all active:scale-90">
              <X className="w-7 h-7" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">
          {success && (
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-3xl flex items-center gap-6 animate-in zoom-in duration-500">
              <div className="bg-emerald-500 p-2 rounded-lg"><CheckCircle2 className="w-6 h-6 text-white" /></div>
              <span className="font-black text-sm uppercase tracking-widest">Informações processadas com sucesso!</span>
            </div>
          )}

          {error && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center gap-4">
              <AlertCircle className="w-6 h-6" />
              <span className="font-black text-xs uppercase tracking-widest">{error}</span>
            </div>
          )}

          {/* Seção Identificação */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-3"><User className="w-4 h-4 text-blue-500" /> Identificação Master</h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo do Aluno *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-6 text-white font-bold text-lg focus:border-blue-600 outline-none transition-all shadow-inner" placeholder="Nome Completo" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CAMPO TELEFONE EM DESTAQUE */}
              <div className="space-y-4 p-8 bg-blue-600/5 rounded-[2.5rem] border-2 border-blue-600/20 group hover:border-blue-500/40 transition-all">
                <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-3">
                  <Phone className="w-4 h-4" /> Telefone para Contato *
                </label>
                <input 
                  type="tel" required value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full bg-slate-950 border border-blue-900/50 rounded-2xl px-8 py-6 text-blue-400 font-black text-xl focus:border-blue-500 outline-none transition-all placeholder:text-blue-900/30" 
                  placeholder="(00) 00000-0000" 
                />
              </div>
              
              <div className="space-y-4 p-8 bg-slate-800/20 rounded-[2.5rem] border border-slate-800">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <Calendar className="w-4 h-4" /> Data de Nascimento *
                </label>
                <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-6 text-white font-bold text-lg focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Seção Plano Financeiro */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-3"><DollarSign className="w-4 h-4 text-emerald-500" /> Engenharia Financeira</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* CAMPO VALOR EM DESTAQUE */}
              <div className="space-y-4 p-8 bg-emerald-500/5 rounded-[2.5rem] border-2 border-emerald-500/20 group hover:border-emerald-500/40 transition-all md:col-span-1">
                <label className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                  <DollarSign className="w-4 h-4" /> Valor da Mensalidade *
                </label>
                <div className="relative">
                   <span className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">R$</span>
                   <input 
                    type="number" step="0.01" required value={formData.monthlyFee} 
                    onChange={e => setFormData({...formData, monthlyFee: e.target.value})} 
                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-2xl pl-16 pr-8 py-6 text-white font-black text-3xl focus:border-emerald-500 outline-none transition-all" 
                    placeholder="0,00" 
                   />
                </div>
              </div>
              
              <div className="space-y-4 p-8 bg-slate-800/20 rounded-[2.5rem] border border-slate-800">
                <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3">
                  <CalendarDays className="w-4 h-4" /> Dia de Vencimento *
                </label>
                <input type="number" required min="1" max="31" value={formData.billingDay} onChange={e => setFormData({...formData, billingDay: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-6 text-white font-black text-3xl focus:border-amber-600 outline-none transition-all text-center" />
              </div>
              
              <div className="space-y-4 p-8 bg-slate-800/20 rounded-[2.5rem] border border-slate-800">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <Clock className="w-4 h-4" /> Início das Atividades
                </label>
                <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-6 text-white font-bold text-lg focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-6 pt-6">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-500" /> Alocação de Turma (Horário Selecionado) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CLASS_HOURS.map(h => {
                  const status = getStatusInfo(h);
                  const isSelected = formData.classTime === h;
                  return (
                    <button 
                      key={h} type="button" disabled={status.disabled} 
                      onClick={() => setFormData({...formData, classTime: h})} 
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left group relative overflow-hidden ${
                        status.disabled ? 'opacity-20 cursor-not-allowed bg-slate-950 border-slate-900' : 
                        isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-2xl scale-[1.05] z-10' : 
                        'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xl font-black tracking-tighter">{h}</p>
                      <p className={`text-[9px] font-black uppercase mt-1 tracking-widest ${isSelected ? 'text-blue-100' : status.color.split(' ')[0]}`}>{status.label}</p>
                      {isSelected && <div className="absolute -right-2 -top-2 bg-white text-blue-600 p-1.5 rounded-full shadow-lg"><CheckCircle2 className="w-3 h-3" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-[2.5rem] transition-all shadow-2xl shadow-blue-900/50 uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-5 active:scale-95 group">
              <Save className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              {editingStudent ? 'Salvar Alterações' : 'Concluir Cadastro Master'}
            </button>
            {editingStudent && onDeleteStudent && (
              <button 
                type="button" 
                onClick={() => onDeleteStudent(editingStudent.id)}
                className="bg-slate-950 hover:bg-rose-600 text-rose-500 hover:text-white font-black py-8 rounded-[2.5rem] border border-rose-500/20 transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-5 active:scale-95 shadow-xl"
              >
                <Trash2 className="w-7 h-7" />
                Excluir Cadastro
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
