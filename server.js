const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection credentials
const username = 'admin';
const password = encodeURIComponent("@Lauren2040"); // Handle special characters
const mongoURI = `mongodb+srv://${username}:${password}@cluster0.1wd6m.mongodb.net/duriandata?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.use(cors());
app.use(bodyParser.json());

// Define Mongoose schema for `duriandata.model`
const modelSchema = new mongoose.Schema({
  model_ids: [{ type: mongoose.Schema.Types.ObjectId }]
}, { collection: 'model' });

const Model = mongoose.model('Model', modelSchema);

// Define GridFS schema to access `fs.files` for model metadata
const gfsFilesSchema = new mongoose.Schema({
  filename: String,
  chunkSize: Number,
  length: Number,
  uploadDate: Date
}, { collection: 'fs.files' });

const GfsFile = mongoose.model('GfsFile', gfsFilesSchema);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Route to get model metadata from `duriandata.model` and `fs.files`
app.get('/api/model', async (req, res) => {
  try {
    // 1. Fetch all model documents from `duriandata.model`
    const models = await Model.find();

    // 2. Loop through model_ids and fetch metadata from `fs.files`
    const modelData = [];
    for (const model of models) {
      const files = await GfsFile.find({
        _id: { $in: model.model_ids }
      }, 'filename uploadDate length'); // Select specific fields

      modelData.push(...files);
    }

    res.json({ models: modelData });
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
