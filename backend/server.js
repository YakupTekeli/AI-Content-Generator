const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
// Note: This relies on MongoDB being available. 
// If it's not running, the app will crash/exit on start as per config/db.j logic
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const shareRoutes = require('./routes/shareRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('AI Content Generator API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
