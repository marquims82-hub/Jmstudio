
import React, { useState, useEffect } from 'react';
import { Weight, Mail, Lock, LogIn, ShieldAlert, Sun, Moon, Palette, Check, UserPlus, User, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
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

    if (!email) return setError('O e-mail é obrigatório.');
    if (authMode !== 'forgot-password' && !password) return setError('A senha é obrigatória.');

    setIsLoading(true);

    setTimeout(() => {
      const users = getUsers();

      if (authMode === 'login') {
        const isAdmin = email.toLowerCase() === 'admin@jmstudio.com' && password === 'admin';
        const registeredUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (isAdmin || registeredUser) {
          onLogin(currentTheme);
        } else {
          setError('E-mail ou senha incorretos.');
          setIsLoading(false);
        }
      } 
      else if (authMode === 'register') {
        if (!name) {
          setError('O nome é obrigatório.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setIsLoading(false);
          return;
        }
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('Este e-mail já está em uso.');
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
        setSuccess('Conta criada com sucesso! Faça login agora.');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
      }
      else if (authMode === 'forgot-password') {
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase()) || email === 'admin@jmstudio.com';
        if (userExists) {
          setSuccess('Instruções enviadas para seu e-mail.');
        } else {
          setError('E-mail não encontrado.');
        }
        setIsLoading(false);
      }
    }, 1200);
  };

  const isDark = currentTheme?.mode === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div 
        className="absolute w-[500px] h-[500px] blur-[120px] rounded-full opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTheme?.primaryColor || '#3b82f6' }}
      ></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
        <div className={`backdrop-blur-xl border p-8 md:p-10 rounded-[2.5rem] shadow-2xl ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-slate-200'}`}>
          
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 blur-2xl opacity-50" style={{ backgroundColor: currentTheme?.primaryColor || '#3b82f6' }}></div>
              <Weight className="w-16 h-16 relative" style={{ color: currentTheme?.primaryColor || '#3b82f6' }} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              JM STUDIO<br/><span style={{ color: currentTheme?.primaryColor || '#3b82f6' }} className="text-sm tracking-[0.3em]">PERSONAL</span>
            </h1>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome Completo"
                  className={`w-full border rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} 
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Corporativo"
                className={`w-full border rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} 
              />
            </div>

            {authMode !== 'forgot-password' && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua Senha"
                  className={`w-full border rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} 
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {authMode === 'register' && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar Senha"
                  className={`w-full border rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} 
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="text-right">
                <button 
                  type="button" onClick={() => setAuthMode('forgot-password')}
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 animate-in shake duration-300">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 animate-in fade-in duration-300">
                <Check className="w-4 h-4" />
                {success}
              </div>
            )}

            <button 
              type="submit" disabled={isLoading} 
              className="w-full text-white font-black py-5 rounded-2xl shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              style={{ backgroundColor: currentTheme?.primaryColor || '#3b82f6' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {authMode === 'login' ? 'ENTRAR NO SISTEMA' : authMode === 'register' ? 'CRIAR MINHA CONTA' : 'RECUPERAR ACESSO'}
                </>
              )}
            </button>

            <div className="text-center mt-6">
              {authMode === 'forgot-password' ? (
                <button 
                  type="button" onClick={() => setAuthMode('login')}
                  className="text-xs font-bold text-slate-500 hover:text-blue-500 flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" /> VOLTAR PARA O LOGIN
                </button>
              ) : (
                <button 
                  type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs font-bold text-slate-500 hover:text-blue-500 transition-all"
                >
                  {authMode === 'login' ? 
                    <>Ainda não tem acesso? <span style={{ color: currentTheme?.primaryColor || '#3b82f6' }} className="underline">Cadastre-se</span></> : 
                    <>Já possui conta? <span style={{ color: currentTheme?.primaryColor || '#3b82f6' }} className="underline">Fazer Login</span></>
                  }
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-700/20 flex items-center justify-center gap-4">
             {PRIMARY_COLORS.map(c => (
               <button 
                key={c.hex} onClick={() => onThemePreview({...currentTheme, primaryColor: c.hex})}
                className="w-6 h-6 rounded-full transition-transform hover:scale-125 shadow-lg"
                style={{ backgroundColor: c.hex, border: currentTheme?.primaryColor === c.hex ? '2px solid white' : 'none' }}
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
