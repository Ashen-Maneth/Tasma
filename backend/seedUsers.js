const mongoose = require('mongoose');
const User = require('./models/user.model');

const users = [
    { username: 'AshenManeth', password: 'Pamuditha@23', role: 'auditor' },
    { username: 'tasmaAudi', password: 'tasmaAudi123', role: 'manager' }
];

const uri = "mongodb+srv://admin:admin123@tasmaproject.h3ds7yl.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', async () => {
  console.log("MongoDB database connection established successfully");
  
  try {
    await User.deleteMany({});
    console.log('Old users deleted.');
    
    for (const userData of users) {
        const user = new User(userData);
        await user.save();
    }

    console.log('Users seeded!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
});
