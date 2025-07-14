const mongoose = require('mongoose');
const Verse = require('./models/Verse');
const fs = require('fs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/madhava';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const verses = JSON.parse(fs.readFileSync('../verses.json', 'utf-8'));
    await Verse.deleteMany({});
    await Verse.insertMany(verses);
    console.log('Database seeded with verses!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed(); 