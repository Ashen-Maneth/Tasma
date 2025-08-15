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
app.use(cors({
  origin: 'https://tasma-six.vercel.app', // frontend URL
  credentials: true,
}));

// MongoDB connection
const uri = "mongodb+srv://admin:admin123@tasmaproject.h3ds7yl.mongodb.net/";
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
const companyRouter = require('./routes/companies');
const cadreRecordRouter = require('./routes/cadreRecords');
const authRouter = require('./routes/auth');

app.use('/companies', companyRouter);
app.use('/cadre-records', cadreRecordRouter);
app.use('/auth', authRouter);

// Optional: Serve frontend if backend serves production build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
