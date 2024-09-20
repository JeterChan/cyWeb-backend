const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    data: Buffer,        // Store the image data as a Buffer
    contentType: String, // Store the image type (e.g., 'image/png', 'image/jpeg')
    filename: String,    // Store the image filename or other metadata
})

module.exports = mongoose.model('image',imageSchema);