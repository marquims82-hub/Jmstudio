
import { GoogleGenAI } from "@google/genai";

export const generateWorkoutPlan = async (studentName: string, goal: string) => {
  try {
    // Inicializa a instância do SDK imediatamente antes da chamada
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Utilizando gemini-3-pro-preview para tarefas de texto complexas como prescrição profissional
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Crie um plano de treino semanal de academia para o aluno(a) ${studentName}. O objetivo é ${goal}. Retorne apenas o plano de treino formatado em Markdown, com dias da semana e exercícios sugeridos. Seja profissional e direto.`,
      config: {
        thinkingConfig: { thinkingBudget: 2000 } // Adicionando um pequeno budget de pensamento para melhor qualidade
      }
    });
    
    // Acessando a propriedade .text (não é um método) conforme as diretrizes
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    return "Desculpe, não foi possível gerar o treino no momento. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
