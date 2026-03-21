const mongoose = require('mongoose');
require('dotenv').config(); // ✅ load env variables

const NGO = require('../models/ngo.js');
const ngos = require('./ngo.js');

// ✅ FIX 1: use Atlas DB (NOT localhost)
mongoose.connect(process.env.DB_URL)
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Seeder function
const seedDB = async () => {
  try {
    await NGO.deleteMany({});
    console.log("🗑 Old NGOs deleted");

    for (let i = 0; i < ngos.length; i++) {
      const ngoData = ngos[i];

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

      await ngo.save();
      console.log(`✅ Saved: ${ngo.name}`);
    }

    console.log("🌱 All NGOs seeded successfully");

  } catch (err) {
    console.error("❌ Seeding Error:", err);
  }
};

// Run seed
seedDB().then(() => {
  mongoose.connection.close();
});