
import React, { useState, useEffect } from 'react';
/* Added Palette to fix the "Cannot find name 'Palette'" error on line 298 */
import { Weight, Mail, Lock, LogIn, ShieldAlert, Check, User, ArrowLeft, Eye, EyeOff, Sparkles, Palette } from 'lucide-react';
import { ThemeSettings, PRIMARY_COLORS, User as UserType } from '../types';

interface LoginProps {
  onLogin: (theme: ThemeSettings) => void;
  currentTheme: ThemeSettings;
  onThemePreview: (theme: ThemeSettings) => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

const Login: React.FC<LoginProps> = ({ onLogin, currentTheme, onThemePreview }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { 
    setError(''); 
    setSuccess(''); 
  }, [authMode]);

  const getUsers = (): UserType[] => {
    try {
      const saved = localStorage.getItem('jm_studio_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Erro ao ler usuários:", e);
    }
    return [];
  };

  const saveUser = (user: UserType) => {
    try {
      const users = getUsers();
      users.push(user);
      localStorage.setItem('jm_studio_users', JSON.stringify(users));
    } catch (e) {
      console.error("Erro ao salvar usuário:", e);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(''); 
    setSuccess('');

    if (!email) return setError('O e-mail é obrigatório para prosseguir.');
    if (authMode !== 'forgot-password' && !password) return setError('A senha é necessária para autenticação.');

    setIsLoading(true);

    // Simulação de delay de rede para feedback visual
    setTimeout(() => {
      const users = getUsers();

      if (authMode === 'login') {
        const isAdmin = email.toLowerCase() === 'admin@jmstudio.com' && password === 'admin';
        const registeredUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (isAdmin || registeredUser) {
          setSuccess('Acesso autorizado! Carregando ambiente...');
          setTimeout(() => onLogin(currentTheme), 800);
        } else {
          setError('E-mail ou senha inválidos. Tente novamente.');
          setIsLoading(false);
        }
      } 
      else if (authMode === 'register') {
        if (!name) {
          setError('Como devemos te chamar? Nome é obrigatório.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('A confirmação de senha não coincide.');
          setIsLoading(false);
          return;
        }
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('Este endereço de e-mail já possui cadastro.');
          setIsLoading(false);
          return;
        }

        const newUser: UserType = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email: email.toLowerCase(),
          password
        };

        saveUser(newUser);
        setSuccess('Conta criada! Você já pode entrar no sistema.');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
      }
      else if (authMode === 'forgot-password') {
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase()) || email === 'admin@jmstudio.com';
        if (userExists) {
          setSuccess('Enviamos um link de recuperação para seu e-mail.');
        } else {
          setError('E-mail não localizado em nossa base de dados.');
        }
        setIsLoading(false);
      }
    }, 1500);
  };

