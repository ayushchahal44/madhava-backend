const Verse = require('../models/Verse');

// Get all verses
const getAllVerses = async (req, res) => {
  try {
    const verses = await Verse.find().sort({ chapter: 1, verse: 1 });
    res.json(verses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get verses by chapter
const getVersesByChapter = async (req, res) => {
  try {
    const { chapter } = req.params;
    const verses = await Verse.find({ chapter: parseInt(chapter) }).sort({ verse: 1 });
    res.json(verses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific verse by chapter and verse number
const getVerseByChapterAndVerse = async (req, res) => {
  try {
    const { chapter, verse } = req.params;
    const verseData = await Verse.findOne({ 
      chapter: parseInt(chapter), 
      verse: parseInt(verse) 
    });
    
    if (!verseData) {
      return res.status(404).json({ message: 'Verse not found' });
    }
    res.json(verseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search verses by keyword
const searchVerses = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const verses = await Verse.find({
      $or: [
        { sanskrit: { $regex: query, $options: 'i' } },
        { explanation_hindi: { $regex: query, $options: 'i' } },
        { explanation_english: { $regex: query, $options: 'i' } }
      ]
    }).sort({ chapter: 1, verse: 1 });

    res.json(verses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get random verse
const getRandomVerse = async (req, res) => {
  try {
    const count = await Verse.countDocuments();
    const random = Math.floor(Math.random() * count);
    const verse = await Verse.findOne().skip(random);
    
    if (!verse) {
      return res.status(404).json({ message: 'No verses found' });
    }
    res.json(verse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new verse (for admin purposes)
const createVerse = async (req, res) => {
  try {
    const { chapter, verse, sanskrit, explanation_hindi, explanation_english } = req.body;
    
    if (!chapter || !verse || !sanskrit || !explanation_hindi || !explanation_english) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newVerse = new Verse({
      chapter: parseInt(chapter),
      verse: parseInt(verse),
      sanskrit,
      explanation_hindi,
      explanation_english
    });

    const savedVerse = await newVerse.save();
    res.status(201).json(savedVerse);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Verse already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update a verse
const updateVerse = async (req, res) => {
  try {
    const { chapter, verse } = req.params;
    const updateData = req.body;
    
    const updatedVerse = await Verse.findOneAndUpdate(
      { chapter: parseInt(chapter), verse: parseInt(verse) },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedVerse) {
      return res.status(404).json({ message: 'Verse not found' });
    }
    
    res.json(updatedVerse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a verse
const deleteVerse = async (req, res) => {
  try {
    const { chapter, verse } = req.params;
    const deletedVerse = await Verse.findOneAndDelete({ 
      chapter: parseInt(chapter), 
      verse: parseInt(verse) 
    });
    
    if (!deletedVerse) {
      return res.status(404).json({ message: 'Verse not found' });
    }
    res.json({ message: 'Verse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllVerses,
  getVersesByChapter,
  getVerseByChapterAndVerse,
  searchVerses,
  getRandomVerse,
  createVerse,
  updateVerse,
  deleteVerse
}; 