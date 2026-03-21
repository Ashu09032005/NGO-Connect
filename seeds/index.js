const mongoose = require('mongoose');
const fs = require('fs');
const NGO = require('../models/ngo.js'); // Your NGO Mongoose model
const ngos = require('./ngo.js'); // NGOs data

mongoose.connect('mongodb://localhost:27017/ngo-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Seeder function
const seedDB = async () => {
  await NGO.deleteMany({});
  console.log("Old NGOs deleted");

  for (let i = 0; i < ngos.length; i++) {
    const ngoData = ngos[i];
    console.log(`Processing NGO ${i + 1}:`, ngoData);

    const ngo = new NGO({
      name: ngoData.name,
      location: ngoData.location,
      cause: ngoData.cause,
      category: ngoData.category || ngoData.cause || ['General'],
      description: ngoData.description,
      needs: ngoData.needs,
      imageURL: ngoData.imageURL || 'https://placehold.co/400x300?text=NGO',
      website: ngoData.website || 'https://example.com',
      contact: ngoData.contact || '0000000000',
      createdBy: ngoData.createdBy || 'seed-script'
    });

    console.log('Prepared NGO object:', ngo);

    try {
      console.log(`Saving NGO: ${ngo.name}`);
      await ngo.save();
      console.log(`Successfully saved: ${ngo.name}`);
    } catch (err) {
      console.error(`❌ Error saving ${ngo.name}:`, err.message);
    }
  }
};

// ✅ Correct placement of function call and final log
seedDB().then(() => {
  console.log("✅ All NGOs seeded successfully");
  mongoose.connection.close();
});
