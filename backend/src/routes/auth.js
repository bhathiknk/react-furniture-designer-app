const router = require('express').Router(); // ✅ Correct!

const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
