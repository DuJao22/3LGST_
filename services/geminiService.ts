import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY not found in environment variables");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "Descrição automática indisponível (Chave API não configurada).";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Escreva uma descrição atraente, curta e comercial para um produto de loja de produtos naturais.
            Produto: ${productName}
            Categoria: ${category}
            Foque nos benefícios para saúde e bem-estar. Máximo de 2 parágrafos.`,
        });
        return response.text || "Sem descrição gerada.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Erro ao gerar descrição com IA.";
    }
};

export const analyzeSalesTrends = async (salesSummary: string): Promise<string> => {
     const ai = getClient();
    if (!ai) return "Análise indisponível.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise brevemente estes dados de vendas de uma loja de ervas e sugira uma ação para o gerente: ${salesSummary}`,
        });
        return response.text || "Sem análise.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Erro ao analisar dados.";
    }
}
