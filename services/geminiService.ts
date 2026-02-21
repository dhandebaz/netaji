
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PROJECT_CONTEXT } from './projectContext';
import { Politician, RTITask } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const isAIAvailable = (): boolean => {
  return ai !== null && API_KEY.length > 0;
};

export const getAIStatus = (): { available: boolean; message: string } => {
  if (!API_KEY) {
    return {
      available: false,
      message: 'Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to enable AI features.',
    };
  }
  return { available: true, message: 'AI features are enabled.' };
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CodeReviewResult {
  security: string[];
  performance: string[];
  accessibility: string[];
  codeDiff: string;
  modelUsed?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  estimatedCost?: string;
}

export interface ComparisonAnalysis {
  executiveSummary: string;
  transparencyScores: {
    politicianId: number;
    score: number; // 0-100
    reason: string;
  }[];
  keyDifferentiators: string[];
  verdict: string;
}

export interface PoliticianInsights {
  biography: string;
  ideology: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

/**
 * Helper to retry AI calls with exponential backoff
 */
async function retryAI<T>(
  operation: () => Promise<T>, 
  retries = 3, 
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Check if it's a transient error (e.g. rate limit 429 or server error 5xx)
    const isTransient = error.message?.includes('429') || error.message?.includes('500') || error.message?.includes('503');
    
    if (isTransient) {
      console.warn(`AI call failed, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryAI(operation, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

/**
 * Extracts the Voter ID number from an image using Gemini Vision.
 * Uses gemini-2.5-flash for low latency.
 */
export const extractVoterIdFromImage = async (base64Data: string, mimeType: string): Promise<string | null> => {
  if (!ai) {
    console.error("AI not available - API key not configured");
    return null;
  }
  
  return retryAI(async () => {
    try {
      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64
              }
            },
            {
              text: "Extract the Voter ID (EPIC Number) from this Indian Voter ID card. Return ONLY the alphanumeric ID number. If not found, return 'NOT_FOUND'."
            }
          ]
        },
        config: {
          temperature: 0.1, // Low temperature for deterministic OCR
        }
      });
  
      const text = response.text?.trim();
      if (!text || text === 'NOT_FOUND') return null;
      
      // Basic cleanup to remove any markdown or extra spaces
      return text.replace(/[^A-Z0-9]/g, '');
    } catch (error) {
      console.error("OCR Failed:", error);
      throw error; // Re-throw for retry mechanism
    }
  });
};

/**
 * Generates feature code based on the project context.
 * Uses gemini-3-pro-preview for complex reasoning and coding.
 */
export const generateFeatureCode = async (request: string, onProgress?: (log: string) => void): Promise<CodeReviewResult> => {
  const log = (msg: string) => {
      console.info(`[NetaAI] ${msg}`);
      if (onProgress) onProgress(msg);
  };

  log("Initializing Gemini 3.0 Pro Agent...");

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      security: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of security considerations or audits passed."
      },
      performance: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of performance optimizations applied."
      },
      accessibility: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of accessibility improvements (ARIA, etc)."
      },
      codeDiff: {
        type: Type.STRING,
        description: "The unified diff string applying changes to the codebase. Must use valid diff format."
      }
    },
    required: ["security", "performance", "accessibility", "codeDiff"]
  };

  const prompt = `
    You are 'NetaAI', a Principal React Engineer.
    
    Request: "${request}"

    PROJECT CONTEXT:
    ${PROJECT_CONTEXT}

    TASK:
    1. Analyze the request and the existing codebase structure.
    2. Generate the necessary React/TypeScript code.
    3. Create a valid UNIFIED DIFF to apply these changes.
    4. Audit the code for Security, Performance, and Accessibility.
  `;

  if (!ai) {
    throw new Error("AI not available - please configure NEXT_PUBLIC_GEMINI_API_KEY");
  }

  try {
    log("Sending context to Neural Core...");
    const startTime = performance.now();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Precise generation
        systemInstruction: "You are an expert coding assistant. Always produce valid JSON matching the schema.",
      }
    });

    const endTime = performance.now();
    log(`Generated in ${((endTime - startTime) / 1000).toFixed(2)}s`);

    if (!response.text) {
      throw new Error("Empty response from model");
    }

    log("Parsing structured output...");
    const result = JSON.parse(response.text) as CodeReviewResult;

    const usage = {
      prompt_tokens: prompt.length / 4,
      completion_tokens: response.text.length / 4,
      total_tokens: (prompt.length + response.text.length) / 4
    };

    return {
      ...result,
      modelUsed: "gemini-3-pro-preview",
      usage: usage,
      estimatedCost: "Free (Preview)"
    };

  } catch (error: any) {
    log(`❌ Generation Failed: ${error.message}`);
    throw error;
  }
};

/**
 * Analyzes multiple politicians for comparison using Gemini.
 * Uses gemini-2.5-flash for fast analysis.
 */
export const generateComparisonAnalysis = async (politicians: Politician[]): Promise<ComparisonAnalysis> => {
  if (!ai) {
    throw new Error("AI not available - please configure NEXT_PUBLIC_GEMINI_API_KEY");
  }
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING, description: "A neutral, 2-3 sentence summary comparing the candidates." },
      transparencyScores: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            politicianId: { type: Type.INTEGER },
            score: { type: Type.INTEGER, description: "Score from 0-100 based on data completeness and clean record." },
            reason: { type: Type.STRING, description: "Short reason for the score." }
          },
          required: ["politicianId", "score", "reason"]
        }
      },
      keyDifferentiators: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 3 key differences (e.g. Assets, Crime, Experience)." 
      },
      verdict: { type: Type.STRING, description: "An objective concluding statement about the choice." }
    },
    required: ["executiveSummary", "transparencyScores", "keyDifferentiators", "verdict"]
  };

  // Minimize payload
  const minData = politicians.map(p => ({
    id: p.id,
    name: p.name,
    party: p.party,
    assets: p.totalAssets,
    cases: p.criminalCases,
    education: p.education,
    approval: p.approvalRating
  }));

  const prompt = `
    Analyze these political candidates neutrally.
    Data: ${JSON.stringify(minData)}
    
    Task:
    1. Compare assets, criminal history, and education.
    2. Calculate a 'Transparency Score' (Higher is better. Deduct points for criminal cases and hidden assets).
    3. Provide objective differentiators.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3
      }
    });

    if (!response.text) throw new Error("No analysis generated");
    return JSON.parse(response.text) as ComparisonAnalysis;

  } catch (error) {
    console.error("Analysis Failed:", error);
    throw error;
  }
};

