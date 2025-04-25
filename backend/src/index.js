require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const designRoutes = require('./routes/designs');
const app = express();
// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
// Designs routes
app.use('/api/designs', require('./routes/designs'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
