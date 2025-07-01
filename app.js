const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

// Models
const Contact = require('./models/contact');

const NGO = require('./models/ngo');
const User = require('./models/user');

// Cloudinary for image uploads
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngo-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Middleware setup
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('layout', 'layouts/boilerplate');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session config
const sessionConfig = {
    name: "session",
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make current user available in all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Authorization middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Routes
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
app.get('/ngos/new', isLoggedIn, (req, res) => {
  res.render('newngo');
});

// Handle NGO creation with image upload
app.post('/ngos/new', isLoggedIn, upload.single('image'), async (req, res) => {
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
app.get('/ngos/:id',isLoggedIn,async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  res.render('ngodetail', { ngo });
});
//Contact
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message, ngoName, selectedNeeds } = req.body;

    const newContact = new Contact({
      ngoName,
      name,
      email,
      selectedNeeds: Array.isArray(selectedNeeds) ? selectedNeeds : [selectedNeeds],
      message
    });

    await newContact.save();
    res.send('✅ Message sent and saved to database!');
  } catch (err) {
    console.error("❌ Error saving contact message:", err);
    res.status(500).send("Something went wrong while saving the message.");
  }
});

// Edit NGO
app.get('/ngos/:id/edit', isLoggedIn, async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  res.render('ngoedit', { ngo });
});



// ====================
// AUTH ROUTES
// ====================

// Register form
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration
app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.redirect('/ngos');
    });
  } catch (e) {
    console.error(e);
    res.send('Registration failed');
  }
});

// Login form
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/ngos');
});

// Logout
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