  const isDark = currentTheme?.mode === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-700 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <style>{`
        @keyframes progress-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress-loading 1.5s infinite linear;
        }
        .shake-animation {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>

      {/* Brilho de Fundo Dinâmico */}
      <div 
        className="absolute w-[600px] h-[600px] blur-[150px] rounded-full opacity-10 pointer-events-none transition-all duration-1000"
        style={{ 
          backgroundColor: error ? '#f43f5e' : success ? '#10b981' : (currentTheme?.primaryColor || '#3b82f6'),
          transform: `scale(${isLoading ? 1.2 : 1})`
        }}
      ></div>

      <div className={`w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10 ${error ? 'shake-animation' : ''}`}>
        <div className={`backdrop-blur-3xl border p-8 md:p-10 rounded-[3rem] shadow-2xl transition-all duration-500 relative overflow-hidden ${
          isDark 
            ? `bg-slate-900/70 ${error ? 'border-rose-500/50 shadow-rose-900/20' : success ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-white/10'}` 
            : `bg-white/90 ${error ? 'border-rose-500/50 shadow-rose-100' : success ? 'border-emerald-500/50 shadow-emerald-100' : 'border-slate-200'}`
        }`}>
          
          {/* Barra de Progresso Superior */}
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800 overflow-hidden">
              <div 
                className="h-full w-full animate-progress"
                style={{ backgroundColor: currentTheme?.primaryColor || '#3b82f6' }}
              ></div>
            </div>
          )}

          <div className="text-center mb-10">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 blur-3xl opacity-30 animate-pulse" style={{ backgroundColor: currentTheme?.primaryColor || '#3b82f6' }}></div>
              <Weight className="w-16 h-16 relative transition-transform duration-500 hover:scale-110" style={{ color: currentTheme?.primaryColor || '#3b82f6' }} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
              JM STUDIO<br/>
              <span style={{ color: currentTheme?.primaryColor || '#3b82f6' }} className="text-xs tracking-[0.4em] font-black">PERSONAL</span>
            </h1>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Nome Completo"
                  className={`w-full border rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-950/50 border-white/5 text-white focus:ring-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} 
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Corporativo"
                className={`w-full border rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-950/50 border-white/5 text-white focus:ring-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} 
              />
            </div>

            {authMode !== 'forgot-password' && (
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua Senha"
                  className={`w-full border rounded-2xl pl-14 pr-14 py-5 outline-none focus:ring-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-950/50 border-white/5 text-white focus:ring-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} 
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {authMode === 'register' && (
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar Senha"
                  className={`w-full border rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-950/50 border-white/5 text-white focus:ring-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} 
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="text-right">
                <button 
                  type="button" onClick={() => setAuthMode('forgot-password')}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <div className="space-y-2 min-h-[50px] flex flex-col justify-center">
              {error && (
                <div className="flex items-center gap-3 text-rose-500 text-[11px] font-black bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 animate-in slide-in-from-top-2 duration-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-tight">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 text-emerald-500 text-[11px] font-black bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 animate-in slide-in-from-top-2 duration-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-tight">{success}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" disabled={isLoading} 
              className="w-full text-white font-black py-6 rounded-[2rem] shadow-xl active:scale-[0.97] disabled:opacity-80 disabled:cursor-not-allowed transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 relative overflow-hidden group"
              style={{ backgroundColor: currentTheme?.primaryColor || '#3b82f6' }}
            >
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <LogIn className="w-5 h-5" />
                {authMode === 'login' ? 'Acessar Workspace' : authMode === 'register' ? 'Confirmar Cadastro' : 'Enviar Instruções'}
              </div>
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
            </button>

            <div className="text-center mt-8">
              {authMode === 'forgot-password' ? (
                <button 
                  type="button" onClick={() => setAuthMode('login')}
                  className="text-xs font-black text-slate-500 hover:text-blue-500 flex items-center justify-center gap-2 mx-auto transition-all uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar ao Login
                </button>
              ) : (
                <button 
                  type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs font-black text-slate-500 hover:text-blue-500 transition-all uppercase tracking-widest"
                >
                  {authMode === 'login' ? 
                    <>Novo no estúdio? <span style={{ color: currentTheme?.primaryColor || '#3b82f6' }} className="underline decoration-2 underline-offset-4">Criar Conta</span></> : 
                    <>Já é cadastrado? <span style={{ color: currentTheme?.primaryColor || '#3b82f6' }} className="underline decoration-2 underline-offset-4">Entrar Agora</span></>
                  }
                </button>
              )}
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-700/10 flex flex-col items-center gap-5">
             <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
               <Palette className="w-3 h-3" /> Identidade Visual
             </div>
             <div className="flex items-center justify-center gap-4">
               {PRIMARY_COLORS.map(c => (
                 <button 
                  key={c.hex} onClick={() => onThemePreview({...currentTheme, primaryColor: c.hex})}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-125 shadow-lg relative ${currentTheme?.primaryColor === c.hex ? 'scale-110 ring-4 ring-slate-800 ring-offset-2' : ''}`}
                  style={{ backgroundColor: c.hex }}
                 >
                   {currentTheme?.primaryColor === c.hex && <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                 </button>
               ))}
             </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-500" /> JM Studio Management V2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
