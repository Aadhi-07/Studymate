
import { GoogleGenAI, Type } from "@google/genai";
import { QuizItem, QuestionsSet, StudyPlan, Flashcard } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeText = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please summarize the following educational content in a structured, concise manner suitable for a college student's review notes:\n\n${text}`,
  });
  return response.text || "Failed to generate summary.";
};

export const generateQuestions = async (text: string): Promise<QuestionsSet> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following notes, generate a set of questions in three categories:
    1. 2-mark (Short conceptual questions)
    2. 5-mark (Brief explanations)
    3. 10-mark (In-depth analysis/essay questions)
    
    Notes: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marks2: { type: Type.ARRAY, items: { type: Type.STRING } },
          marks5: { type: Type.ARRAY, items: { type: Type.STRING } },
          marks10: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["marks2", "marks5", "marks10"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse questions", e);
    return { marks2: [], marks5: [], marks10: [] };
  }
};

export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create 8 study flashcards from the following notes. Each card should have a 'front' (term or question) and a 'back' (definition or concise answer).\n\nNotes: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse flashcards", e);
    return [];
  }
};

export const generateQuiz = async (text: string): Promise<QuizItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create 5 Multiple Choice Questions based on these notes. Include options, the index of the correct answer (0-3), and a brief explanation.\n\nNotes: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "answer", "explanation"]
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
};

export const askAI = async (notes: string, question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Context Notes:\n${notes}\n\nStudent Question: ${question}\n\nAnswer the student's question based strictly on the context provided. If the information is not in the notes, say so politely.`,
  });
  return response.text || "I couldn't find an answer in your notes.";
};

export const generateStudyPlan = async (examName: string, examDate: string, syllabus: string, numDays: number): Promise<StudyPlan> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a highly detailed, day-by-day study plan for the exam "${examName}" which is on ${examDate}. 
    There are exactly ${numDays} days remaining until the exam. 
    Based on the syllabus: ${syllabus}, break down the content into manageable daily goals for ALL ${numDays} days.
    The plan should cover the entire period from now until the day before the exam.
    For each day, provide: 
    1) A clear 'topic', 
    2) A specific 'focus', 
    3) A 'strategy' (detailed explanation of HOW to study this).
    Ensure the JSON response contains exactly ${numDays} items in the 'plan' array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          examName: { type: Type.STRING },
          examDate: { type: Type.STRING },
          plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                topic: { type: Type.STRING },
                focus: { type: Type.STRING },
                strategy: { type: Type.STRING }
              },
              required: ["day", "topic", "focus", "strategy"]
            }
          }
        },
        required: ["examName", "examDate", "plan"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse study plan", e);
    return { examName: "", examDate: "", plan: [] };
  }
};
