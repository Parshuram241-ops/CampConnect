// Product data management utilities
import { products as initialProducts } from '../constants/products';

const STORAGE_KEY = 'campconnect_products';

// Get all products from localStorage or use initial data
export const getAllProducts = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing products from localStorage:', error);
      return initialProducts;
    }
  }
  // Initialize localStorage with initial products
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
  return initialProducts;
};

// Get a single product by ID
export const getProductById = (id) => {
  const products = getAllProducts();
  return products.find((product) => product.id === parseInt(id));
};

// Update a product
export const updateProduct = (id, updatedData) => {
  const products = getAllProducts();
  const index = products.findIndex((product) => product.id === parseInt(id));

  if (index !== -1) {
    products[index] = { ...products[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products[index];
  }

  return null;
};

// Delete a product
export const deleteProduct = (id) => {
  const products = getAllProducts();
  const filtered = products.filter((product) => product.id !== parseInt(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

// Add a new product
export const addProduct = (productData) => {
  const products = getAllProducts();

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('campconnectUser') || '{}');

  // Generate new ID
  const newId = products.length > 0
    ? Math.max(...products.map(p => p.id)) + 1
    : 1;

  // Create new product object
  const newProduct = {
    id: newId,
    title: productData.title,
    price: parseFloat(productData.price) || 0,
    type: productData.listingType,
    category: productData.category.toLowerCase().replace(/\s+/g, '-'),
    condition: productData.condition,
    description: productData.description,
    images: productData.imagePreviews || [productData.image], // Use image previews if available
    image: productData.imagePreviews?.[0] || productData.image, // First image as main
    location: productData.location,
    seller: {
      name: currentUser.name || 'Anonymous',
      avatar: currentUser.avatar || currentUser.profilePhoto || null,
      department: currentUser.department || null,
      year: currentUser.year || null,
      rating: currentUser.rating || null,
    },
    contactNumber: productData.contactNumber,
    postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: 'Available',
    views: 0,
    availability: 'Available',
    negotiable: true,
    brand: productData.brand || null,
  };

  // Add to products array
  products.unshift(newProduct); // Add to beginning so it shows up first

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

  return newProduct;
};

// Get user's listings (for now, return first 3 products as dummy data)
export const getUserListings = () => {
  const products = getAllProducts();
  return products.slice(0, 3).map(product => ({
    id: product.id,
    title: product.title,
    price: `₹${product.price.toLocaleString()}`,
    status: product.status === "Available" ? "Active" : "Sold",
    type: product.type,
    views: product.views || 0,
    offers: 0,
    image: getCategoryEmoji(product.category),
    listedDate: product.postedDate,
  }));
};

// Helper function to get emoji for category
const getCategoryEmoji = (category) => {
  const emojiMap = {
    books: '📚',
    electronics: '💻',
    'study-materials': '📝',
    furniture: '🪑',
    'hostel-essentials': '🏠',
    'lab-equipment': '🔬',
    clothing: '👕',
    sports: '⚽',
    others: '🎮'
  };
  return emojiMap[category] || '📦';
};
