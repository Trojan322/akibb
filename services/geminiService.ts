
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

  async editImage(base64Image: string, prompt: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing from the environment.");

    const ai = new GoogleGenAI({ apiKey });
    
    // Cleanup base64 string
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/png';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `You are a professional image editor. 
              TASK: ${prompt}.
              RULES:
              1. Modify ONLY the parts of the image specified.
              2. Keep all other details and the overall style identical.
              3. If asked to change a color, preserve the original lighting and texture.
              4. Return only the edited image.`,
            },
          ],
        },
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("আদিব ভাই ইমেজটি জেনারেট করতে পারেননি। প্রম্পটটি অন্যভাবে দিন।");
    } catch (error: any) {
      console.error("Gemini Edit Error:", error);
      throw new Error(error.message || "এআই সার্ভিস কাজ করছে না।");
    }
  }
}