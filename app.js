const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const NGO = require('./models/ngo');
const { storage } = require('./cloudinary/index'); 
const upload = multer({ storage });
const methodOverride = require('method-override');


const app = express();
app.use(methodOverride('_method'));
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
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
  res.render('home');
});

// Show all NGOs
app.get('/ngos', async (req, res) => {
  try {
    const ngos = await NGO.find({});
    res.render('ngos', { ngos });
  } catch (err) {
    console.error("Error fetching NGOs:", err);
    res.status(500).send("Internal Server Error");
  }
});
// Show form to create new NGO
app.get('/ngos/new', (req, res) => {
  res.render('newngo'); // you must have views/newngo.ejs
});
// Handle NGO creation with image upload
app.post('/ngos/new', upload.single('image'), async (req, res) => {
  try {
    const imageURL = req.file.path;
    const { name, description, location, contact, website, createdBy, cause, needs } = req.body;

    const newNGO = new NGO({
      name,
      description,
      location,
      contact,
      website,
      createdBy,
      cause: cause.split(',').map(c => c.trim()),
      needs: needs.split(',').map(n => n.trim()),
      imageURL
    });

    await newNGO.save();
    res.redirect(`/ngos/${newNGO._id}`);
  } catch (err) {
    console.error("❌ Error saving NGO:", err);
    res.status(500).send("Error saving NGO.");
  }
});


// Show NGO details
app.get('/ngos/:id', async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  res.render('ngodetail', { ngo });
});
app.get('/ngos/:id/edit', async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  res.render('ngoedit', { ngo });
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
