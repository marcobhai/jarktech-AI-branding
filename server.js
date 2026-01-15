import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenAI client (v4+ compatible)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Health check (VERY IMPORTANT)
app.get("/health", (req, res) => {
  res.send("JARK AI Platform is running ✅");
});

/* ================= BRAND ENGINE ================= */
app.post("/api/brand", async (req, res) => {
  try {
    const { name, type, problem, tone, lang } = req.body;

    const langRule =
      lang === "ne"
        ? "Respond only in Nepali language."
        : "Respond only in English.";

    const prompt = `
You are a senior branding strategist.
${langRule}

Company Name: ${name}
Business Type: ${type}
Main Problem: ${problem}
Brand Tone: ${tone}

Provide:
1. Brand Personality (bullets)
2. Positioning Statement
3. One Strong Slogan
4. Logo Style Direction
5. Content Theme Direction
6. 3 Do's and Don'ts
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    res.json({ data: response.choices[0].message.content });
  } catch (error) {
    console.error("Brand error:", error);
    res.status(500).json({ error: "Brand generation failed" });
  }
});

/* ================= CONTENT ENGINE ================= */
app.post("/api/content", async (req, res) => {
  try {
    const { brandData, platform, goal, lang } = req.body;

    const langRule =
      lang === "ne"
        ? "Respond only in Nepali language."
        : "Respond only in English.";

    const prompt = `
You are a content marketing expert.
${langRule}

Brand Blueprint:
${brandData}

Platform: ${platform}
Goal: ${goal}

Generate:
1. 5 content ideas
2. 1 short video script
3. Trending angle
4. Music/Mood suggestion
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    res.json({ data: response.choices[0].message.content });
  } catch (error) {
    console.error("Content error:", error);
    res.status(500).json({ error: "Content generation failed" });
  }
});

/* ================= LOGO ENGINE ================= */
app.post("/api/logo", async (req, res) => {
  try {
    const { name, type, tone } = req.body;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `
Minimal modern logo for "${name}"
Industry: ${type}
Tone: ${tone}
Flat, scalable, clean background
`,
      size: "1024x1024"
    });

    res.json({ image: image.data[0].url });
  } catch (error) {
    console.error("Logo error:", error);
    res.status(500).json({ error: "Logo generation failed" });
  }
});

// ❌ 404 fallback
app.use((req, res) => {
  res.status(404).send("Route not found 🚫");
});

// ✅ IMPORTANT: Render-compatible PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 JARK AI Platform running on port ${PORT}`);
});
