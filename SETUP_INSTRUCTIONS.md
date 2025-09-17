# SecurePass Manager - Setup & Run Instructions

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Optional Requirements
- **PostgreSQL**: For production database (Neon cloud database recommended)
- **Code Editor**: VS Code recommended with TypeScript extensions

## Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SecurePassManager.git
cd SecurePassManager
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, client, and server)
npm install

# Or install separately:
npm install                    # Root dependencies
cd client && npm install      # Frontend dependencies
cd ../server && npm install   # Backend dependencies
```

### 3. Environment Configuration

#### Create Environment Files
Create `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/securepass"
NEON_DATABASE_URL="your_neon_database_url_here"

# Development Settings
NODE_ENV=development
PORT=5000

# Local Development Flags
DEV_LOCAL=true
DEV_LOCAL_PERSIST=true
DEV_LOCAL_SEED=true

# Security (Optional - for additional encryption layer)
ENCRYPTION_KEY="your_32_character_encryption_key_here"

# CORS Settings
CORS_ORIGIN="http://localhost:5173"
```

#### Environment Variables Explanation
- `DATABASE_URL`: PostgreSQL connection string for production
- `NEON_DATABASE_URL`: Neon serverless database URL (recommended)
- `DEV_LOCAL`: Enable local development mode
- `DEV_LOCAL_PERSIST`: Persist data in JSON file during development
- `DEV_LOCAL_SEED`: Seed initial data for testing
- `ENCRYPTION_KEY`: Additional server-side encryption (optional)

### 4. Database Setup

#### Option A: Local Development (Recommended for Testing)
No database setup required! The app will use local JSON file storage.

#### Option B: PostgreSQL Database
```bash
# Install PostgreSQL locally
# Create database
createdb securepass

# Run migrations (if using database mode)
npm run db:migrate
```

#### Option C: Neon Cloud Database (Recommended for Production)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `NEON_DATABASE_URL`

## Running the Application

### Development Mode (Recommended)

#### Option 1: Run Both Frontend and Backend Together
```bash
# From root directory - runs both client and server
npm run dev
```

#### Option 2: Run Frontend and Backend Separately
```bash
# Terminal 1 - Backend Server
npm run dev:server

# Terminal 2 - Frontend Client  
npm run dev:client
```

#### Option 3: Local Development with JSON Storage
```bash
# Uses local JSON file for data storage (no database needed)
npm run dev:local
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Available Scripts

### Root Level Scripts
```bash
npm run dev              # Run both client and server in development
npm run dev:client       # Run only frontend (Vite dev server)
npm run dev:server       # Run only backend (Express server)
npm run dev:local        # Run with local JSON storage
npm run build           # Build both client and server for production
npm run start           # Start production server
npm run test            # Run all tests
npm run lint            # Run ESLint on all code
npm run type-check      # TypeScript type checking
```

### Client Scripts
```bash
cd client
npm run dev             # Start Vite development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run frontend tests
npm run lint            # Lint frontend code
```

### Server Scripts
```bash
cd server
npm run dev             # Start development server with hot reload
npm run build           # Compile TypeScript to JavaScript
npm run start           # Start production server
npm run test            # Run backend tests
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data
```

## Application URLs

### Development
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if implemented)

### Production
- **Application**: Your deployed URL
- **API**: Your deployed API URL

## First Time Setup

### 1. Start the Application
```bash
npm run dev:local
```

### 2. Open Your Browser
Navigate to `http://localhost:5173`

### 3. Set Up Master Password
- Click "Set Master Password" on first visit
- Create a strong master password (or use the generator)
- **Important**: Remember this password - it cannot be recovered!

### 4. Create Your First Password
- Click "Add Password" button
- Fill in website, username, and password details
- Use the password generator for strong passwords
- Organize with categories

## Development Workflow

### Code Structure
```
SecurePassManager/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # CSS and styling
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   └── utils/             # Server utilities
├── shared/                # Shared TypeScript types
└── docs/                  # Documentation
```

### Making Changes

#### Frontend Development
1. Navigate to `client/` directory
2. Edit React components in `src/components/`
3. Add new pages in `src/pages/`
4. Update styles with Tailwind CSS classes
5. Hot reload automatically updates the browser

#### Backend Development
1. Navigate to `server/` directory
2. Edit API routes in `routes/`
3. Add middleware in `middleware/`
4. Server automatically restarts with nodemon

#### Database Changes
1. Update schema in `shared/schema.ts`
2. Create migration files if using PostgreSQL
3. Run `npm run db:migrate` to apply changes

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

#### Database Connection Issues
```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
npm run db:test

# Reset local data
rm -f data/local-data.json
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

#### TypeScript Errors
```bash
# Run type checking
npm run type-check

# Update TypeScript definitions
npm update @types/*
```

### Performance Issues
- **Slow Loading**: Check network tab for large bundles
- **Memory Issues**: Restart development server
- **Database Slow**: Check query performance and indexing

### Security Considerations
- **HTTPS**: Use HTTPS in production
- **Environment Variables**: Never commit `.env` files
- **Master Password**: Use strong, unique master passwords
- **Updates**: Keep dependencies updated for security patches

## Testing

### Running Tests
```bash
# All tests
npm test

# Frontend tests only
cd client && npm test

# Backend tests only
cd server && npm test

# Watch mode for development
npm run test:watch
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the client: `cd client && npm run build`
2. Deploy the `client/dist` folder
3. Set environment variables in deployment platform
4. Configure redirects for SPA routing

### Backend Deployment (Railway/Render/Heroku)
1. Build the server: `cd server && npm run build`
2. Deploy with start command: `npm start`
3. Set production environment variables
4. Configure database connection

### Full-Stack Deployment
1. Use platforms like Railway or Render
2. Configure build and start commands
3. Set up database (Neon recommended)
4. Configure CORS for production domains

## Security Best Practices

### Development
- Use HTTPS in production
- Validate all inputs
- Sanitize error messages
- Keep dependencies updated
- Use environment variables for secrets

### Production
- Enable CORS properly
- Use secure headers
- Implement rate limiting
- Monitor for vulnerabilities
- Regular security audits

## Support & Resources

### Documentation
- **API Documentation**: `/docs/api.md`
- **Component Documentation**: `/docs/components.md`
- **Security Guide**: `/docs/security.md`

### Getting Help
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: [your-email@example.com]

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code review process

---

## Quick Start Summary

```bash
# 1. Clone and install
git clone <repository-url>
cd SecurePassManager
npm install

# 2. Start development server
npm run dev:local

# 3. Open browser
# Navigate to http://localhost:5173

# 4. Set up master password and start using!
```

**That's it! You're ready to use SecurePass Manager! 🎉**
