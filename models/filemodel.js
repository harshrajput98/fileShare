const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uuid: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  sender: { type: String, default: '' },
  reciever: { type: String, default: '' },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
