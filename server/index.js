const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample in-memory database
const users = [];
const products = [];
const orders = [];

// Authentication Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  
  res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
});

// Product Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category, image } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }
  
  const product = {
    id: products.length + 1,
    name,
    description,
    price,
    category,
    image,
    createdAt: new Date()
  };
  
  products.push(product);
  res.status(201).json({ message: 'Product added successfully', product });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const { name, description, price, category, image } = req.body;
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (image) product.image = image;
  
  res.json({ message: 'Product updated successfully', product });
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const deletedProduct = products.splice(index, 1);
  res.json({ message: 'Product deleted successfully', product: deletedProduct[0] });
});

// Order Routes
app.post('/api/orders', (req, res) => {
  const { userId, items, totalPrice } = req.body;
  
  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ message: 'User ID and items are required' });
  }
  
  const order = {
    id: orders.length + 1,
    userId,
    items,
    totalPrice,
    status: 'pending',
    createdAt: new Date()
  };
  
  orders.push(order);
  res.status(201).json({ message: 'Order created successfully', order });
});

app.get('/api/orders/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === parseInt(req.params.userId));
  res.json(userOrders);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.put('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  const { status } = req.body;
  if (status) order.status = status;
  
  res.json({ message: 'Order updated successfully', order });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
