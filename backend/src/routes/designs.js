const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    saveDesign,
    getDesigns,
    getDesignById,
    updateDesign,
    deleteDesign
} = require('../controllers/designController');

const router = express.Router();

router.post('/',    requireAuth, saveDesign);
router.get('/',     requireAuth, getDesigns);
router.get('/:id',  requireAuth, getDesignById);
router.put('/:id',  requireAuth, updateDesign);
router.delete('/:id', requireAuth, deleteDesign);

module.exports = router;
