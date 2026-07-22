import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';
import { favoriteValidation, validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getFavorites);
router.post('/', favoriteValidation, validate, addFavorite);
router.get('/check/:placeId', checkFavorite);
router.delete('/:placeId', removeFavorite);

export default router;
