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
import https from 'https';
import http from 'http';
import fs from 'fs';

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

  const basePathRaw = process.env.BASE_PATH || '';
  const basePath =
    basePathRaw && basePathRaw !== '/'
      ? `/${basePathRaw.replace(/^\/+|\/+$/g, '')}`
      : '';

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layout');

  // Middleware stack
  // Security headers
  // IMPORTANT: This app is currently served over plain HTTP (port 80 via nginx).
  // Helmet's default CSP includes `upgrade-insecure-requests`, which forces browsers
  // to rewrite http:// asset URLs to https:// and breaks CSS/JS when public 443 isn't open.
  // So we keep CSP defaults but disable that directive.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'upgrade-insecure-requests': null,
          'img-src': ["'self'", 'https://media1.giphy.com', 'https://media.giphy.com', 'https://i.giphy.com'],
        },
      },
    })
  );
  
  // Trust proxy and redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    app.use((req, res, next) => {
      // When nginx reverse proxy is used, `req.secure` reflects the original protocol
      // once `trust proxy` is enabled. Avoid redirect loops when headers are missing
      // or contain multiple values (e.g. "https,http").
      if (req.secure) return next();
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();

      const host = req.header('host');
      if (!host) return next();

      return res.redirect(301, `https://${host}${req.originalUrl}`);
    });
  }
  
  app.use(express.urlencoded({ extended: false })); // Parse form data
  app.use(express.json()); // Parse JSON

  // Static files - serve BEFORE session middleware
  // Supports optional reverse-proxy subpath deployments via BASE_PATH.
  app.use(basePath || '/', express.static(path.join(__dirname, 'public')));

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
        secure: process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true',
        sameSite: 'strict', // CSRF protection
      },
      name: 'sessionId',
      proxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production', // Trust nginx reverse proxy
    })
  );

  // Flash messages middleware
  app.use(flash());

  // Middleware to pass user data and query-based messages to views
  app.use((req, res, next) => {
    res.locals.basePath = basePath;
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
    const showGif = req.session.showGif;
    delete req.session.showGif;
    res.render('dashboard', {
      user: req.session.user,
      showGif,
    });
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
  const HOST = process.env.HOST || '0.0.0.0';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  
  // Check if SSL certificates exist for HTTPS
  const certPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs/cert.pem';
  const keyPath = process.env.SSL_KEY_PATH || '/etc/ssl/private/key.pem';
  const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

  if (hasSSL && NODE_ENV === 'production') {
    // HTTPS Server with SSL certificates
    const options = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
    https.createServer(options, app).listen(PORT, HOST, () => {
      console.log(`✓ Secure Server is running on https://${HOST}:${PORT}`);
      if (HOST === '0.0.0.0') {
        console.log(`  Access via your AWS public IP or DNS on port ${PORT} (HTTPS)`);
      }
    });
  } else {
    // HTTP Server (for development or when SSL not available)
    app.listen(PORT, HOST, () => {
      console.log(`✓ Server is running on http://${HOST}:${PORT}`);
      if (HOST === '0.0.0.0') {
        console.log(`  Access via your AWS public IP or DNS on port ${PORT}`);
      }
      if (!hasSSL && NODE_ENV === 'production') {
        console.warn('⚠️  SSL certificates not found. For production HTTPS, configure nginx as reverse proxy or provide SSL certificates.');
      }
    });
  }
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
