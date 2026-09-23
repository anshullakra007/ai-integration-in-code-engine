import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (API_KEY && API_KEY !== "your_api_key_here") {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
};

export const analyzeError = async (code, language, errorOutput) => {
  try {
    const model = getGeminiModel();
    const prompt = `
You are an expert ${language} debugger. The user ran the following code and got an error.

Code:
\`\`\`${language}
${code}
\`\`\`

Error Output:
\`\`\`
${errorOutput}
\`\`\`

1. Explain exactly what caused this error in 1-2 short sentences.
2. Provide the corrected code. Only provide the snippet that needs to change or the full code if necessary, but keep it concise.
`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with AI assistant: " + error.message;
  }
};

export const askAssistant = async (history, message, context) => {
  try {
    const model = getGeminiModel();
    const chat = model.startChat({
      history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
    });

    const fullMessage = `
User Context (do not mention unless relevant to the user's question):
Language: ${context.language}
Current Code:
\`\`\`${context.language}
${context.code}
\`\`\`

User Question: ${message}
`;
    const result = await chat.sendMessage(fullMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with AI assistant: " + error.message;
  }
};
