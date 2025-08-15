const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://admin:admin123@tasmaproject.h3ds7yl.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const companyRouter = require('./routes/companies');
const cadreRecordRouter = require('./routes/cadreRecords');
const authRouter = require('./routes/auth');

app.use('/companies', companyRouter);
app.use('/cadre-records', cadreRecordRouter);
app.use('/auth', authRouter);

// =================DEPLOYMENT=================
// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
  });
}
// =================DEPLOYMENT=================

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
