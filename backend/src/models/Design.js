// src/models/Design.js
const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomKey:   { type: String, required: true },
    width:     { type: Number, required: true },
    depth:     { type: Number, required: true },
    height:    { type: Number, required: true },
    wallTint:  { type: String },
    furniture: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Design', DesignSchema);
