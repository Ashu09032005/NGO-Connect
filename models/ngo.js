const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  cause: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  needs: {
    type: [String],
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('NGO', ngoSchema);
