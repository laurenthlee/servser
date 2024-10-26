    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const bodyParser = require('body-parser');

    const app = express();
    const PORT = process.env.PORT || 3000; 

    // Encode special characters in the password
    const username = 'admin';
    const password = encodeURIComponent("@Lauren2040"); // Use encodeURIComponent to handle special characters

    // MongoDB Atlas connection string with your credentials
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

    // Root route for '/'
    app.get('/', (req, res) => {
    res.send('Welcome to the API! Use /api/models to access model data.');
    });

    // Route to get models with pagination, sorting, and field limiting
    app.get('/api/models', async (req, res) => {
    // Get pagination, sorting, and limit parameters from the query
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

    try {
        // Fetch models with pagination, sorting, and limiting fields
        const models = await Model.find({}, 'name description') // Only return name and description fields
        .limit(Number(limit)) // Limit results per page
        .skip((page - 1) * limit) // Skip to the correct page
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }) // Sorting
        .exec();

        const count = await Model.countDocuments(); // Total count of documents

        // Return paginated results along with total page count and current page
        res.json({
        models,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Route to create a new model
    app.post('/api/models', async (req, res) => {
    const { name, description } = req.body;
    const newModel = new Model({ name, description });
    try {
        const savedModel = await newModel.save();
        res.status(201).json(savedModel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`)
    })
