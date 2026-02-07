
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";

export const generateWorkoutPlan = async (studentName: string, goal: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Crie um plano de treino semanal de academia para o aluno(a) ${studentName}. O objetivo é ${goal}. Retorne apenas o plano de treino formatado em Markdown, com dias da semana e exercícios sugeridos. Seja profissional e direto.`,
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    return "Desculpe, não foi possível gerar o treino no momento.";
  }
};

export const generateOverdueAlertMessage = async (overdueCount: number, studentsNames: string[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      /* Corrected model name from gemini-3-flash-lite-latest to gemini-3-flash-preview */
      model: "gemini-3-flash-preview",
      contents: `Temos ${overdueCount} alunos em atraso no JM Studio: ${studentsNames.join(', ')}. Gere uma frase curta de alerta para o administrador, mencionando obrigatoriamente os nomes dos alunos (ou os primeiros se forem muitos) e incentivando a cobrança de forma profissional. Máximo 20 palavras.`,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar alerta:", error);
    return null;
  }
};

export const generateBirthdayGreeting = async (studentName: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      /* Corrected model name from gemini-3-flash-lite-latest to gemini-3-flash-preview */
      model: "gemini-3-flash-preview",
      contents: `Hoje é aniversário do aluno(a) ${studentName} no JM Studio. Gere uma mensagem super curta e motivadora de aniversário (máximo 12 palavras) com tema de academia/fitness.`,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar saudação:", error);
    return `Parabéns, ${studentName}! 🎉 Dia de treino e comemoração!`;
  }
};
