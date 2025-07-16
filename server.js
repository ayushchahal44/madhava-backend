const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const askRoutes = require('./routes/ask');
const genaiRoutes = require('./routes/genai');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const corsOptions = {
  origin: ['https://madhava-shreekrishna.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Routes
app.use('/api', askRoutes);
app.use('/api/genai', genaiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Madhava API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 