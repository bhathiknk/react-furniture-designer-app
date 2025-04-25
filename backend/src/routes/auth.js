// src/routes/auth.js
const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login',    login);
// protected:
router.get('/me', requireAuth, getProfile);

module.exports = router;
