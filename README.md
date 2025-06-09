# Product API - Express.js Assignment

A comprehensive RESTful API built with Express.js for managing products. This API provides CRUD operations, advanced filtering, search functionality, and statistics.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, Delete products
- **Advanced Filtering**: Filter by category, stock status, and search terms
- **Pagination**: Paginate through large datasets
- **Search Functionality**: Search products by name, description, or category
- **Statistics**: Get detailed product statistics
- **Authentication**: API key-based authentication for write operations
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Request logging middleware
- **Validation**: Input validation for all product operations

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd express-product-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation:**
   - Open your browser and go to `http://localhost:3000`
   - You should see the API welcome message

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
- **GET requests**: No authentication required
- **POST, PUT, DELETE requests**: Require API key in header
- **Header**: `x-api-key: your-secret-api-key`

### Response Format
All responses follow this structure:
```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {}, // Response data
  "pagination": {}, // For paginated responses
  "errors": [] // For validation errors
}
```

## 🔗 API Endpoints

### 1. Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` (string): Filter by product category
- `inStock` (boolean): Filter by stock status (true/false)
- `search` (string): Search in name/description
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 10)

**Example Requests:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by category
curl "http://localhost:3000/api/products?category=electronics"

# Search products
curl "http://localhost:3000/api/products?search=laptop"

# Pagination
curl "http://localhost:3000/api/products?page=1&limit=5"

# Multiple filters
curl "http://localhost:3000/api/products?category=electronics&inStock=true&page=1&limit=2"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 2. Get Product by ID
```http
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:3000/api/products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Laptop",
    "description": "High-performance laptop with 16GB RAM",
    "price": 1200,
    "category": "electronics",
    "inStock": true
  }
}
```

### 3. Create New Product
```http
POST /api/products
```

**Headers:**
- `Content-Type: application/json`
- `x-api-key: your-secret-api-key`

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "inStock": true
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "name": "Gaming Mouse",
    "description": "High-precision gaming mouse with RGB lighting",
    "price": 79.99,
    "category": "electronics",
    "inStock": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Gaming Mouse",
    "description": "High-precision gaming mouse with RGB lighting",
    "price": 79.99,
    "category": "electronics",
    "inStock": true
  }
}
```

### 4. Update Product
```http
PUT /api/products/:id
```

**Headers:**
- `Content-Type: application/json`
- `x-api-key: your-secret-api-key`

**Example:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "name": "Updated Laptop",
    "description": "Updated high-performance laptop with 32GB RAM",
    "price": 1499.99,
    "category": "electronics",
    "inStock": true
  }'
```

### 5. Delete Product
```http
DELETE /api/products/:id
```

**Headers:**
- `x-api-key: your-secret-api-key`

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "x-api-key: your-secret-api-key"
```

### 6. Search Products
```http
GET /api/products/search/:query
```

**Example:**
```bash
curl http://localhost:3000/api/products/search/laptop
```

**Response:**
```json
{
  "success": true,
  "query": "laptop",
  "results": 1,
  "data": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
  ]
}
```

### 7. Get Product Statistics
```http
GET /api/products/stats
```

**Example:**
```bash
curl http://localhost:3000/api/products/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "inStock": 2,
    "outOfStock": 1,
    "categories": {
      "electronics": 2,
      "kitchen": 1
    },
    "averagePrice": 683.33,
    "priceRange": {
      "min": 50,
      "max": 1200
    }
  }
}
```

## 🔍 Query Examples

### Complex Filtering
```bash
# Get electronics products that are in stock, page 1, limit 5
curl "http://localhost:3000/api/products?category=electronics&inStock=true&page=1&limit=5"

# Search for products containing "laptop" in name or description
curl "http://localhost:3000/api/products?search=laptop"

# Get out of stock products
curl "http://localhost:3000/api/products?inStock=false"
```

### Pagination Examples
```bash
# First page with 2 items
curl "http://localhost:3000/api/products?page=1&limit=2"

# Second page with 2 items
curl "http://localhost:3000/api/products?page=2&limit=2"
```

## ❌ Error Handling

The API returns appropriate HTTP status codes and error messages:

### Common Error Responses

**400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    "Name is required and must be a non-empty string",
    "Price is required and must be a positive number"
  ]
}
```

**401 Unauthorized** - Missing API Key:
```json
{
  "success": false,
  "message": "API key is required for this operation"
}
```

**403 Forbidden** - Invalid API Key:
```json
{
  "success": false,
  "message": "Invalid API key"
}
```

**404 Not Found** - Product Not Found:
```json
{
  "success": false,
  "message": "Product not found"
}
```

**404 Not Found** - Route Not Found:
```json
{
  "success": false,
  "message": "Route GET /api/invalid not found",
  "availableEndpoints": {
    "products": "/api/products",
    "search": "/api/products/search/:query",
    "stats": "/api/products/stats"
  }
}
```

**500 Internal Server Error** - Server Error:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 🧪 Testing the API

### Using curl (Command Line)
All the examples above use curl commands that you can run directly in your terminal.

### Using Postman
1. Import the following collection or create requests manually:
   - Set base URL: `http://localhost:3000/api`
   - Add `x-api-key: your-secret-api-key` header for POST/PUT/DELETE
   - Set `Content-Type: application/json` for requests with body

### Using JavaScript (Frontend)
```javascript
// Get all products
fetch('http://localhost:3000/api/products')
  .then(response => response.json())
  .then(data => console.log(data));

// Create a product
fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-secret-api-key'
  },
  body: JSON.stringify({
    name: 'Test Product',
    description: 'Test description',
    price: 29.99,
    category: 'test',
    inStock: true
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📊 Product Schema

Each product has the following structure:
```json
{
  "id": "string (UUID)",
  "name": "string (required, non-empty)",
  "description": "string (required, non-empty)",
  "price": "number (required, positive)",
  "category": "string (required, non-empty, lowercase)",
  "inStock": "boolean (required)"
}
```

## 🔧 Development

### File Structure
```
express-product-api/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── .env              # Environment variables (not in git)
├── README.md         # This file
└── .gitignore        # Git ignore file
```

### Available Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart

### Environment Variables
Create a `.env` file based on `.env.example`:
```env
PORT=3000
NODE_ENV=development
API_KEY=your-secret-api-key
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Configuration
- Set `NODE_ENV=production` for production
- Set `PORT` to desired port number
- Set `API_KEY` to your secure API key

## 📝 Assignment Requirements Checklist

- ✅ Express.js server setup
- ✅ RESTful API routes (GET, POST, PUT, DELETE)
- ✅ Custom middleware (logging, authentication, validation)
- ✅ Comprehensive error handling
- ✅ Advanced features (filtering, pagination, search, statistics)
- ✅ Proper HTTP status codes
- ✅ Input validation
- ✅ Complete documentation
- ✅ Example requests and responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes as part of an Express.js assignment.

---

**Happy coding! 🚀**