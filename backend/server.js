// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS: allow frontend to access backend
const allowedOrigins = new Set([
  'http://localhost:3000',
  'https://tasma-six.vercel.app',
  'https://tasma-ashen-maneths-projects.vercel.app',
  'https://tasma-8h5j09wre-ashen-maneths-projects.vercel.app',
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and allowed origins
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb+srv://admin:admin123@tasmaproject.h3ds7yl.mongodb.net/";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
const companyRouter = require('./routes/companies');
const cadreRecordRouter = require('./routes/cadreRecords');
const authRouter = require('./routes/auth');

app.use('/companies', companyRouter);
app.use('/cadre-records', cadreRecordRouter);
app.use('/auth', authRouter);

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Optional: Serve frontend if backend serves production build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
  // Express 5 uses path-to-regexp v6; use '/(.*)' or a regex instead of '*'
  app.get('/(.*)', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
