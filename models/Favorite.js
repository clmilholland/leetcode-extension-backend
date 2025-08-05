const mongoose = require('mongoose')
const {problemSchema} = require('./Problem');


const userFavoritesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    favoriteProblems: [problemSchema],
    updatedAt: { type: Date, default: Date.now }
});

// Update 'updatedAt' timestamp on document update
userFavoritesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserFavorites = mongoose.model('UserFavorites', userFavoritesSchema);

module.exports = UserFavorites;