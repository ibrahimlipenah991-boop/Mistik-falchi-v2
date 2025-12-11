import OpenAI from 'openai';

export default async function handler(req, res) {
  
  // CORS İcazələri
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

  try {
    const { name, question } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Serverdə API Key tapılmadı." });
    }

    const openai = new OpenAI({ apiKey: apiKey });

    // Daha ağıllı və kontekstli Prompt
    const systemPrompt = `
      Sən peşəkar və mistik bir falçısan. Adın "Büllur Göz"dür.
      Vəzifən: İstifadəçinin sualını dərindən analiz etmək və ona birbaşa aidiyyatı olan bir cavab verməkdir.
      
      Qaydaların:
      1. Əgər sual "Sevgi" haqqındadırsa: Ürək, hisslər və yaxın gələcəkdəki görüşlərdən bəhs et.
      2. Əgər sual "İş/Pul" haqqındadırsa: Fürsətlər, paxıl insanlar və ya gözlənilməz qazancdan danış.
      3. Əgər sual yoxdursa (boşdursa): Ümumi, amma təsirli bir həyat dərsi və ya xəbərdarlıq ver.
      4. Üslubun: Qədim, müdrik, bir az qaranlıq, amma sonda ümidverici olsun.
      5. Heç vaxt "Mən bir AI modeliyəm" demə. Sən ruhsan, enerjisən.
      6. Cavabın maksimum 2-3 cümlə olsun. Uzatma.
      7. Cavabda istifadəçinin adına xitab et (Məsələn: "Dinlə, Ayan...").
    `;

    const userPrompt = `Adım: ${name}. Sualım: ${question || "Ümumi gələcəyimi de."}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.8, // Bir az daha yaradıcı olması üçün
    });

    const text = completion.choices[0].message.content;

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("OpenAI Xətası:", error);
    return res.status(500).json({ error: "Ruhlarla əlaqə kəsildi..." });
  }
}

