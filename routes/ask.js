const express = require('express');
const router = express.Router();
const {
  getAllVerses,
  getVersesByChapter,
  getVerseByChapterAndVerse,
  searchVerses,
  getRandomVerse,
  createVerse,
  updateVerse,
  deleteVerse
} = require('../controllers/askController');

// --- Google Gemini Integration ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI-powered Q&A endpoint using Gemini directly (no local verse database)
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const prompt = `
    You are Lord Shri Krishna, offering wise guidance to someone asking a life question, based on the teachings of the Bhagavad Gita. Respond in a calm, spiritual tone like in the Gita. Speak in a single paragraph of advice only. Do not use any headings, bullet points, or formatting characters like *, >, #, or -.
    
    After your paragraph, provide exactly one relevant shloka from the Bhagavad Gita in Devanagari script, include chapter and verse number, and also give its plain English translation. Do not include more than one shloka. Do not include any summary or extra explanation.
    
    User's question: ${question}
    Answer:
    `;
    

    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    console.log('Gemini result:', JSON.stringify(result, null, 2));
    const geminiText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({ answer: geminiText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating answer' });
  }
});

// Get all verses
router.get('/verses', getAllVerses);

// Get verses by chapter
router.get('/verses/chapter/:chapter', getVersesByChapter);

// Get a specific verse by chapter and verse number
router.get('/verses/:chapter/:verse', getVerseByChapterAndVerse);

// Search verses by keyword
router.get('/search', searchVerses);

// Get random verse
router.get('/random', getRandomVerse);

// Create a new verse (admin)
router.post('/verses', createVerse);

// Update a verse
router.put('/verses/:chapter/:verse', updateVerse);

// Delete a verse
router.delete('/verses/:chapter/:verse', deleteVerse);

// Simple AI response generator based on Gita verses
async function generateGitaResponse(question) {
  const Verse = require('../models/Verse');
  
  // Convert question to lowercase for better matching
  const questionLower = question.toLowerCase();
  
  // Define keyword mappings to relevant verses
  const keywordMappings = {
    'karma': { chapter: 2, verse: 47 },
    'duty': { chapter: 2, verse: 47 },
    'action': { chapter: 2, verse: 47 },
    'dharma': { chapter: 4, verse: 7 },
    'righteousness': { chapter: 4, verse: 7 },
    'soul': { chapter: 2, verse: 20 },
    'atman': { chapter: 2, verse: 20 },
    'body': { chapter: 2, verse: 22 },
    'death': { chapter: 2, verse: 20 },
    'birth': { chapter: 2, verse: 20 },
    'happiness': { chapter: 2, verse: 14 },
    'suffering': { chapter: 2, verse: 14 },
    'pain': { chapter: 2, verse: 14 },
    'pleasure': { chapter: 2, verse: 14 }
  };

  // Find the most relevant verse based on keywords
  let relevantVerse = null;
  for (const [keyword, verseRef] of Object.entries(keywordMappings)) {
    if (questionLower.includes(keyword)) {
      relevantVerse = await Verse.findOne({ 
        chapter: verseRef.chapter, 
        verse: verseRef.verse 
      });
      break;
    }
  }

  // If no specific keyword match, get a random verse
  if (!relevantVerse) {
    const count = await Verse.countDocuments();
    const random = Math.floor(Math.random() * count);
    relevantVerse = await Verse.findOne().skip(random);
  }

  if (!relevantVerse) {
    return {
      answer: "I apologize, but I couldn't find a relevant verse from the Bhagavad Gita for your question. Please try rephrasing your question or ask about karma, dharma, duty, the soul, or other spiritual concepts.",
      verse: null
    };
  }

  // Generate contextual response based on the verse
  let response = `Based on the wisdom of the Bhagavad Gita, specifically Chapter ${relevantVerse.chapter}, Verse ${relevantVerse.verse}: `;
  
  if (questionLower.includes('karma') || questionLower.includes('duty') || questionLower.includes('action')) {
    response += `The Gita teaches us that we have the right to perform our duties (karma), but we should not be attached to the fruits of our actions. This is the essence of karma yoga - performing actions without attachment to results.`;
  } else if (questionLower.includes('dharma') || questionLower.includes('righteousness')) {
    response += `The Gita tells us that whenever there is a decline in righteousness (dharma), the divine manifests to restore balance and protect the righteous.`;
  } else if (questionLower.includes('soul') || questionLower.includes('atman')) {
    response += `The Gita explains that the soul (atman) is eternal - it is never born and never dies. It is beyond birth and death, and continues to exist through all changes.`;
  } else if (questionLower.includes('body')) {
    response += `The Gita compares the body to clothes that the soul wears. Just as we change clothes, the soul changes bodies, but the soul itself remains unchanged.`;
  } else if (questionLower.includes('happiness') || questionLower.includes('suffering') || questionLower.includes('pain')) {
    response += `The Gita teaches that happiness and suffering are temporary experiences that come and go like seasons. They are not permanent and should not disturb our inner peace.`;
  } else {
    response += `The Gita offers profound wisdom for your question. The Sanskrit verse "${relevantVerse.sanskrit}" teaches us that ${relevantVerse.explanation_english.toLowerCase()}. This wisdom can guide us in understanding and dealing with life's challenges.`;
  }

  return {
    answer: response,
    verse: relevantVerse
  };
}

module.exports = router; 