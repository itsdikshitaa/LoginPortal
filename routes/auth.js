import express from 'express';
import * as authController from '../controllers/authController.js';
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/logout', isAuthenticated, authController.logout);

export default router;
