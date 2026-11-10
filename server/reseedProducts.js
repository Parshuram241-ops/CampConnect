/**
 * Script to delete old products and reseed with new images
 * Run: node reseedProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

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

// Product data with picsum.photos (reliable image service)
const productTemplates = [
  {
    title: 'Physics Textbook - Resnick & Halliday',
    description: 'Complete Physics textbook used for semester 1 and 2. All concepts are well explained with solved examples. Minimal annotations.',
    category: 'books',
    condition: 'Good',
    type: 'For Sale',
    price: 250,
    brand: 'Resnick & Halliday',
    images: ['https://picsum.photos/400/400?random=1'],
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
    images: ['https://picsum.photos/400/400?random=2'],
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
    images: ['https://picsum.photos/400/400?random=3'],
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
    images: ['https://picsum.photos/400/400?random=4'],
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
    images: ['https://picsum.photos/400/400?random=5'],
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
    images: ['https://picsum.photos/400/400?random=6'],
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
    images: ['https://picsum.photos/400/400?random=7'],
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
    images: ['https://picsum.photos/400/400?random=8'],
    location: 'Hostel Block A',
    contactNumber: '9876543217',
  },
];

const reseedProducts = async () => {
  try {
    await connectDB();

    // Delete old products (from recent seeding)
    console.log('\n🗑️  Deleting old products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old products`);

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
      const productsPerUser = i === 0 ? 3 : 4;

      console.log(`👤 User ${i + 1}: ${user.name} (${user.email})`);

      for (let j = 0; j < productsPerUser; j++) {
        const template = productTemplates[(i * 4 + j) % productTemplates.length];

        const product = new Product({
          ...template,
          seller: user._id,
          contactNumber: (parseInt(template.contactNumber) + j).toString(),
        });

        await product.save();
        totalProducts++;
        console.log(`  ✅ Added: "${product.title}" (₹${product.price})`);
      }

      console.log('');
    }

    console.log(`\n✨ Successfully reseeded ${totalProducts} products with working images!`);

    // Show stats
    const totalProductsInDB = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProductsInDB}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error reseeding products:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

reseedProducts();
