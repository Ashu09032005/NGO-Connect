const express = require('express');
const mongoose = require('mongoose'); // ✅ MISSING IMPORT
const app = express();
const path = require('path');
const NGO = require('./models/ngo');

// Serve static files (like CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngo-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Home route
app.get('/', (req, res) => {
  res.render('home'); // renders views/home.ejs
});

// NGO list route
app.get('/ngos', async (req, res) => {
  try {
    const ngos = await NGO.find({});
    res.render('ngos', { ngos }); // renders views/ngo.ejs
  } catch (err) {
    console.error("Error fetching NGOs:", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/ngos/:id', async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  res.render('ngodetail', { ngo });
});

// Handle contact form
app.post('/contact', (req, res) => {
  const { name, email, message, ngoName } = req.body;
  console.log(`Message for ${ngoName}: From ${name} (${email}) => ${message}`);
  res.send('Message sent!');
});


// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
