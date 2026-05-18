import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'express-flash';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import dotenv from 'dotenv';
import readline from 'readline/promises';
import { stdin, stdout } from 'node:process';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import isAuthenticated from './middleware/auth.js';

// Load environment variables
dotenv.config({ path: './.env' });

const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();

async function askQuestion(promptText) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(promptText);
  rl.close();
  return answer.trim();
}

async function ensureConfig() {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length === 0) {
    return;
  }

  console.log('⚠️  Missing required environment variables:', missingVars.join(', '));
  console.log('Please enter them now.');

  for (const key of missingVars) {
    const value = await askQuestion(`${key}: `);

    if (!value) {
      console.error(`Error: ${key} is required.`);
      process.exit(1);
    }

    process.env[key] = value;
  }
}

async function startServer() {
  await ensureConfig();
  await connectDB();

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layout');

  // Middleware stack
  app.use(helmet()); // Security headers
  app.use(express.urlencoded({ extended: false })); // Parse form data
  app.use(express.json()); // Parse JSON

  // Static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      },
      name: 'sessionId',
    })
  );

  // Flash messages middleware
  app.use(flash());

  // Middleware to pass user data and query-based messages to views
  app.use((req, res, next) => {
    if (req.session && req.session.user) {
      res.locals.user = req.session.user;
    }
    res.locals.messages = req.flash();
    if (req.query.logout === '1') {
      res.locals.messages.success = res.locals.messages.success || [];
      res.locals.messages.success.push('You have logged out successfully');
    }
    next();
  });

  // Routes

  // Home page route
  app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
  });

  // Authentication routes
  app.use('/auth', authRoutes);

  // Dashboard route (protected)
  app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
  });

  // Login page shortcut
  app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
  });

  // Signup page shortcut
  app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
  });

  // 404 error handling
  app.use((req, res) => {
    res.status(404).render('404');
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).render('error', {
      message: err.message || 'An error occurred',
    });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
