import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    placeId: {
      type: String,
      required: [true, 'Place ID is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    types: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites per user
favoriteSchema.index({ user: 1, placeId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
