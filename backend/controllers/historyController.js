import SearchHistory from '../models/SearchHistory.js';

/**
 * Get recent search history for authenticated user.
 */
export const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: { history } });
  } catch (error) {
    next(error);
  }
};

/**
 * Save a search to history.
 */
export const addHistory = async (req, res, next) => {
  try {
    const { keyword, location, category, lat, lng } = req.body;

    const entry = await SearchHistory.create({
      user: req.user._id,
      keyword,
      location,
      category,
      lat,
      lng,
    });

    // Keep only last 50 entries per user
    const count = await SearchHistory.countDocuments({ user: req.user._id });
    if (count > 50) {
      const oldest = await SearchHistory.find({ user: req.user._id })
        .sort({ createdAt: 1 })
        .limit(count - 50)
        .select('_id');
      await SearchHistory.deleteMany({ _id: { $in: oldest.map((e) => e._id) } });
    }

    res.status(201).json({
      success: true,
      message: 'Search saved to history.',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all search history for user.
 */
export const clearHistory = async (req, res, next) => {
  try {
    await SearchHistory.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'Search history cleared.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a single history entry.
 */
export const deleteHistoryItem = async (req, res, next) => {
  try {
    const entry = await SearchHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'History entry not found.' });
    }

    res.json({ success: true, message: 'History entry deleted.' });
  } catch (error) {
    next(error);
  }
};
