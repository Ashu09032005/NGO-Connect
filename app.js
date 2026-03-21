const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Models
const Contact = require('./models/contact');
const NGO = require('./models/ngo');
const User = require('./models/user');

// Cloudinary
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });

const app = express();

// ✅ FIX 1: MongoDB connection using ENV
mongoose.connect(process.env.DB_URL)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

app.set('layout', 'layouts/boilerplate');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
    name: "session",
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Auth middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

// ✅ FIX 2: NGOs route safe
app.get('/ngos', async (req, res) => {
  try {
    const ngos = await NGO.find({});
    res.render('ngos', { ngos });
  } catch (err) {
    console.error("❌ NGO FETCH ERROR:", err);
    res.status(500).send("Database Error");
  }
});

// New NGO form
app.get('/ngos/new', isLoggedIn, (req, res) => {
  res.render('newngo');
});

// Create NGO
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
    console.error("❌ NGO SAVE ERROR:", err);
    res.status(500).send("Error saving NGO");
  }
});

// NGO detail
app.get('/ngos/:id', isLoggedIn, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    res.render('ngodetail', { ngo });
  } catch (err) {
    console.error(err);
    res.send("Error loading NGO");
  }
});

// Contact
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
    res.send('Message sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving message");
  }
});

// Register
app.get('/register', (req, res) => {
  res.render('register');
});

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

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

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

// ✅ FIX 3: PORT for deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});