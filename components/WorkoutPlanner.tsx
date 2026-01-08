
import React, { useState, useMemo } from 'react';
import { Dumbbell, Sparkles, Loader2, Send, Download, History, Calendar, Target, User, ArrowRight, CheckCircle2, ChevronRight, ClipboardList, Trash2, Printer } from 'lucide-react';
import { Student, WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';

interface WorkoutPlannerProps {
  students: Student[];
  onUpdateStudent?: (student: Student) => void;
}

const QUICK_GOALS = [
  "Hipertrofia Muscular (Foco em Ganho de Massa)",
  "Emagrecimento e Definição (Foco em queima calórica)",
  "Condicionamento para Iniciante (Adaptação)",
  "Força Pura (Powerlifting Style)",
  "Treino em Casa (Sem equipamentos)",
  "Foco em Membros Inferiores e Glúteos"
];

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ students, onUpdateStudent }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'novo' | 'historico'>('novo');
  const [currentPlanPreview, setCurrentPlanPreview] = useState<string | null>(null);

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId)
  , [students, selectedStudentId]);

  const handleGenerate = async () => {
    if (!selectedStudent || !goal) return;
    
    setIsGenerating(true);
    setCurrentPlanPreview(null);
    
    try {
      const workout = await generateWorkoutPlan(selectedStudent.name, goal);
      if (workout) {
        setCurrentPlanPreview(workout);
      }
    } catch (error) {
      console.error(error);
      alert("Falha na comunicação com a IA. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToStudent = () => {
    if (!selectedStudent || !currentPlanPreview || !onUpdateStudent) return;

    const newWorkout: WorkoutPlan = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      goal: goal,
      plan: currentPlanPreview
    };

    const updatedStudent: Student = {
      ...selectedStudent,
      workouts: [newWorkout, ...(selectedStudent.workouts || [])]
    };

    onUpdateStudent(updatedStudent);
    setCurrentPlanPreview(null);
    setGoal('');
    setActiveTab('historico');
    alert(`Treino salvo com sucesso para ${selectedStudent.name}!`);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (!selectedStudent || !onUpdateStudent) return;
    if (!confirm("Excluir este treino permanentemente?")) return;

    const updatedStudent: Student = {
      ...selectedStudent,
      workouts: (selectedStudent.workouts || []).filter(w => w.id !== workoutId)
    };

    onUpdateStudent(updatedStudent);
  };

  const handlePrint = (plan: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2, h3 { color: #1e40af; margin-top: 30px; }
            pre { white-space: pre-wrap; font-family: inherit; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>JM STUDIO PERSONAL - Plano de Treino</h1>
          <h2>Aluno: ${selectedStudent?.name}</h2>
          <p><strong>Objetivo:</strong> ${title}</p>
          <div class="content">${plan.replace(/\n/g, '<br/>')}</div>
          <div class="footer">Gerado via JM Studio Intelligence em ${new Date().toLocaleDateString()}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">JM Intelligence</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" /> Prescrição de treinos com Gemini IA
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('novo')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'novo' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Nova Prescrição
          </button>
          <button 
            onClick={() => setActiveTab('historico')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'historico' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Histórico
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Painel de Configuração */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 blur-[50px] rounded-full" />
            
            <div className="relative space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Selecionar Aluno
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione o Aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.classTime})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-blue-500" /> Objetivo ou Restrições
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ex: Hipertrofia para iniciante, possui lesão no joelho esquerdo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold h-40 resize-none focus:border-blue-600 outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sugestões Rápidas</label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_GOALS.map(g => (
                    <button 
                      key={g} 
                      onClick={() => setGoal(g)}
                      className={`text-[9px] font-black uppercase px-3 py-2 rounded-lg border transition-all ${goal === g ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      {g.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={isGenerating || !selectedStudentId || !goal}
                onClick={handleGenerate}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Gerando Treino...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Gerar Treino Master
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Área de Visualização */}
        <div className="xl:col-span-8">
          {activeTab === 'novo' ? (
            <div className="h-full flex flex-col">
              {currentPlanPreview ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in duration-300">
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                       <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                          <ClipboardList className="w-6 h-6 text-white" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Treino Sugerido</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personalizado para {selectedStudent?.name}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handlePrint(currentPlanPreview, goal)}
                        className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all shadow-lg active:scale-90"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleSaveToStudent}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-emerald-900/30 uppercase text-[10px] tracking-widest active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Aplicar ao Aluno
                      </button>
                    </div>
                  </header>

                  <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed whitespace-pre-wrap text-sm custom-scrollbar max-h-[60vh] overflow-y-auto pr-4">
                    {currentPlanPreview}
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center space-y-6">
                  {isGenerating ? (
                    <div className="space-y-6">
                       <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto relative">
                          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                          <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-ping" />
                       </div>
                       <div>
                         <p className="text-white font-black uppercase tracking-widest text-lg">Aguarde a IA do JM Studio...</p>
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 animate-pulse">Criando periodização biomecânica otimizada</p>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-800/40 p-8 rounded-[2.5rem]">
                        <Dumbbell className="w-16 h-16 text-slate-700 mx-auto" />
                      </div>
                      <div className="max-w-md">
                        <p className="text-white font-black text-xl uppercase tracking-tighter">Pronto para prescrever?</p>
                        <p className="text-slate-500 font-bold text-sm mt-2">Selecione um aluno e defina um objetivo para gerar um treino técnico completo em segundos.</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
              {!selectedStudentId ? (
                <div className="h-full bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center">
                  <History className="w-16 h-16 text-slate-700 mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione um aluno para ver o histórico de treinos</p>
                </div>
              ) : !selectedStudent?.workouts || selectedStudent.workouts.length === 0 ? (
                <div className="h-full bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center">
                  <ClipboardList className="w-16 h-16 text-slate-700 mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Este aluno ainda não possui treinos registrados</p>
                </div>
              ) : (
                selectedStudent.workouts.map((w, idx) => (
                  <div key={w.id} className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-top duration-500">
                    <header className="flex items-start justify-between mb-8 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${idx === 0 ? 'bg-blue-600' : 'bg-slate-800'}`}>
                          {idx === 0 ? <Sparkles className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter">{w.goal.split('(')[0]}</h4>
                            {idx === 0 && <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-md font-black uppercase animate-pulse">Atual</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Prescrito em {new Date(w.date).toLocaleDateString()} às {new Date(w.date).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => handlePrint(w.plan, w.goal)}
                          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                         >
                           <Printer className="w-4 h-4" />
                         </button>
                         <button 
                          onClick={() => handleDeleteWorkout(w.id)}
                          className="p-3 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition-all"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </header>
                    <div className="prose prose-invert max-w-none text-slate-400 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar pr-4">
                      {w.plan}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;
