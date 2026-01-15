import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get("/health", (req, res) => {
  res.send("JARK AI Platform is running ✅");
});

/* ---------- BRAND ENGINE ---------- */
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

Company: ${name}
Industry: ${type}
Core Problem: ${problem}
Brand Tone: ${tone}

Deliver:
1. Brand Personality
2. Positioning Statement
3. Slogan
4. Logo Style
5. Content Direction
6. Do's & Don'ts
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    res.json({ data: response.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Branding failed" });
  }
});

/* ---------- CONTENT ENGINE ---------- */
app.post("/api/content", async (req, res) => {
  try {
    const { brandData, platform, goal, lang } = req.body;

    const langRule =
      lang === "ne"
        ? "Respond only in Nepali language."
        : "Respond only in English.";

    const prompt = `
You are a content growth expert.
${langRule}

Brand:
${brandData}

Platform: ${platform}
Goal: ${goal}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    res.json({ data: response.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Content failed" });
  }
});

/* ---------- LOGO ENGINE ---------- */
app.post("/api/logo", async (req, res) => {
  try {
    const { name, type, tone } = req.body;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Minimal modern logo for ${name}, industry ${type}, tone ${tone}`,
      size: "1024x1024"
    });

    res.json({ image: image.data[0].url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Logo failed" });
  }
});

// Start server (Render compatible)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 JARK AI Platform running on port ${PORT}`);
});
