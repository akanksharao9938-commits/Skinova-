import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in the environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export interface DiagnosisResult {
  condition: string;
  confidence: number;
  description: string;
  risk_score: number;
  urgency: "Low" | "Medium" | "High";
  recommendations: string[];
  dietary_advice: string[];
  lifestyle_adjustments: string[];
}

export async function analyzeSkinImage(base64Image: string, userProfile: any): Promise<DiagnosisResult> {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this skin image for potential dermatological conditions.
    User Profile:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Diet: ${userProfile.diet}
    - Lifestyle: ${userProfile.lifestyle}
    - Skin Type: ${userProfile.skin_type}

    Provide a detailed diagnosis in JSON format.
    Include:
    - condition: Name of the likely condition
    - confidence: Confidence level (0-1)
    - description: Brief medical description
    - risk_score: 0-100 score
    - urgency: Low, Medium, or High
    - recommendations: List of immediate actions
    - dietary_advice: Specific foods to eat or avoid
    - lifestyle_adjustments: Changes to daily habits

    DISCLAIMER: This is an AI-assisted analysis and not a definitive medical diagnosis. Always consult a professional dermatologist.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            risk_score: { type: Type.NUMBER },
            urgency: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            dietary_advice: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifestyle_adjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["condition", "confidence", "description", "risk_score", "urgency", "recommendations", "dietary_advice", "lifestyle_adjustments"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error in analyzeSkinImage:", error);
    throw error;
  }
}

export async function generateMealPlan(condition: string, userProfile: any) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a 7-day anti-inflammatory skin-health meal plan for a person with ${condition}. 
  User Profile:
  - Age: ${userProfile.age}
  - Gender: ${userProfile.gender}
  - Diet: ${userProfile.diet}
  - Skin Type: ${userProfile.skin_type}

  Return a JSON array of 7 objects. Each object MUST have:
  - "day": e.g., "Day 1 - Monday 🥗"
  - "meals": An array of 4 strings (Breakfast 🍳, Lunch 🥗, Snack 🍎, Dinner 🍲)

  Ensure the meals are specifically helpful for ${condition}.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              meals: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["day", "meals"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Clean markdown if present
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", cleanedText);
      return [];
    }
  } catch (error) {
    console.error("Error in generateMealPlan:", error);
    throw error;
  }
}
