
import React, { useState } from 'react';
import { Weight, Building2, MapPin, Phone, Mail, Check, Palette, Sparkles, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';
import { CompanyProfile, PRIMARY_COLORS } from '../types';

interface CompanyRegistrationProps {
  onComplete: (company: CompanyProfile) => void;
}

const CompanyRegistration: React.FC<CompanyRegistrationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    address: '',
    phone: '',
    email: '',
    primaryColor: PRIMARY_COLORS[0].hex
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }
    onComplete({ ...formData, registeredAt: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
        <header className="text-center mb-10">
          <Weight className="w-20 h-20 mx-auto mb-6" style={{ color: formData.primaryColor }} />
          <h1 className="text-3xl font-black text-white uppercase">Configurar Workspace</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 ? (
            <div className="space-y-4">
              <input type="text" required placeholder="Nome da Academia" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600" />
              <input type="text" required placeholder="CNPJ/CPF" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600" />
              <input type="tel" required placeholder="Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-400 text-center">Escolha a cor da sua marca:</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {PRIMARY_COLORS.map(color => (
                  <button key={color.hex} type="button" onClick={() => setFormData({...formData, primaryColor: color.hex})}
                    className={`w-14 h-14 rounded-2xl transition-all ${formData.primaryColor === color.hex ? 'scale-110 shadow-lg' : ''}`}
                    style={{ backgroundColor: color.hex }}>
                    {formData.primaryColor === color.hex && <Check className="w-6 h-6 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="w-full text-white font-black py-5 rounded-2xl shadow-xl active:scale-95" style={{ backgroundColor: formData.primaryColor }}>
            {step === 1 ? 'PRÓXIMO PASSO' : 'FINALIZAR CONFIGURAÇÃO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
