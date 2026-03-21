const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  contact: String,
  website: String,
  createdBy: String,
  cause: [String],
  needs: [String],
  imageURL: String
});

module.exports = mongoose.model('NGO', ngoSchema);
