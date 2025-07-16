const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables.");
  process.exit(1); // Stop app from running without required key
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ask
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Validate user input
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Construct Gemini prompt
    const prompt = `
    You are Lord Shri Krishna, offering wise guidance to someone asking a life question, based on the teachings of the Bhagavad Gita. Respond in a calm, spiritual tone like in the Gita. Speak in a single paragraph of advice only. Do not use any headings, bullet points, or formatting characters like *, >, #, or -.

    After your paragraph, provide exactly one relevant shloka from the Bhagavad Gita in Devanagari script, include chapter and verse number, and also give its plain English translation. Do not include more than one shloka. Do not include any summary or extra explanation.

    User's question: ${question}
    Answer:
    `;

    // Get response from Gemini model
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });
    const result = await model.generateContent(prompt);

    // Safely extract Gemini response
    const geminiText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!geminiText) {
      console.error("❌ Invalid Gemini response format:", JSON.stringify(result, null, 2));
      return res.status(500).json({ message: 'AI did not return a valid response' });
    }

    // Send AI response to client
    res.json({ answer: geminiText });

  } catch (error) {
    console.error("❌ Error in /ask route:", error);
    res.status(500).json({ message: 'Internal server error while generating answer' });
  }
});

module.exports = router;
