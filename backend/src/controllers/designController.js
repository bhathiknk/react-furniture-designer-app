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

exports.getDesignById = async (req, res) => {
    try {
        const design = await Design.findOne({
            _id:  req.params.id,
            user: req.user._id
        });
        if (!design) return res.status(404).json({ error: 'Design not found' });
        res.json({ design });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch design' });
    }
};

exports.updateDesign = async (req, res) => {
    try {
        const { roomKey, width, depth, height, wallTint, furniture } = req.body;
        const design = await Design.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { roomKey, width, depth, height, wallTint, furniture },
            { new: true }
        );
        if (!design) return res.status(404).json({ error: 'Design not found' });
        res.json({ design });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update design' });
    }

};

exports.deleteDesign = async (req, res) => {
    try {
        const deleted = await Design.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!deleted) return res.status(404).json({error: 'Design not found'});
        res.json({message: 'Design deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Could not delete design'});
    }
};
