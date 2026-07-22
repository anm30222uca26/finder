import { body, validationResult } from 'express-validator';

export const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const favoriteValidation = [
  body('placeId').trim().notEmpty().withMessage('Place ID is required'),
  body('name').trim().notEmpty().withMessage('Place name is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('address').optional().isString(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('photoUrl').optional().isString(),
  body('types').optional().isArray(),
];

export const historyValidation = [
  body('keyword').trim().notEmpty().withMessage('Search keyword is required'),
  body('location').optional().isString(),
  body('category').optional().isString(),
  body('lat').optional().isFloat(),
  body('lng').optional().isFloat(),
];

/**
 * Middleware to handle express-validator results.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};
