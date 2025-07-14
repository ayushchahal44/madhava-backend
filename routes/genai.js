const express = require('express');
const router = express.Router();
const { generateText } = require('../controllers/genaiController');

router.post('/generate', generateText);

module.exports = router; 