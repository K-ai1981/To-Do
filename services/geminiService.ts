import { GoogleGenAI, Type } from "@google/genai";
import { Subtask } from "../types";

// Initialize Gemini Client
// Note: In a real production build, ensure process.env.API_KEY is replaced during build time or available in runtime environment.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateSubtasks = async (taskText: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Skipping AI generation.");
    // Fallback for demo purposes if key is missing to prevent crash
    return ["Plan the task", "Execute step 1", "Review results"]; 
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Break down the following task into 3 to 5 actionable subtasks. Keep them concise. Task: "${taskText}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr) as string[];

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return [];
  }
};
