// server.js - Complete Express.js Product API Implementation
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// ============= CUSTOM ERROR CLASSES =============
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// ============= MIDDLEWARE =============

// Logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  console.log(`[${timestamp}] ${method} ${url}`);
  next();
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // Skip authentication for GET requests (optional - you can modify this)
  if (req.method === 'GET') {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required for this operation'
    });
  }
  
  // Simple API key validation (in real app, use proper authentication)
  if (apiKey !== 'your-secret-api-key') {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

// Validation middleware for products
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }
  
  if (price === undefined || price === null || isNaN(price) || price < 0) {
    errors.push('Price is required and must be a positive number');
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (inStock === undefined || inStock === null || typeof inStock !== 'boolean') {
    errors.push('InStock is required and must be a boolean');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  
  next();
};

// Async wrapper function for error handling
const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============= APPLY MIDDLEWARE =============
app.use(bodyParser.json());
app.use(logger);
app.use('/api', authenticate); // Apply authentication to all API routes

// ============= ROUTES =============

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API!',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      search: '/api/products/search/:query',
      stats: '/api/products/stats'
    },
    documentation: 'See README.md for full API documentation',
    note: 'Add x-api-key header for POST, PUT, DELETE operations'
  });
});

// GET /api/products - Get all products with filtering and pagination
app.get('/api/products', asyncWrapper(async (req, res) => {
  let filteredProducts = [...products];
  
  // Filter by category if provided
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  
  // Filter by inStock status if provided
  if (req.query.inStock !== undefined) {
    const inStockFilter = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(
      product => product.inStock === inStockFilter
    );
  }
  
  // Search by name if provided
  if (req.query.search) {
    filteredProducts = filteredProducts.filter(
      product => product.name.toLowerCase().includes(req.query.search.toLowerCase()) ||
                 product.description.toLowerCase().includes(req.query.search.toLowerCase())
    );
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / limit),
      hasNext: endIndex < filteredProducts.length,
      hasPrev: page > 1
    }
  });
}));

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', asyncWrapper(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  res.json({
    success: true,
    data: product
  });
}));

// POST /api/products - Create a new product
app.post('/api/products', validateProduct, asyncWrapper(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.toLowerCase().trim(),
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
}));

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', validateProduct, asyncWrapper(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product not found');
  }
  
  const { name, description, price, category, inStock } = req.body;
  
  products[productIndex] = {
    ...products[productIndex],
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.toLowerCase().trim(),
    inStock: Boolean(inStock)
  };
  
  res.json({
    success: true,
    message: 'Product updated successfully',
    data: products[productIndex]
  });
}));

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', asyncWrapper(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product not found');
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Product deleted successfully',
    data: deletedProduct
  });
}));

// ============= ADVANCED FEATURES =============

// GET /api/products/search/:query - Search products by name or description
app.get('/api/products/search/:query', asyncWrapper(async (req, res) => {
  const query = req.params.query.toLowerCase();
  const searchResults = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
  
  res.json({
    success: true,
    query: req.params.query,
    results: searchResults.length,
    data: searchResults
  });
}));

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', asyncWrapper(async (req, res) => {
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    categories: {},
    averagePrice: 0,
    priceRange: {
      min: 0,
      max: 0
    }
  };
  
  // Calculate category counts
  products.forEach(product => {
    stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
  });
  
  // Calculate price statistics
  if (products.length > 0) {
    const prices = products.map(p => p.price);
    const totalPrice = prices.reduce((sum, price) => sum + price, 0);
    stats.averagePrice = parseFloat((totalPrice / products.length).toFixed(2));
    stats.priceRange.min = Math.min(...prices);
    stats.priceRange.max = Math.max(...prices);
  }
  
  res.json({
    success: true,
    data: stats
  });
}));

// ============= ERROR HANDLING =============

// 404 handler for unmatched routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    availableEndpoints: {
      products: '/api/products',
      search: '/api/products/search/:query',
      stats: '/api/products/stats'
    }
  });
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
  } else if (err.name === 'AuthenticationError') {
    statusCode = 401;
  } else if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.name 
    })
  });
};

// Apply error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// ============= SERVER STARTUP =============
app.listen(PORT, () => {
  console.log('🚀 Product API Server Started');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔑 API Key for testing: your-secret-api-key`);
  console.log('📖 Available endpoints:');
  console.log('   GET  /api/products - Get all products');
  console.log('   GET  /api/products/:id - Get product by ID');
  console.log('   POST /api/products - Create product');
  console.log('   PUT  /api/products/:id - Update product');
  console.log('   DELETE /api/products/:id - Delete product');
  console.log('   GET  /api/products/search/:query - Search products');
  console.log('   GET  /api/products/stats - Get statistics');
  console.log('');
  console.log('🔍 Query parameters:');
  console.log('   ?category=electronics - Filter by category');
  console.log('   ?inStock=true - Filter by stock status');
  console.log('   ?search=laptop - Search in name/description');
  console.log('   ?page=1&limit=10 - Pagination');
});

// Export the app for testing purposes
module.exports = app;