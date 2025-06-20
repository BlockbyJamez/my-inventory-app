//backend/index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory fake DB
let products = [
  { id: 1, name: "Demo Product A", quantity: 10 },
  { id: 2, name: "Demo Product B", quantity: 5 }
];

// Routes

// Get all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Add product
app.post('/products', (req, res) => {
  const { name, quantity } = req.body;
  const newProduct = {
    id: Date.now(),
    name,
    quantity: Number(quantity)
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, quantity } = req.body;
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: "Not found" });
  product.name = name;
  product.quantity = Number(quantity);
  res.json(product);
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.status(204).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});