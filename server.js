const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://mikberra:brooklynCS1@lab6cluster.w1enu.mongodb.net/BLACKSCHOOLS?retryWrites=true&w=majority&appName=Lab6Cluster');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schema for GeoJSON data
const geoSchema = new mongoose.Schema({
  type: { type: String, default: "Feature" },
  properties: { type: Object },
  geometry: {
    type: { type: String, enum: ['Point', 'LineString', 'Polygon'], required: true },
    coordinates: { type: [Number], required: true }
  }
}, { collection: 'Brooklyn' }); // My files come from the Brooklyn folder within the MongoDB cluster

const GeoModel = mongoose.model('GeoCollection', geoSchema);

// API endpoint to get all GeoJSON data
app.get('/api/geojson', async (req, res) => {
  try {
    const features = await GeoModel.find();
    res.json({
      type: "FeatureCollection",
      features: features
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const formSchema = new mongoose.Schema({
 name: { type: String, required: true },
 lon: { type: Number, required: true },
 lat: { type: Number, required: true },  
 notes: { type: String }                 
});

const FormData = mongoose.model('FormData', formSchema);

app.get('/form', (req, res) => {
 res.sendFile(__dirname + '/form.html');
});

app.post('/submit', async (req, res) => {
 const formData = new FormData({
     name: req.body.name,
     lon: req.body.lon,
     lat: req.body.lat,
     notes: req.body.notes || '' //
 });

 try {
     await formData.save();
     res.send('Location data saved to MongoDB!');
 } catch (err) {
     res.status(500).send('Error saving data');
 }
});

