
import React, { useState, useMemo } from 'react';
import { 
  Search, Fingerprint, CheckCircle2, Calendar, Clock, Users, 
  UserCheck, History, X, FileText, Printer, BarChart3, 
  TrendingUp, MessageSquare, CheckSquare, Square, Send,
  ChevronRight, AlertCircle, Loader2, GraduationCap, Briefcase
} from 'lucide-react';
import { Student, StudentStatus, MONTHS_LABELS, Teacher, CLASS_HOURS } from '../types';

interface CheckinViewProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
  teachers?: Teacher[];
  onUpdateTeacher?: (teacher: Teacher) => void;
}

const CheckinView: React.FC<CheckinViewProps> = ({ students, onUpdateStudent, teachers = [], onUpdateTeacher }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'alunos' | 'professores'>('alunos');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [showTeacherMonthlyReport, setShowTeacherMonthlyReport] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isHourSelectorOpen, setIsHourSelectorOpen] = useState<{ isOpen: boolean, teacherId: string | null }>({ isOpen: false, teacherId: null });
  
  // Estados para seleção em massa (Alunos)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);

  const now = new Date();
  const selectedMonth = viewDate.getMonth();
  const selectedYear = viewDate.getFullYear();
  
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para Segunda-feira
    return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = new Date(selectedYear, selectedMonth, 1).getTime();
  const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getTime();

  // --- LOGICA ALUNOS ---
  const getAttendanceStats = (checkins: string[] = []) => {
    const weeklyCount = checkins.filter(c => new Date(c).getTime() >= startOfWeek).length;
    const monthlyCount = checkins.filter(c => {
      const time = new Date(c).getTime();
      return time >= startOfMonth && time <= endOfMonth;
    }).length;
    return { weeklyCount, monthlyCount };
  };

  const generateWhatsAppMessage = (student: Student) => {
    const { weeklyCount, monthlyCount } = getAttendanceStats(student.checkins);
    const firstName = student.name.split(' ')[0];
    const monthName = MONTHS_LABELS[now.getMonth()];
    
    return `Olá, *${firstName}*! 💪\n\nAqui está seu resumo de frequência no *JM Studio Personal*:\n\n📅 *Esta semana:* ${weeklyCount} ${weeklyCount === 1 ? 'presença' : 'presenças'}\n📊 *No mês de ${monthName}:* ${monthlyCount} ${monthlyCount === 1 ? 'presença' : 'presenças'}\n\nContinue com foco total nos treinos! Estamos juntos. ⚡🏋️‍♂️`;
  };

  const handleSendWhatsAppReport = (student: Student) => {
    const message = generateWhatsAppMessage(student);
    window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCheckin = (student: Student) => {
    const todayISO = new Date().toISOString();
    const todayStr = new Date().toLocaleDateString();
    const alreadyCheckedInToday = student.checkins?.some(c => new Date(c).toLocaleDateString() === todayStr);
    
    if (alreadyCheckedInToday) {
      alert("Este aluno já realizou check-in hoje!");
      return;
    }

    const updatedCheckins = [todayISO, ...(student.checkins || [])];
    onUpdateStudent({ ...student, checkins: updatedCheckins });
    alert(`Check-in confirmado para ${student.name.split(' ')[0]}!`);
  };

  // --- LOGICA PROFESSORES ---
  const getTeacherAttendanceStats = (checkins: any[] = []) => {
    const filteredCheckins = checkins.filter(c => {
      const time = new Date(c.timestamp).getTime();
      return time >= startOfMonth && time <= endOfMonth;
    });

    const totalClasses = filteredCheckins.length;
    const byHour = CLASS_HOURS.reduce((acc, h) => {
      acc[h] = filteredCheckins.filter(c => c.hour === h).length;
      return acc;
    }, {} as Record<string, number>);

    return { totalClasses, byHour };
  };

  const handleTeacherCheckin = (teacher: Teacher, hour: string) => {
    if (!onUpdateTeacher) return;

    const todayStr = new Date().toLocaleDateString();
    const alreadyCheckedIn = teacher.checkins?.some(c => 
      new Date(c.timestamp).toLocaleDateString() === todayStr && c.hour === hour
    );

    if (alreadyCheckedIn) {
      alert(`O professor já registrou check-in para o horário de ${hour} hoje!`);
      return;
    }

    const newCheckin = { timestamp: new Date().toISOString(), hour };
    const updatedCheckins = [newCheckin, ...(teacher.checkins || [])];

    onUpdateTeacher({ ...teacher, checkins: updatedCheckins });
    setIsHourSelectorOpen({ isOpen: false, teacherId: null });
    alert(`Check-in de ${hour} confirmado para ${teacher.name}!`);
  };

  const handleSendTeacherWhatsAppReport = (teacher: Teacher) => {
    const { totalClasses, byHour } = getTeacherAttendanceStats(teacher.checkins);
    const firstName = teacher.name.split(' ')[0];
    const monthName = MONTHS_LABELS[now.getMonth()];
    
    let hourBreakdown = "";
    Object.entries(byHour).forEach(([hour, count]) => {
      if (count > 0) hourBreakdown += `\n🕒 ${hour}: ${count} ${count === 1 ? 'aula' : 'aulas'}`;
    });

    const message = `Olá, Prof. *${firstName}*! 🎓\n\nAqui está o resumo de suas aulas em *${monthName}* no *JM Studio*:\n\n✅ *Total de aulas ministradas:* ${totalClasses}${hourBreakdown}\n\nObrigado pela dedicação e excelente trabalho! 💪🏋️‍♂️`;
    
    window.open(`https://wa.me/${teacher.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePrintTeacherReport = (teacher: Teacher) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const { totalClasses, byHour } = getTeacherAttendanceStats(teacher.checkins);
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const monthYear = `${MONTHS_LABELS[selectedMonth]} / ${selectedYear}`;
    
    let hourRows = Object.entries(byHour).map(([hour, count]) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; font-weight: bold;">${hour}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; text-align: center;">${count}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Aulas - ${teacher.name}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; }
            .header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 25px; margin-bottom: 35px; }
            .header h1 { margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 3px; }
            .header span { color: #6366f1; font-weight: 900; }
            .info { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .info div h2 { margin: 0; font-size: 20px; text-transform: uppercase; }
            .info div p { margin: 5px 0 0; color: #64748b; font-size: 12px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 15px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .total-section { margin-top: 40px; text-align: right; border-top: 2px solid #e2e8f0; padding-top: 25px; }
            .total-box { display: inline-block; background: #f1f5f9; padding: 20px 40px; border-radius: 15px; text-align: right; }
            .total-label { font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .total-value { font-size: 28px; font-weight: 900; color: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JM STUDIO <span>PERSONAL</span></h1>
            <p>Relatório de Atividade Docente Mensal</p>
          </div>
          
          <div class="info">
            <div>
              <h2>${teacher.name.toUpperCase()}</h2>
              <p>ESPECIALIDADE: ${teacher.specialty.toUpperCase()}</p>
            </div>
            <div style="text-align: right">
              <p>MÊS DE REFERÊNCIA: ${monthYear}</p>
              <p>EMITIDO EM: ${todayStr}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Horário da Aula</th>
                <th style="text-align: center;">Quantidade de Aulas Ministradas</th>
              </tr>
            </thead>
            <tbody>
              ${hourRows}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
               <div class="total-label">Total de Aulas no Mês</div>
               <div class="total-value">${totalClasses}</div>
            </div>
          </div>
          
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintAllTeachersReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const monthYear = `${MONTHS_LABELS[selectedMonth]} / ${selectedYear}`;
    
    let teacherRows = teachers.map(teacher => {
      const { totalClasses } = getTeacherAttendanceStats(teacher.checkins);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; font-weight: bold;">${teacher.name.toUpperCase()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; text-align: center;">${teacher.specialty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center; font-weight: 900; color: #4f46e5;">${totalClasses}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Mensal de Professores - ${monthYear}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; }
            .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 25px; margin-bottom: 35px; }
            .header h1 { margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 3px; }
            .header span { color: #4f46e5; font-weight: 900; }
            .summary-info { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; background: #f8fafc; padding: 15px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .footer { margin-top: 50px; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JM STUDIO <span>PERSONAL</span></h1>
            <p>Resumo Mensal de Aulas Ministradas - Equipe Docente</p>
          </div>
          
          <div class="summary-info">
            <div>
              <p style="margin: 0; font-weight: 900; text-transform: uppercase; color: #64748b; font-size: 12px;">Mês de Referência: ${monthYear}</p>
            </div>
            <div style="text-align: right">
              <p style="margin: 0; font-weight: 700; color: #64748b; font-size: 11px;">Emitido em: ${todayStr}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Professor</th>
                <th style="text-align: center;">Especialidade</th>
                <th style="text-align: center;">Total de Aulas</th>
              </tr>
            </thead>
            <tbody>
              ${teacherRows}
            </tbody>
          </table>

          <div class="footer">
            Sistema de Gestão JM Studio Personal - Controle de Frequência Docente
          </div>
          
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- FILTROS ---
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => s.status === StudentStatus.ATIVO)
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm]);

  const filteredTeachersList = useMemo(() => {
    return teachers
      .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers, searchTerm]);

  const monthlyAttendanceData = useMemo(() => {
    return students
      .filter(s => s.status === StudentStatus.ATIVO)
      .map(s => {
        const { monthlyCount } = getAttendanceStats(s.checkins);
        return { student: s, count: monthlyCount };
      })
      .filter(data => data.count > 0 || searchTerm === '')
      .sort((a, b) => b.count - a.count);
  }, [students, selectedMonth, selectedYear]);

  // --- SELEÇÃO EM MASSA (Alunos) ---
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const startBulkSend = () => {
    if (selectedIds.size === 0) return;
    setBulkIndex(0);
    setIsBulkSending(true);
  };

  const sendCurrentAndNext = () => {
    const selectedList = filteredStudents.filter(s => selectedIds.has(s.id));
    const currentStudent = selectedList[bulkIndex];
    if (currentStudent) {
      handleSendWhatsAppReport(currentStudent);
      if (bulkIndex + 1 < selectedList.length) {
        setBulkIndex(prev => prev + 1);
      } else {
        setIsBulkSending(false);
        setSelectedIds(new Set());
        alert("Todos os resumos foram processados!");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Portal de Presença</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-blue-500" /> Controle de Frequência do Estúdio
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button 
              onClick={() => setActiveTab('alunos')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'alunos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Alunos
            </button>
            <button 
              onClick={() => setActiveTab('professores')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'professores' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Professores
            </button>
          </div>
          
          {activeTab === 'alunos' ? (
            <button 
              onClick={() => setShowMonthlyReport(true)}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              <BarChart3 className="w-5 h-5" /> Relatório Alunos
            </button>
          ) : (
            <button 
              onClick={() => setShowTeacherMonthlyReport(true)}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
            >
              <BarChart3 className="w-5 h-5" /> Relatório Mensal
            </button>
          )}
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder={`Buscar por ${activeTab === 'alunos' ? 'aluno' : 'professor'}...`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-3xl pl-16 pr-6 py-6 text-white font-bold text-lg focus:border-blue-600 outline-none transition-all shadow-inner"
        />
      </div>

      {activeTab === 'alunos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => {
            const { weeklyCount, monthlyCount } = getAttendanceStats(student.checkins);
            const hasCheckedInToday = student.checkins?.some(c => new Date(c).toLocaleDateString() === new Date().toLocaleDateString());
            const isSelected = selectedIds.has(student.id);

            return (
              <div 
                key={student.id} 
                onClick={() => toggleSelect(student.id)}
                className={`bg-slate-900/60 border rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden group transition-all cursor-pointer ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-4 right-4">
                  {isSelected ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-800" />}
                </div>

                <div className="flex items-center gap-4 mb-6" onClick={e => e.stopPropagation()}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${hasCheckedInToday ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-white truncate uppercase tracking-tight">{student.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{student.classTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                      title="Histórico"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Na Semana</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white">{weeklyCount}</span>
                      <span className="text-[10px] text-slate-600 font-bold">visitas</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">No Mês</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-blue-500">{monthlyCount}</span>
                      <span className="text-[10px] text-slate-600 font-bold">visitas</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleCheckin(student); }}
                  disabled={hasCheckedInToday}
                  className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
                    hasCheckedInToday 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-95'
                  }`}
                >
                  {hasCheckedInToday ? (
                    <><CheckCircle2 className="w-4 h-4" /> Confirmada</>
                  ) : (
                    <><UserCheck className="w-4 h-4" /> Marcar Presença</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeachersList.map(teacher => {
            const { totalClasses } = getTeacherAttendanceStats(teacher.checkins);
            const todayStr = new Date().toLocaleDateString();
            const checkedToday = teacher.checkins?.filter(c => new Date(c.timestamp).toLocaleDateString() === todayStr);

            return (
              <div key={teacher.id} className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-900/20">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-white truncate uppercase tracking-tight">{teacher.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{teacher.specialty}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTeacher(teacher)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                    title="Relatório Detalhado"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Aulas no Mês</p>
                    <span className="text-2xl font-black text-white">{totalClasses}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Hoje</p>
                    <span className="text-lg font-black text-indigo-400">{checkedToday?.length || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsHourSelectorOpen({ isOpen: true, teacherId: teacher.id })}
                    className="py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Marcar Aula
                  </button>
                  <button 
                    onClick={() => handleSendTeacherWhatsAppReport(teacher)}
                    className="py-4 rounded-2xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Seletor de Horário para Professores */}
      {isHourSelectorOpen.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg"><Clock className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Registrar Aula</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selecione o horário da aula ministrada</p>
                  </div>
                </div>
                <button onClick={() => setIsHourSelectorOpen({ isOpen: false, teacherId: null })} className="p-2 text-slate-400 hover:text-white"><X /></button>
              </div>
              <div className="p-8 grid grid-cols-3 gap-3">
                {CLASS_HOURS.map(hour => {
                  const teacher = teachers.find(t => t.id === isHourSelectorOpen.teacherId);
                  const isCheckedToday = teacher?.checkins?.some(c => 
                    new Date(c.timestamp).toLocaleDateString() === new Date().toLocaleDateString() && c.hour === hour
                  );

                  return (
                    <button 
                      key={hour}
                      onClick={() => teacher && handleTeacherCheckin(teacher, hour)}
                      disabled={isCheckedToday}
                      className={`py-6 rounded-2xl font-black text-sm transition-all border ${
                        isCheckedToday 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 opacity-50 cursor-not-allowed' 
                        : 'bg-slate-950 border-slate-800 text-white hover:border-indigo-600 hover:bg-indigo-600/5'
                      }`}
                    >
                      {hour}
                      {isCheckedToday && <div className="text-[8px] mt-1">Ok</div>}
                    </button>
                  );
                })}
              </div>
              <div className="p-8 border-t border-slate-800 bg-slate-800/10 text-center">
                 <button 
                  onClick={() => setIsHourSelectorOpen({ isOpen: false, teacherId: null })}
                  className="px-10 py-4 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                 >
                   Cancelar
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* NOVO: Modal Relatório Mensal Global Professores */}
      {showTeacherMonthlyReport && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <header className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                <div className="flex items-center gap-5">
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg"><BarChart3 className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Relatório de Equipe</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{MONTHS_LABELS[selectedMonth]} {selectedYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handlePrintAllTeachersReport} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                    <Printer className="w-4 h-4" /> Imprimir Tudo
                  </button>
                  <button onClick={() => setShowTeacherMonthlyReport(false)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"><X className="w-8 h-8" /></button>
                </div>
              </header>
              
              <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map(teacher => {
                    const { totalClasses } = getTeacherAttendanceStats(teacher.checkins);
                    return (
                      <div key={teacher.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-black">{teacher.name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate uppercase">{teacher.name}</p>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{teacher.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-black text-indigo-400">{totalClasses}</div>
                            <div className="text-[8px] text-slate-600 font-black uppercase">Aulas</div>
                          </div>
                          <button onClick={() => { setSelectedTeacher(teacher); setShowTeacherMonthlyReport(false); }} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    );
                  })}
                  {teachers.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-20"><GraduationCap className="w-16 h-16 mx-auto mb-4" /><p className="text-xs font-black uppercase">Nenhum professor cadastrado.</p></div>
                  )}
                </div>
              </div>
              
              <div className="p-8 bg-slate-800/20 border-t border-slate-800 flex justify-end">
                <button onClick={() => setShowTeacherMonthlyReport(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-black px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Fechar Relatório</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Relatório Mensal Professor Individual */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                      {selectedTeacher.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedTeacher.name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Relatório Mensal: {MONTHS_LABELS[selectedMonth]}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handlePrintTeacherReport(selectedTeacher)}
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90"
                    title="Imprimir Relatório"
                   >
                     <Printer className="w-6 h-6" />
                   </button>
                   <button 
                    onClick={() => handleSendTeacherWhatsAppReport(selectedTeacher)}
                    className="p-4 bg-emerald-600/10 text-emerald-500 rounded-2xl border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                    title="WhatsApp"
                   >
                     <MessageSquare className="w-6 h-6" />
                   </button>
                   <button onClick={() => setSelectedTeacher(null)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X className="w-8 h-8" /></button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar space-y-6">
                 {(() => {
                   const { totalClasses, byHour } = getTeacherAttendanceStats(selectedTeacher.checkins);
                   return (
                     <>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800">
                             <p className="text-xs text-slate-500 font-bold uppercase mb-2">Total de Aulas</p>
                             <h4 className="text-4xl font-black text-white">{totalClasses}</h4>
                          </div>
                          <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800">
                             <p className="text-xs text-slate-500 font-bold uppercase mb-2">Especialidade</p>
                             <h4 className="text-lg font-black text-indigo-400 uppercase">{selectedTeacher.specialty}</h4>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-1">Distribuição por Horários</p>
                          <div className="grid grid-cols-1 gap-2">
                             {Object.entries(byHour).map(([hour, count]) => (
                               <div key={hour} className="bg-slate-950/20 border border-slate-800/40 p-4 rounded-2xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black text-slate-400">{hour}</div>
                                     <span className="text-sm font-bold text-white uppercase tracking-tighter">Horário da Aula</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <span className={`text-lg font-black ${count > 0 ? 'text-indigo-400' : 'text-slate-800'}`}>{count}</span>
                                     <span className="text-[9px] text-slate-600 font-black uppercase">Aulas</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                     </>
                   );
                 })()}
              </div>

              <div className="p-8 bg-slate-800/20 border-t border-slate-800 flex justify-end">
                <button onClick={() => setSelectedTeacher(null)} className="bg-slate-800 text-white font-black px-10 py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all">Fechar</button>
              </div>
           </div>
        </div>
      )}

      {/* Barra de Ação Flutuante Alunos */}
      {selectedIds.size > 0 && activeTab === 'alunos' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[190] w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-6 border-4 border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                 <div className="bg-white/20 p-3 rounded-2xl text-white"><CheckSquare className="w-6 h-6" /></div>
                 <div>
                    <p className="text-white font-black text-lg uppercase tracking-tighter leading-none">{selectedIds.size} Alunos Selecionados</p>
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">Envio de resumos individuais</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedIds(new Set())} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">Cancelar</button>
                 <button onClick={startBulkSend} className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-lg hover:bg-blue-50 transition-all active:scale-95"><MessageSquare className="w-4 h-4" /> Enviar Resumos</button>
              </div>
           </div>
        </div>
      )}

      {/* Assistente Envio Massa Alunos */}
      {isBulkSending && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b border-slate-800 bg-blue-600/10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white"><Send className="w-6 h-6" /></div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">Assistente de Envio</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">WhatsApp Individual</p>
                    </div>
                 </div>
                 <button onClick={() => setIsBulkSending(false)} className="p-2 text-slate-500 hover:text-white"><X /></button>
              </div>
              <div className="p-10 flex flex-col items-center text-center space-y-8">
                 <div className="w-full space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                       <span>Progresso</span>
                       <span>{bulkIndex + 1} de {selectedIds.size}</span>
                    </div>
                    <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                       <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((bulkIndex + 1) / selectedIds.size) * 100}%` }} />
                    </div>
                 </div>
                 {(() => {
                    const selectedList = filteredStudents.filter(s => selectedIds.has(s.id));
                    const current = selectedList[bulkIndex];
                    if (!current) return null;
                    return (
                      <div className="space-y-6 animate-in zoom-in duration-300">
                         <div className="w-24 h-24 rounded-3xl bg-blue-600/10 flex items-center justify-center mx-auto text-4xl font-black text-blue-500">{current.name.charAt(0)}</div>
                         <div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{current.name}</h4>
                            <p className="text-slate-500 font-bold text-xs mt-1">{current.phone}</p>
                         </div>
                         <button onClick={sendCurrentAndNext} className="w-full bg-blue-600 hover:bg-blue-50 text-white font-black py-6 rounded-2xl shadow-xl uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-all">
                            {bulkIndex + 1 === selectedIds.size ? 'Finalizar e Enviar' : 'Abrir WhatsApp e Próximo'} <ChevronRight className="w-5 h-5" />
                         </button>
                      </div>
                    );
                 })()}
              </div>
           </div>
        </div>
      )}

      {/* Modais originais Alunos */}
      {showMonthlyReport && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col">
            <header className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-5">
                <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg"><BarChart3 className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Relatório de Frequência</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{MONTHS_LABELS[selectedMonth]} {selectedYear}</p>
                </div>
              </div>
              <button onClick={() => setShowMonthlyReport(false)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X className="w-8 h-8" /></button>
            </header>
            <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthlyAttendanceData.map(({ student, count }) => (
                  <div key={student.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-black">{student.name.charAt(0)}</div>
                      <div className="min-w-0"><p className="text-sm font-bold text-white truncate uppercase">{student.name}</p><p className="text-[9px] text-slate-600 font-black uppercase">{student.classTime}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right"><div className="text-xl font-black text-blue-500">{count}</div><div className="text-[8px] text-slate-600 font-black uppercase">Visitas</div></div>
                      <button onClick={() => handleSendWhatsAppReport(student)} className="p-2 bg-emerald-600/10 text-emerald-500 rounded-lg"><MessageSquare className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">{selectedStudent.name.charAt(0)}</div>
                <div><h3 className="text-2xl font-black text-white uppercase tracking-tighter truncate max-w-[200px]">{selectedStudent.name}</h3><p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Histórico</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSendWhatsAppReport(selectedStudent)} className="p-4 bg-emerald-600/10 text-emerald-500 rounded-2xl transition-all active:scale-90"><MessageSquare className="w-6 h-6" /></button>
                <button onClick={() => setSelectedStudent(null)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-400"><X className="w-8 h-8" /></button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar space-y-3">
              {selectedStudent.checkins?.map((checkin, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4"><Calendar className="w-5 h-5 text-blue-500" /><span className="text-white font-bold text-sm uppercase">{new Date(checkin).toLocaleDateString('pt-BR')}</span></div>
                  <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase"><Clock className="w-3.5 h-3.5" />{new Date(checkin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinView;
