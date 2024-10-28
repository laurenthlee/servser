const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string
const username = 'admin';
const password = encodeURIComponent("@Lauren2040");
const mongoURI = `mongodb+srv://${username}:${password}@cluster0.1wd6m.mongodb.net/duriandata?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

app.use(cors());
app.use(bodyParser.json());

// Define a simple Mongoose model schema
const Model = mongoose.model('model', new mongoose.Schema({
  name: String,
  description: String,
}));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API! Use /api/model to access model data.');
});

// Combined route for fetching models with pagination, sorting, and field limiting
app.get('/api/model', async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

  try {
    const models = await Model.find({}, 'name description') // Only return name and description fields
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .exec();

    const count = await Model.countDocuments();

    res.json({
      models,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check routes
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/server', (req, res) => res.status(200).send('OK'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
