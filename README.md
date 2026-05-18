# 🔐 Login Portal - Full Stack Application with CI/CD Deployment

A production-ready, full-stack authentication system built with Node.js, Express, MongoDB, and deployed using GitHub, Jenkins, and AWS EC2.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
- [AWS EC2 Deployment](#aws-ec2-deployment)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### Authentication
- ✅ User signup with validation
- ✅ User login with session management
- ✅ Logout functionality
- ✅ Password hashing using bcrypt
- ✅ Session persistence with MongoDB
- ✅ Protected dashboard routes
- ✅ Flash messages for user feedback

### Frontend
- ✅ Responsive modern UI with CSS
- ✅ Home page with feature showcase
- ✅ Signup page with form validation
- ✅ Login page with remember me
- ✅ Protected dashboard page
- ✅ Clean navigation bar
- ✅ Mobile-friendly design

### Backend
- ✅ Express.js REST API
- ✅ MongoDB Atlas integration
- ✅ Mongoose ORM for data modeling
- ✅ Session management with express-session
- ✅ Error handling middleware
- ✅ Security middleware (Helmet)
- ✅ Environment variable configuration
- ✅ MVC folder structure

### DevOps
- ✅ GitHub version control
- ✅ Jenkins CI/CD pipeline
- ✅ Automated testing
- ✅ AWS EC2 deployment
- ✅ PM2 process management
- ✅ Continuous deployment

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript, EJS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | bcryptjs, express-session |
| **DevOps** | GitHub, Jenkins, AWS EC2 |
| **Process Manager** | PM2 |
| **Security** | Helmet, bcryptjs |

## 📁 Project Structure

```
LoginPortal/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   └── authController.js        # Authentication logic
├── middleware/
│   └── auth.js                  # Authentication middleware
├── models/
│   └── User.js                  # User schema
├── public/
│   ├── css/
│   │   └── style.css           # Styling
│   └── js/
│       └── validation.js        # Client-side validation
├── routes/
│   └── auth.js                  # Auth routes
├── views/
│   ├── layout.ejs              # Base layout
│   ├── index.ejs               # Home page
│   ├── signup.ejs              # Signup page
│   ├── login.ejs               # Login page
│   ├── dashboard.ejs           # Dashboard (protected)
│   ├── 404.ejs                 # 404 error
│   └── error.ejs               # Error page
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── Jenkinsfile                  # CI/CD pipeline
├── package.json                 # Dependencies
├── server.js                    # Main server file
├── AWS-EC2-SETUP.md            # AWS deployment guide
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18.x or higher
- npm or yarn
- MongoDB Atlas account (free tier available)
- Git

### 2. Clone the Repository

```bash
git clone https://github.com/itsdikshitaa/LoginPortal.git
cd LoginPortal
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/login_portal
SESSION_SECRET=your_super_secret_session_key_change_in_production
NODE_ENV=development
PORT=5000
DB_NAME=login_portal
```

### 5. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 6. Test the Application

- Open http://localhost:5000 in your browser
- Click "Sign Up" and create an account
- Login with your credentials
- Access the protected dashboard

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/login_portal

# Session Configuration
SESSION_SECRET=change_this_to_a_random_secret_in_production

# Application
NODE_ENV=development  # development or production
PORT=5000

# Database
DB_NAME=login_portal
```

⚠️ **Security**: Never commit `.env` file to version control

## 💻 Development

### Available Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Project Setup

1. Install Node.js dependencies
2. Configure MongoDB Atlas
3. Create `.env` file
4. Run `npm run dev`

## 🗄️ Database Setup

### MongoDB Atlas Setup

1. **Create Account**: Go to https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: 
   - Click "Create Cluster"
   - Choose free tier (M0)
   - Select your region
   - Create cluster
3. **Create User**:
   - Go to Database Access
   - Add Database User
   - Username: itsdikshitaa
   - Password: your_password
4. **Whitelist IP**:
   - Go to Network Access
   - Add IP Address
   - Allow from anywhere (0.0.0.0/0) for development
5. **Get Connection String**:
   - Click Connect on your cluster
   - Select Connect using MongoDB Compass
   - Copy connection string
   - Add to `.env` as `MONGODB_URI`

### User Schema

```javascript
{
  username: String (3-30 chars, unique),
  email: String (unique, validated),
  password: String (hashed with bcrypt),
  createdAt: Date (auto-generated)
}
```

## 📦 Deployment

### Local Deployment

```bash
# Build for production
npm install --only=production

# Start server
NODE_ENV=production npm start
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t login-portal .
docker run -p 5000:5000 --env-file .env login-portal
```

## 🔄 Jenkins CI/CD Pipeline

### Pipeline Stages

1. **Clone Repository** - Pulls code from GitHub
2. **Install Dependencies** - Installs npm packages
3. **Run Tests** - Executes test suite
4. **Build Application** - Prepares for deployment
5. **Deploy to AWS EC2** - Deploys to production
6. **Verify Deployment** - Tests application health

### Jenkins Setup

1. Create new Pipeline job in Jenkins
2. Configure GitHub webhook
3. Add credentials for AWS EC2
4. Build the pipeline

See `Jenkinsfile` for detailed pipeline configuration.

## ☁️ AWS EC2 Deployment

### Quick Deployment Commands

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone repository
git clone https://github.com/itsdikshitaa/LoginPortal.git
cd LoginPortal

# Install dependencies
npm install

# Create .env file
nano .env
# Add your configuration

# Start with PM2
pm2 start server.js --name "login-portal"
pm2 save
```

For detailed setup instructions, see `AWS-EC2-SETUP.md`

### Accessing Application

```
http://your-ec2-public-ip:5000
```

## 🔒 Security Features

- ✅ **Password Hashing**: bcryptjs with 10 salt rounds
- ✅ **Session Management**: Secure, HTTP-only cookies
- ✅ **Input Validation**: Server and client-side validation
- ✅ **CSRF Protection**: Ready for integration
- ✅ **Security Headers**: Helmet middleware
- ✅ **Environment Secrets**: Stored in .env file
- ✅ **Protected Routes**: Authentication middleware
- ✅ **Error Handling**: Proper error messages without leaking details

## 📡 API Endpoints

### Authentication Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---|
| GET | `/` | Home page | No |
| GET | `/login` | Login page | No |
| POST | `/auth/login` | Handle login | No |
| GET | `/signup` | Signup page | No |
| POST | `/auth/signup` | Handle signup | No |
| GET | `/dashboard` | User dashboard | Yes |
| GET | `/auth/logout` | Logout user | Yes |

### Response Examples

**Successful Login**:
```json
{
  "message": "Welcome back, username!",
  "redirect": "/dashboard"
}
```

**Login Error**:
```json
{
  "error": "Email or password is incorrect"
}
```

## 🐛 Troubleshooting

### Application won't start

```bash
# Check if port 5000 is in use
lsof -i :5000

# Check error logs
npm run dev  # Run in dev mode to see detailed errors
```

### MongoDB connection error

```
Error: connect ECONNREFUSED
```

**Solution**:
- Verify MongoDB URI in `.env`
- Check MongoDB Atlas cluster is running
- Verify IP is whitelisted in Network Access
- Check credentials are correct

### Session not persisting

**Solution**:
- Verify MongoDB connection is working
- Check SESSION_SECRET is set in .env
- Clear browser cookies and try again

### Port already in use

```bash
# Change port in .env or find and kill process
kill -9 $(lsof -t -i :5000)
```

### PM2 issues on EC2

```bash
# View PM2 logs
pm2 logs login-portal

# Restart application
pm2 restart login-portal

# Reset PM2
pm2 kill
pm2 start server.js --name "login-portal"
```

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Jenkins Pipeline Guide](https://www.jenkins.io/doc/book/pipeline/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your-email@example.com
- Documentation: Check AWS-EC2-SETUP.md for deployment help

## 🎯 Roadmap

- [ ] Two-factor authentication (2FA)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] User profile management
- [ ] OAuth integration (Google, GitHub)
- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Automated backup for MongoDB
- [ ] CloudWatch monitoring
- [ ] Load balancing with AWS ALB

## 📊 Project Status

🟢 **Active Development** - Currently maintained and updated

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained by**: Your Name/Team

---

## Quick Links

- 🌐 [Live Demo](#) - Coming soon
- 📖 [Full Documentation](./AWS-EC2-SETUP.md)
- 🐛 [Report a Bug](./issues)
- 💡 [Request a Feature](./issues)
- 📧 [Contact Us](#support)

**Built with ❤️ using Node.js, Express, and MongoDB**