/**
 * Drafts a formal RTI Application using Gemini.
 */
export const draftRTIApplication = async (task: RTITask, volunteerName: string, volunteerAddress: string): Promise<string> => {
  if (!ai) {
    throw new Error("AI not available - please configure NEXT_PUBLIC_GEMINI_API_KEY");
  }
  
  const prompt = `
    Draft a formal Right to Information (RTI) application for India.
    Applicant: ${volunteerName}, Address: ${volunteerAddress}.
    Public Information Officer details: ${task.pioDetails?.name || "The PIO"}, ${task.pioDetails?.address || "Office Address"}.
    Subject: Information regarding ${task.topic} related to politician ${task.politicianName}.
    
    Requirements:
    - Formal tone suitable for government correspondence.
    - Cite relevant sections of the RTI Act 2005 (e.g., Section 6(1), Section 4(1)(b) if relevant to public works).
    - Clearly list the information sought in numbered points based on the topic "${task.topic}".
    - Include standard declarations about citizenship and fee payment.
    - Format as a plain text letter starting with "To,".
    - Do not include placeholders like [Date] - assume today.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    });

    return response.text || "Failed to generate application draft. Please try again.";
  } catch (error) {
    console.error("RTI Drafting Failed:", error);
    return rtiFallback();
  }
};

/**
 * Generates a SWOT analysis and Bio for a politician.
 */
export const generatePoliticianInsights = async (politician: Politician): Promise<PoliticianInsights> => {
    if (!ai) {
      throw new Error("AI not available - please configure NEXT_PUBLIC_GEMINI_API_KEY");
    }
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            biography: { type: Type.STRING, description: "A 2-paragraph professional biography highlighting career and key roles." },
            ideology: { type: Type.STRING, description: "One sentence summary of their political ideology and focus areas." },
            swot: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 strengths" },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 weaknesses" },
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 political opportunities" },
                    threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 threats to their career" }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
            }
        },
        required: ["biography", "ideology", "swot"]
    };

    const prompt = `
        Generate a strategic SWOT analysis and biography for: ${politician.name} (${politician.party}, ${politician.state}).
        
        Context:
        - Age: ${politician.age}
        - Assets: ${politician.totalAssets} Cr
        - Criminal Cases: ${politician.criminalCases}
        - Education: ${politician.education}
        - Recent Role: ${politician.history[0]?.position || 'Politician'}
        - Win Status: ${politician.history[0]?.result || 'Unknown'}
        
        Provide a balanced, objective political analysis.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.4
            }
        });

        if (!response.text) throw new Error("No insights generated");
        return JSON.parse(response.text) as PoliticianInsights;
    } catch (error) {
        console.error("Insight Generation Failed:", error);
        return politicianInsightsFallback(politician);
    }
};

/**
 * Runs a chat session with Neta Assistant.
 */
export const runNetaAIChat = async (history: ChatMessage[], message: string): Promise<string> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "I am currently in offline mode because the AI service is not configured. " + 
           "I can only help with basic information that is already available on the page. " +
           "Please check back later for full AI capabilities.";
  }
  
  try {
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are Neta Assistant, a digital assistant for Indian citizens. Your goal is to provide accurate, neutral information about politicians, elections, and civic rights (RTI). Use the provided context about politicians if relevant. Be concise and helpful.",
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

const rtiFallback = (): string => {
  return "AI is currently unavailable. Please draft the RTI application manually using standard RTI format.";
};

const politicianInsightsFallback = (politician: Politician): PoliticianInsights => {
  return {
    biography: `Insights are temporarily unavailable for ${politician.name}.`,
    ideology: "Insights are temporarily unavailable.",
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
  };
};
