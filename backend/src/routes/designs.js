// src/routes/designs.js
const express = require('express');
const { saveDesign, getDesigns, getDesignById } = require('../controllers/designController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Create a new design
router.post('/',    requireAuth, saveDesign);

// List all user's designs
router.get('/',     requireAuth, getDesigns);

// Fetch one design by its ID
router.get('/:id',  requireAuth, getDesignById);

module.exports = router;
