import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Use API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get("/health", (req, res) => res.send("JARK AI Platform is running ✅"));


/* ---------- BRAND ENGINE ---------- */
app.post("/api/brand", async (req, res) => {
  try {
    console.log("Branding request:", req.body);
    const { name, type, problem, tone, lang } = req.body;

    const langRule = lang === "ne"
      ? "Respond only in Nepali language."
      : "Respond only in English.";

    const prompt = `
You are a senior branding strategist.
${langRule}

Create a BRAND BLUEPRINT for:

Company: ${name}
Industry: ${type}
Core Problem: ${problem}
Brand Tone: ${tone}

Deliver clearly:
1. Brand Personality (bullet points)
2. Brand Positioning Statement
3. Strong Slogan (1)
4. Logo Style Direction
5. Content Theme Direction
6. 3 Branding Do's & Don'ts
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    res.json({ data: response.choices[0].message.content });

  } catch (e) {
    console.error("Branding error:", e);
    res.status(500).json({ error: "Branding generation failed" });
  }
});


/* ---------- CONTENT ENGINE ---------- */
app.post("/api/content", async (req, res) => {
  try {
    console.log("Content request:", req.body);
    const { brandData, platform, goal, lang } = req.body;

    const langRule = lang === "ne"
      ? "Respond only in Nepali language."
      : "Respond only in English.";

    const prompt = `
You are a content growth expert.
${langRule}

Brand Blueprint:
${brandData}

Platform: ${platform}
Goal: ${goal}

Generate:
1. 5 UNIQUE content ideas (not generic)
2. 1 full short-video script (hook → value → CTA)
3. Trending topic angle (platform-appropriate)
4. Music/Mood suggestion
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    res.json({ data: response.choices[0].message.content });

  } catch (e) {
    console.error("Content error:", e);
    res.status(500).json({ error: "Content generation failed" });
  }
});


/* ---------- LOGO ENGINE ---------- */
app.post("/api/logo", async (req, res) => {
  try {
    console.log("Logo request:", req.body);
    const { name, type, tone } = req.body;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `
Professional brand logo for "${name}".
Industry: ${type}
Tone: ${tone}
Style: minimal, flat, scalable, modern
No text mockups, clean background.
`,
      size: "1024x1024"
    });

    res.json({ image: image.data[0].url });

  } catch (e) {
    console.error("Logo error:", e);
    res.status(500).json({ error: "Logo generation failed" });
  }
});

// 404 fallback
app.use((req, res) => res.status(404).send("Route not found 🚫"));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 JARK AI Platform running at http://localhost:${PORT}`));
