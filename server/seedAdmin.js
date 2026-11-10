const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campconnect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected.');

    const adminEmail = 'parshu@gmail.com';
    const adminPassword = 'parshu@9692';

    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.password = adminPassword; // It will be hashed by pre-save hook
      await adminUser.save();
      console.log('Admin user updated successfully!');
    } else {
      adminUser = await User.create({
        name: 'Parshu Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        isEmailVerified: true,
        department: 'CSE',
        year: '4th Year'
      });
      console.log('Admin user created successfully!');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
