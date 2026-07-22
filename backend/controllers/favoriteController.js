import Favorite from '../models/Favorite.js';

/**
 * Get all favorites for the authenticated user.
 */
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { favorites } });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a place to favorites.
 */
export const addFavorite = async (req, res, next) => {
  try {
    const { placeId, name, address, rating, photoUrl, lat, lng, types } = req.body;

    const existing = await Favorite.findOne({ user: req.user._id, placeId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Place already in favorites.' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      placeId,
      name,
      address,
      rating,
      photoUrl,
      lat,
      lng,
      types,
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites.',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a favorite by place ID.
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      placeId: req.params.placeId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found.' });
    }

    res.json({ success: true, message: 'Removed from favorites.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a place is favorited.
 */
export const checkFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      placeId: req.params.placeId,
    });

    res.json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error) {
    next(error);
  }
};
