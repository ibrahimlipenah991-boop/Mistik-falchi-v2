import { GoogleGenerativeAI } from "@google/generative-ai";

// Bu kod istifadəçinin brauzerində deyil, Vercel serverində işləyir.
// Ona görə də burada API Key təhlükəsizdir.
export default async function handler(req, res) {
  
  // CORS icazələri (Saytın işləməsi üçün)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnız POST sorğusu qəbul edilir' });
  }

  try {
    const { name, question } = req.body;
    
    // API Key Vercel-in "Environment Variables" bölməsindən oxunur
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Serverdə API Key tapılmadı." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Sən mistik, qədim və müdrik bir falçısan.
    İstifadəçinin adı: ${name}.
    Sualı: ${question || "Ümumi gələcəyim haqqında nə deyə bilərsən?"}.
    Bu istifadəçiyə 2-3 cümləlik, sirli, bir az metaforik amma ümidverici bir cavab ver. 
    Falçı kimi danış.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("AI Xətası:", error);
    return res.status(500).json({ error: "Falçıya əlaqə kəsildi..." });
  }
}