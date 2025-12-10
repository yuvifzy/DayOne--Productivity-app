import { GoogleGenAI, Type } from "@google/genai";
import { Task, Subtask } from '../types';

// NOTE: In a real production app, you should proxy these requests through your backend 
// to keep your API key secure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const GeminiService = {
  /**
   * Generates a suggested breakdown of subtasks based on the task title and description.
   */
  generateSubtasks: async (title: string, description: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
      console.warn("No API Key provided for Gemini.");
      return ["Configure API Key to use AI features"];
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I have a task titled "${title}" with the description: "${description}". 
        Please break this down into 3 to 6 actionable subtasks. 
        Return ONLY a JSON array of strings. Do not include markdown formatting.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      return [];
    }
  },

  /**
   * Suggests a priority level based on the task content.
   */
  suggestPriority: async (title: string, description: string): Promise<string | null> => {
     if (!process.env.API_KEY) return null;

     try {
       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `Based on this task: "${title}" - "${description}", suggest a priority level from [LOW, MEDIUM, HIGH, URGENT]. Return only the word.`,
         config: {
           maxOutputTokens: 10,
         }
       });
       return response.text?.trim().toUpperCase() || null;
     } catch (e) {
       return null;
     }
  }
};