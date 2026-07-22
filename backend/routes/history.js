import express from 'express';
import {
  getHistory,
  addHistory,
  clearHistory,
  deleteHistoryItem,
} from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';
import { historyValidation, validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getHistory);
router.post('/', historyValidation, validate, addHistory);
router.delete('/', clearHistory);
router.delete('/:id', deleteHistoryItem);

export default router;
