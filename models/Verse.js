const mongoose = require('mongoose');

const verseSchema = new mongoose.Schema({
  chapter: {
    type: Number,
    required: true
  },
  verse: {
    type: Number,
    required: true
  },
  sanskrit: {
    type: String,
    required: true,
    trim: true
  },
  explanation_hindi: {
    type: String,
    required: true,
    trim: true
  },
  explanation_english: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique chapter-verse combinations
verseSchema.index({ chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Verse', verseSchema); 