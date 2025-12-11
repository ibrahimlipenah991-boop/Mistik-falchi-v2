import OpenAI from 'openai';

export default async function handler(req, res) {
  
  // CORS İcazələri (Saytın işləməsi üçün vacibdir)
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
    return res.status(405).json({ error: 'Yalnız POST qəbul edilir' });
  }

  try {
    const { name, question } = req.body;
    
    // Vercel-dən Key-i oxuyuruq
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Serverdə API Key tapılmadı." });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Ən sürətli və sərfəli model
      messages: [
        { 
            role: "system", 
            content: "Sən mistik, qədim bir falçısan. İnsanlara qısa (maksimum 2 cümlə), sirli, bir az qaranlıq amma sonda ümidverici proqnozlar verirsən. Azərbaycanca danış." 
        },
        { 
            role: "user", 
            content: `Adım ${name}. Sualım: ${question}. Mənim falıma bax.` 
        }
      ],
      max_tokens: 150,
    });

    const text = completion.choices[0].message.content;

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("OpenAI Xətası:", error);
    return res.status(500).json({ error: error.message });
  }
}
