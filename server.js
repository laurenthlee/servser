const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection credentials
const username = 'admin';
const password = encodeURIComponent("@Lauren2040");
const mongoURI = `mongodb+srv://${username}:${password}@cluster0.1wd6m.mongodb.net/duriandata?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.use(cors());
app.use(bodyParser.json());

// Define Mongoose schema for models with file URLs
const modelSchema = new mongoose.Schema({
  filename: String,
  file_url: String,
}, { collection: 'model' });

const Model = mongoose.model('Model', modelSchema);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Route to get model metadata with file URLs
app.get('/api/model', async (req, res) => {
  try {
    // Fetch all models with filename and file_url fields
    const models = await Model.find({}, 'filename file_url'); // Select specific fields
    res.json({ models });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check routes for Render
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/server', (req, res) => res.status(200).send('OK'));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
