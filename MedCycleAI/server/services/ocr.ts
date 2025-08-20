import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function extractMedicineData(imagePath: string): Promise<{
  name?: string;
  company?: string;
  expiryDate?: string;
  batchNumber?: string;
  dosage?: string;
  confidence: number;
  extractedText: string;
}> {
  try {
    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract medicine information from this package image. Look for:
              1. Medicine name
              2. Company/manufacturer name
              3. Expiry date
              4. Batch number
              5. Dosage/strength
              
              Respond with JSON in this format:
              {
                "name": "extracted medicine name",
                "company": "manufacturer name",
                "expiryDate": "expiry date in any format found",
                "batchNumber": "batch number",
                "dosage": "dosage/strength",
                "confidence": number (0-1),
                "extractedText": "all visible text on package"
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      name: result.name || "",
      company: result.company || "",
      expiryDate: result.expiryDate || "",
      batchNumber: result.batchNumber || "",
      dosage: result.dosage || "",
      confidence: result.confidence || 0,
      extractedText: result.extractedText || ""
    };
  } catch (error) {
    console.error("OCR extraction error:", error);
    return {
      confidence: 0,
      extractedText: "OCR service unavailable"
    };
  }
}
