
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import ClassesView from './components/ClassesView';
import FinancialControl from './components/FinancialControl';
import WorkoutPlanner from './components/WorkoutPlanner';
import CalendarView from './components/CalendarView';
import TeacherView from './components/TeacherView';
import ReportsView from './components/ReportsView';
import Login from './components/Login';
import PublicEnrollment from './components/PublicEnrollment';
import PaymentsView from './components/PaymentsView';
import StudentsView from './components/StudentsView';
import { AppSection, Student, Teacher, ThemeSettings, StudentStatus } from './types';
import { Menu, X, Database, Download, Save, FileSpreadsheet, Trash2, Upload, Users } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('jm_studio_theme');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn("Erro ao ler tema, usando padrão."); }
    return { mode: 'dark', primaryColor: '#3b82f6', primaryName: 'Azul' };
  });

  // Carregamento inicial
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'enroll') setIsPublicMode(true);

    try {
      const savedStudents = localStorage.getItem('fitmanage_students');
      if (savedStudents) {
        const parsed = JSON.parse(savedStudents);
        if (Array.isArray(parsed)) setStudents(parsed);
      }
      
      const savedTeachers = localStorage.getItem('fitmanage_teachers');
      if (savedTeachers) {
        const parsed = JSON.parse(savedTeachers);
        if (Array.isArray(parsed)) setTeachers(parsed);
      }

      const authStatus = localStorage.getItem('jm_studio_auth');
      if (authStatus === 'true') setIsAuthenticated(true);
    } catch (e) {
      console.error("Erro ao carregar dados iniciais.");
    }
  }, []);

  // Persistência automática
  useEffect(() => {
    localStorage.setItem('fitmanage_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('fitmanage_teachers', JSON.stringify(teachers));
  }, [teachers]);

  const themeStyles = useMemo(() => `
    :root { --brand-primary: ${theme.primaryColor}; }
    .text-blue-500 { color: ${theme.primaryColor} !important; }
    .bg-blue-600 { background-color: ${theme.primaryColor} !important; }
    .border-blue-600 { border-color: ${theme.primaryColor} !important; }
  `, [theme.primaryColor]);

  const handleUpdateStudent = (s: Student) => {
    setStudents(prev => prev.map(x => x.id === s.id ? { ...s } : x));
    setEditingStudent(null);
    if (activeSection === AppSection.CADASTRO) setActiveSection(AppSection.DASHBOARD);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("ATENÇÃO: Deseja excluir permanentemente este aluno do sistema?")) {
      setStudents(prev => prev.filter(s => s.id !== id));
      if (editingStudent?.id === id) setEditingStudent(null);
      return true;
    }
    return false;
  };

  const handleAddStudent = (s: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...s, id: Math.random().toString(36).substr(2, 9) }]);
    if (!isPublicMode) setActiveSection(AppSection.DASHBOARD);
  };

  const handleEditStudent = (s: Student) => {
    setEditingStudent(s);
    setActiveSection(AppSection.CADASTRO);
    setIsMobileMenuOpen(false);
  };

  const exportStudentsCSV = () => {
    if (students.length === 0) return alert("Não há alunos para exportar.");
    const headers = ["Nome", "Telefone", "Status", "Horario da Turma"];
    const rows = students.map(s => [s.name, s.phone, s.status, s.classTime || 'Pendente']);
    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(r => r.map(cell => `"${cell}"`).join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `alunos_jm_studio_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    link.click();
  };

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD: 
        return <Dashboard 
          students={students} 
          setActiveSection={setActiveSection} 
          onUpdateStudent={handleUpdateStudent} 
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />;
      case AppSection.CADASTRO: 
        return <RegistrationForm 
          students={students} 
          onAddStudent={handleAddStudent} 
          editingStudent={editingStudent} 
          onUpdateStudent={handleUpdateStudent} 
          onDeleteStudent={handleDeleteStudent}
          onCancel={() => { setEditingStudent(null); setActiveSection(AppSection.DASHBOARD); }} 
        />;
      case AppSection.ALUNOS:
        return <StudentsView 
          students={students}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />;
      case AppSection.TURMAS: 
        return <ClassesView students={students} onEditStudent={handleEditStudent} onUpdateStudent={handleUpdateStudent} />;
      case AppSection.PAGAMENTOS: 
        return <PaymentsView students={students} onUpdateStudent={handleUpdateStudent} onEditStudent={handleEditStudent} />;
      case AppSection.FINANCEIRO: return <FinancialControl students={students} onUpdateStudent={handleUpdateStudent} />;
      case AppSection.TREINO: return <WorkoutPlanner students={students} />;
      case AppSection.CALENDARIO: return <CalendarView students={students} />;
      case AppSection.RELATORIOS: return <ReportsView students={students} />;
      case AppSection.PROFESSORES:
        return <TeacherView 
          teachers={teachers} 
          onAddTeacher={t => setTeachers([...teachers, { ...t, id: Math.random().toString(36).substr(2, 9) }])}
          onUpdateTeacher={t => setTeachers(teachers.map(x => x.id === t.id ? t : x))}
          onDeleteTeacher={id => { if(confirm("Excluir professor?")) setTeachers(teachers.filter(x => x.id !== id)); }}
        />;
      case AppSection.CONFIGURACAO: 
        return (
          <div className="max-w-2xl mx-auto space-y-6 pb-20">
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <Database className="w-8 h-8 text-blue-500" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Sistema e Dados</h2>
              </div>
              
              <div className="space-y-4">
                <button onClick={exportStudentsCSV} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20">
                  <Users className="w-6 h-6" /> Exportar Lista de Alunos (CSV)
                </button>
                <button onClick={() => {
                  const data = JSON.stringify({students, teachers});
                  const blob = new Blob([data], {type: 'application/json'});
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup_jm_studio_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
                  a.click();
                }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <Download className="w-5 h-5" /> Exportar Backup (.json)
                </button>
                
                <input type="file" ref={importFileRef} onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onload = (event) => {
                       try {
                         const rawData = event.target?.result as string;
                         const data = JSON.parse(rawData);
                         
                         if (data.students && Array.isArray(data.students)) {
                            localStorage.setItem('fitmanage_students', JSON.stringify(data.students));
                            if (data.teachers && Array.isArray(data.teachers)) {
                                localStorage.setItem('fitmanage_teachers', JSON.stringify(data.teachers));
                            }
                            
                            alert("Backup importado com sucesso! Recarregando sistema...");
                            window.location.reload();
                         } else {
                            alert("Arquivo de backup inválido ou vazio.");
                         }
                       } catch (err) { alert("Erro ao ler o arquivo. Certifique-se de que é um arquivo .json válido."); }
                     };
                     reader.readAsText(file);
                   }
                }} accept=".json" className="hidden" />
                
                <button onClick={() => importFileRef.current?.click()} className="w-full bg-slate-800/50 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700/50">
                  <Upload className="w-5 h-5" /> Importar Backup
                </button>
                <button onClick={() => { if (confirm("Deseja apagar TODOS os dados do sistema? Esta ação é irreversível.")) { localStorage.clear(); window.location.reload(); } }} className="w-full bg-rose-900/20 hover:bg-rose-600 text-rose-500 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-rose-500/20">
                  <Trash2 className="w-5 h-5" /> Resetar Sistema
                </button>
              </div>
             </div>
          </div>
        );
      default: return <Dashboard students={students} />;
    }
  };

  if (isPublicMode) return <div className="bg-slate-950 min-h-screen"><style dangerouslySetInnerHTML={{ __html: themeStyles }} /><PublicEnrollment students={students} onAddStudent={handleAddStudent} /></div>;
  if (!isAuthenticated) return <><style dangerouslySetInnerHTML={{ __html: themeStyles }} /><Login onLogin={() => { setIsAuthenticated(true); localStorage.setItem('jm_studio_auth', 'true'); }} currentTheme={theme} onThemePreview={setTheme} /></>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-[150]">
        <div className="flex items-center gap-2"><div className="bg-blue-600 p-1.5 rounded-lg text-white font-black text-xs">JM</div><span className="text-white font-black text-xs uppercase tracking-widest">JM Studio</span></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">{isMobileMenuOpen ? <X /> : <Menu />}</button>
      </div>
      <Sidebar activeSection={activeSection} setActiveSection={(s) => { setActiveSection(s); setIsMobileMenuOpen(false); if (s !== AppSection.CADASTRO) setEditingStudent(null); }} onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('jm_studio_auth'); }} isOpen={isMobileMenuOpen} canInstall={!!installPrompt} onInstall={() => installPrompt?.prompt()} />
      <main className="flex-1 md:ml-64 p-4 md:p-10">{renderSection()}</main>
    </div>
  );
};

export default App;
