
export enum StudentStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  PENDENTE = 'Pendente'
}

export interface CompanyProfile {
  name: string;
  document: string;
  address: string;
  phone: string;
  email: string;
  primaryColor: string;
  registeredAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface PaymentRecord {
  month: number;
  year: number;
  status: 'paid' | 'pending';
  receipt?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'aluguel' | 'energia' | 'manutencao' | 'marketing' | 'outros';
}

export interface WorkoutPlan {
  id: string;
  date: string;
  goal: string;
  plan: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  birthDate: string;
  monthlyFee: number;
  billingDay: number;
  classTime: string;
  joinDate: string;
  status: StudentStatus;
  observations?: string;
  payments?: PaymentRecord[];
  workouts?: WorkoutPlan[];
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  salary: number;
  hireDate: string;
}

export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  CADASTRO = 'CADASTRO',
  ALUNOS = 'ALUNOS',
  TURMAS = 'TURMAS',
  PAGAMENTOS = 'PAGAMENTOS',
  PROFESSORES = 'PROFESSORES',
  FINANCEIRO = 'FINANCEIRO',
  TREINO = 'TREINO',
  CALENDARIO = 'CALENDARIO',
  RELATORIOS = 'RELATORIOS',
  CONFIGURACAO = 'CONFIGURACAO'
}

export interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  primaryName: string;
}

export const PRIMARY_COLORS = [
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Rosa', hex: '#f43f5e' },
  { name: 'Laranja', hex: '#f59e0b' },
];

export const CLASS_HOURS = [
  '05:00', '06:00', '07:00', '08:00',
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const MONTHS_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];
