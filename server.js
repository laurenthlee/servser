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

// Define GridFS schemas for `fs.files` and `fs.chunks`
const gfsFilesSchema = new mongoose.Schema({
  filename: String,
  chunkSize: Number,
  length: Number,
  uploadDate: Date
}, { collection: 'fs.files' });

const gfsChunksSchema = new mongoose.Schema({
  files_id: mongoose.Schema.Types.ObjectId,
  n: Number,
  data: Buffer
}, { collection: 'fs.chunks' });

const GfsFile = mongoose.model('GfsFile', gfsFilesSchema);
const GfsChunk = mongoose.model('GfsChunk', gfsChunksSchema);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Route to get model metadata from `duriandata.model`, `fs.files`, and `fs.chunks`
app.get('/api/model', async (req, res) => {
  try {
    // 1. Fetch all model documents from `duriandata.model`
    const models = await Model.find();

    // 2. Initialize array to hold combined model and file data
    const modelData = [];

    for (const model of models) {
      // 3. Fetch model file metadata from `fs.files` for each model_id
      const files = await GfsFile.find({
        _id: { $in: model.model_ids }
      }, 'filename uploadDate length'); // Select specific fields

      for (const file of files) {
        // 4. Fetch chunks for each file from `fs.chunks`
        const chunks = await GfsChunk.find({ files_id: file._id })
          .sort({ n: 1 }) // Ensure chunks are in correct order
          .select('n data'); // Only retrieve chunk order and data fields

        // 5. Combine file metadata and chunks
        modelData.push({
          file,
          chunks: chunks.map(chunk => ({
            order: chunk.n,
            data: chunk.data.toString('base64') // Convert binary data to base64
          }))
        });
      }
    }

    // 6. Return the combined data as JSON
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
