const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  ngoName: String,
  name: String,
  email: String,
  selectedNeeds: [String],
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);
