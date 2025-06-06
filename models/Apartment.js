const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    neighborhood: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' }, 
      coordinates: { type: [Number], required: true, index: '2dsphere' } 
    }
  },
  price: { type: Number, required: true },
  bedrooms: {type: Number, required: true},
  images: { type: [String], required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  amenities: { type: [String], required: true },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});


apartmentSchema.index({ 'location.coordinates': '2dsphere' });

const Apartment = mongoose.model('Apartment', apartmentSchema);


module.exports = Apartment;