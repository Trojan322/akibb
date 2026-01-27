
import { GoogleGenAI } from "@google/genai";

export class GeminiImageService {
  private static instance: GeminiImageService;
  private constructor() {}

  public static getInstance(): GeminiImageService {
    if (!GeminiImageService.instance) {
      GeminiImageService.instance = new GeminiImageService();
    }
    return GeminiImageService.instance;
  }

  async editImagePart(base64Image: string, prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = base64Image.split(',')[1] || base64Image;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: `SYSTEM INSTRUCTION: You are a professional photo retoucher and artist. 
              USER COMMAND: ${prompt}.
              EXECUTION RULES:
              1. Identify the SPECIFIC parts or objects mentioned in the user command.
              2. Edit ONLY those specific parts. Leave the rest of the image pixels UNCHANGED (bit-perfect where possible).
              3. If the user says "add something", place it naturally.
              4. If the user says "change color", modify only that object's color while preserving texture.
              5. Ensure the final result looks photorealistic and professional.`,
            },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("আদিব ভাই ছবিটি এডিট করতে পারছেন না। অন্যভাবে চেষ্টা করুন।");
    } catch (error: any) {
      console.error("AI Service Fault:", error);
      throw error;
    }
  }
}