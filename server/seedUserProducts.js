/**
 * Seed script to add 3-4 products for each of the first 4 users
 * Run: node seedUserProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campconnect');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Product data for different users
const productTemplates = [
  {
    title: 'Physics Textbook - Resnick & Halliday',
    description: 'Complete Physics textbook used for semester 1 and 2. All concepts are well explained with solved examples. Minimal annotations.',
    category: 'books',
    condition: 'Good',
    type: 'For Sale',
    price: 250,
    brand: 'Resnick & Halliday',
    images: ['https://images.unsplash.com/photo-1507842217343-583f7270bfba?auto=format&fit=crop&w=400&q=60'],
    location: 'Main Campus Library',
    contactNumber: '9876543210',
  },
  {
    title: 'Dell Laptop - Core i5, 8GB RAM',
    description: 'Dell Inspiron 15 laptop, Intel Core i5 (10th Gen), 8GB RAM, 256GB SSD. Used for 2 years but still in excellent working condition. No issues.',
    category: 'electronics',
    condition: 'Excellent',
    type: 'For Sale',
    price: 35000,
    brand: 'Dell',
    images: ['https://images.unsplash.com/photo-1588872657840-18491dbba3bb?auto=format&fit=crop&w=400&q=60'],
    location: 'Hostel Block B',
    contactNumber: '9876543211',
  },
  {
    title: 'Organic Chemistry Lab Manual',
    description: 'Complete lab manual for Organic Chemistry practical. Contains all experiments with observations and calculations. Well-organized and easy to follow.',
    category: 'study-materials',
    condition: 'Like New',
    type: 'For Sale',
    price: 150,
    images: ['https://images.unsplash.com/photo-1507842217343-583f7270bfba?auto=format&fit=crop&w=400&q=60'],
    location: 'Science Building',
    contactNumber: '9876543212',
  },
  {
    title: 'Hostel Single Bed with Mattress',
    description: 'Comfortable single bed with good quality mattress. Perfect for hostel rooms. Mattress is clean and in great condition. Easy to disassemble for transport.',
    category: 'furniture',
    condition: 'Good',
    type: 'For Sale',
    price: 4000,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=60'],
    location: 'Hostel Block C',
    contactNumber: '9876543213',
  },
  {
    title: 'Study Table and Chair Combo',
    description: 'Wooden study table with adjustable chair. Very sturdy and perfect for hostel/home use. Recently cleaned and in excellent condition.',
    category: 'furniture',
    condition: 'Excellent',
    type: 'For Sale',
    price: 5000,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=60'],
    location: 'Near Campus Gate',
    contactNumber: '9876543214',
  },
  {
    title: 'Programming Books Bundle - CLRS, K&R',
    description: 'Bundle of 2 programming books: Introduction to Algorithms (CLRS) and The C Programming Language (K&R). Both in excellent condition.',
    category: 'books',
    condition: 'Excellent',
    type: 'For Sale',
    price: 1500,
    images: ['https://images.unsplash.com/photo-1507842217343-583f7270bfba?auto=format&fit=crop&w=400&q=60'],
    location: 'Academic Block',
    contactNumber: '9876543215',
  },
  {
    title: 'Running Shoes - Nike Air Max',
    description: 'Original Nike Air Max running shoes, size 9. Used for 3 months, still looks new. Very comfortable for daily use and running.',
    category: 'sports-fitness',
    condition: 'Like New',
    type: 'For Sale',
    price: 3000,
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=400&q=60'],
    location: 'Sports Complex',
    contactNumber: '9876543216',
  },
  {
    title: 'Hostel Essentials Pack',
    description: 'Bundle: Bedsheet set, pillow, blanket, and storage boxes. All new and unused. Perfect for incoming students.',
    category: 'hostel-essentials',
    condition: 'Brand New',
    type: 'For Sale',
    price: 800,
    images: ['https://images.unsplash.com/photo-1567270671170-fdc10a5bf831?auto=format&fit=crop&w=400&q=60'],
    location: 'Hostel Block A',
    contactNumber: '9876543217',
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Get first 4 users
    const users = await User.find({ authMethod: 'local' }).limit(4);

    if (users.length === 0) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    console.log(`\n📝 Found ${users.length} users. Creating products for each...\n`);

    let totalProducts = 0;

    // For each user, create 3-4 products
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const productsPerUser = i === 0 ? 3 : 4; // First user gets 3, others get 4

      console.log(`👤 User ${i + 1}: ${user.name} (${user.email})`);

      for (let j = 0; j < productsPerUser; j++) {
        const template = productTemplates[(i * 4 + j) % productTemplates.length];

        const product = new Product({
          ...template,
          seller: user._id,
          // Vary the contact number per product
          contactNumber: (parseInt(template.contactNumber) + j).toString(),
        });

        await product.save();
        totalProducts++;
        console.log(`  ✅ Added: "${product.title}" for ${template.price}${template.type !== 'Free' ? ' ₹' : ''}`);
      }

      console.log('');
    }

    console.log(`\n✨ Successfully seeded ${totalProducts} products for ${users.length} users!`);

    // Show stats
    const totalProductsInDB = await Product.countDocuments();
    console.log(`\n📊 Total products in database: ${totalProductsInDB}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();
