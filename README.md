git clone https://github.com/Naveenexe/SecurePassManager.git

# 🔐 SecurePass Manager

A secure, modern password management application for storing, managing, and generating strong passwords with advanced encryption and master password protection.

![SecurePass Manager](https://img.shields.io/badge/Security-AES--256-green) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933)

## ✨ Features

- **Master Password Protection**
- **AES-256 Encryption**
- **Zero-Knowledge Architecture**
- **Auto-Lock & Password Recovery**
- **CRUD Password Management**
- **Password Generation & Strength Analysis**
- **Category Organization & Favorites**
- **Modern UI & Accessibility**

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, npm 8+, modern browser

```bash
git clone https://github.com/Naveenexe/SecurePassManager.git
cd SecurePassManager
npm install
npm run dev:local
# Visit http://localhost:5173
```

## 📸 Application Screenshots

<div align="center">

<img src="screenshots/Screenshot (1).png" alt="Screenshot 1" width="600" />
<br/><sub>Screenshot 1</sub>
<br/><br/>
<img src="screenshots/Screenshot (2).png" alt="Screenshot 2" width="600" />
<br/><sub>Screenshot 2</sub>
<br/><br/>
<img src="screenshots/Screenshot (3).png" alt="Screenshot 3" width="600" />
<br/><sub>Screenshot 3</sub>
<br/><br/>
<img src="screenshots/Screenshot (4).png" alt="Screenshot 4" width="600" />
<br/><sub>Screenshot 4</sub>
<br/><br/>
<img src="screenshots/Screenshot (5).png" alt="Screenshot 5" width="600" />
<br/><sub>Screenshot 5</sub>
<br/><br/>
<img src="screenshots/Screenshot (6).png" alt="Screenshot 6" width="600" />
<br/><sub>Screenshot 6</sub>
<br/><br/>
<img src="screenshots/Screenshot (7).png" alt="Screenshot 7" width="600" />
<br/><sub>Screenshot 7</sub>
<br/><br/>
<img src="screenshots/Screenshot (8).png" alt="Screenshot 8" width="600" />
<br/><sub>Screenshot 8</sub>
<br/><br/>
<img src="screenshots/Screenshot (9).png" alt="Screenshot 9" width="600" />
<br/><sub>Screenshot 9</sub>

</div>

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite, React Query, Shadcn/UI

**Backend:** Node.js, Express.js, TypeScript, Drizzle ORM, PostgreSQL

## 📁 Project Structure

```
SecurePassManager/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and encryption
│   │   └── styles/        # CSS and styling
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   └── storage/           # Database and file storage
├── shared/                # Shared TypeScript types and schemas
├── docs/                  # Documentation
└── data/                  # Local development data
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Run both client and server
npm run dev:local        # Run with local JSON storage (recommended for development)
npm run dev:client       # Run only frontend
npm run dev:server       # Run only backend

# Production
npm run build           # Build for production
npm run start           # Start production server

# Testing & Quality
npm run test            # Run all tests
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

### Environment Configuration

Create `.env` file in the root directory:

```env
# Development Settings
NODE_ENV=development
PORT=5000

# Local Development (recommended for testing)
DEV_LOCAL=true
DEV_LOCAL_PERSIST=true
DEV_LOCAL_SEED=true

# Database (for production)
DATABASE_URL="postgresql://username:password@localhost:5432/securepass"
NEON_DATABASE_URL="your_neon_database_url"

# Security
ENCRYPTION_KEY="your_32_character_encryption_key"
CORS_ORIGIN="http://localhost:5173"
```

## 🔐 Security Features

### Encryption Process
1. **Master Password Entry** - User provides master password
2. **Key Derivation** - PBKDF2 with 100,000+ iterations
3. **Data Encryption** - AES-256 with unique salt and IV per entry
4. **Secure Storage** - Only encrypted data stored in database
5. **Real-time Decryption** - Passwords decrypted on-demand in memory

### Security Measures
- ✅ **No plaintext storage** of sensitive data
- ✅ **Client-side encryption** ensures zero-knowledge security
- ✅ **Secure session management** with automatic cleanup
- ✅ **Input validation** and sanitization
- ✅ **HTTPS ready** for production deployment
- ✅ **Rate limiting** and brute force protection

## 📊 Database Schema

### Users
- Profile information and authentication data
- Local profile management system

### Passwords
- Encrypted password entries with metadata
- Category associations and favorites
- Strength scores and usage statistics

### Categories
- User-defined organization system
- Color coding and custom naming

## 🚀 Deployment

### Local Development
```bash
npm run dev:local
```
Uses local JSON file storage - perfect for development and testing.

### Production Deployment

#### Frontend (Netlify/Vercel)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

#### Backend (Railway/Render)
```bash
npm run build
npm start
```

#### Database
- **Recommended**: [Neon](https://neon.tech) - Serverless PostgreSQL
- **Alternative**: Local PostgreSQL or other cloud providers

## 🧪 Testing

### Test Coverage
- **Unit Tests** - Component and utility function testing
- **Integration Tests** - API endpoint and database testing
- **E2E Tests** - Complete user workflow testing
- **Security Tests** - Encryption and authentication validation

```bash
npm run test              # Run all tests
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode for development
```

## 📈 Performance

### Optimization Features
- **Code Splitting** - Lazy loading for faster initial load
- **Bundle Optimization** - Tree shaking and minification
- **Efficient Caching** - Smart browser and server caching
- **Database Indexing** - Optimized query performance

### Metrics
- **< 2 second** initial load time
- **< 100ms** password encryption/decryption
- **Mobile responsive** design
- **Accessibility score: A+**

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain security standards
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Shadcn/UI** - For the beautiful component library
- **Drizzle Team** - For the excellent ORM
- **Security Community** - For encryption best practices

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions
- **Email**: watarenaveen@gmail.com

## 🔮 Future Roadmap

- [ ] **Mobile Apps** - Native iOS and Android applications
- [ ] **Browser Extension** - Direct browser integration
- [ ] **Multi-device Sync** - Secure cloud synchronization
- [ ] **Team Sharing** - Secure password sharing with team members
- [ ] **Biometric Auth** - Fingerprint and face ID support
- [ ] **Advanced Analytics** - Security insights and recommendations

---

**⭐ Star this repository if you find it helpful!**

**🔐 Secure your digital life with SecurePass Manager!**
