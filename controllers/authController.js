import User from '../models/User.js';

// Render signup page
export const getSignup = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('signup', { title: 'Sign Up' });
};

// Handle user signup
export const postSignup = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
      req.flash('error', 'Please provide all required fields');
      return res.redirect('/auth/signup');
    }

    if (password !== passwordConfirm) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/signup');
    }

    // Check if user already exists
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      req.flash('error', 'Email or username already in use');
      return res.redirect('/auth/signup');
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Set session
    req.session.userId = newUser._id;
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };

    req.flash('success', 'User registered successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Signup error:', error.message);
    req.flash('error', error.message || 'An error occurred during signup');
    res.redirect('/auth/signup');
  }
};

// Render login page
export const getLogin = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login' });
};

// Handle user login
export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash('error', 'Please provide email and password');
      return res.redirect('/login');
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Email or password is incorrect');
      return res.redirect('/login');
    }

    // Set session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    req.session.showGif = true;

    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error.message);
    req.flash('error', error.message || 'An error occurred during login');
    res.redirect('/login');
  }
};

// Handle user logout
export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Session destroy error:', error);
      return res.redirect('/dashboard');
    }
    res.clearCookie('sessionId');
    res.redirect('/?logout=1');
  });
};
