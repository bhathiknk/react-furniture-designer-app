// src/controllers/designController.js
const Design = require('../models/Design');

exports.saveDesign = async (req, res) => {
    try {
        const { roomKey, width, depth, height, wallTint, furniture } = req.body;
        const design = new Design({
            user:      req.user._id,
            roomKey, width, depth, height, wallTint, furniture
        });
        await design.save();
        res.status(201).json({ design });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not save design' });
    }
};

exports.getDesigns = async (req, res) => {
    try {
        const designs = await Design
            .find({ user: req.user._id })
            .sort('-createdAt');
        res.json({ designs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch designs' });
    }
};

// New: fetch single by ID
exports.getDesignById = async (req, res) => {
    try {
        const design = await Design.findOne({
            _id:    req.params.id,
            user:   req.user._id
        });
        if (!design) {
            return res.status(404).json({ error: 'Design not found' });
        }
        res.json({ design });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch design' });
    }
};
