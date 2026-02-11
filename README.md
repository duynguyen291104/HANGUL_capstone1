# Korean TOPIK 1 Vocabulary Learning Web App

A modern, interactive web application for learning Korean TOPIK Level 1 vocabulary with games, flashcards, and progress tracking.

## ✨ Features

### 📚 Core Functionality
- **Vocabulary Management**: Import, organize, and search through Korean vocabulary
- **Audio Pronunciation**: Web Speech API integration with Korean TTS
- **Progress Tracking**: Track learning progress with spaced repetition algorithms
- **Data Import**: Support for TSV/CSV files with "STT | Từ vựng | Nghĩa" format

### 🎮 Learning Methods
- **Interactive Flashcards**: Spaced repetition system for efficient memorization
- **Mini Games**: 5 engaging games for vocabulary practice
  - Multiple Choice Quiz
  - Listening Comprehension
  - Typing Practice
  - Matching Pairs
  - Speed Run Challenge
- **Library**: Browse and filter vocabulary by tags, levels, and search terms

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dark/Light Mode**: Theme switching with system preference detection
- **Progressive Web App**: Installable with offline capabilities
- **Accessible**: ARIA labels and keyboard navigation support

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **Database**: PostgreSQL 16 with Prisma ORM
- **ORM**: Prisma 7 with driver adapters
- **Audio**: Web Speech API
- **Icons**: Lucide React
- **Container**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel-ready / Docker deployable

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- Docker & Docker Compose
- npm or yarn

### Quick Start with Make

```bash
# Full setup (install, docker, migrate, seed)
make setup

# Start development
make dev
```

### Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/duynguyen291104/korean-topik-learning-app.git
cd korean-topik-learning-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env if needed
```

4. **Start Docker containers (PostgreSQL + PgAdmin)**
```bash
docker compose up -d
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed sample data**
```bash
npm run prisma:seed
```

7. **Start development server**
```bash
npm run dev
```

8. **Open your browser**
Navigate to `http://localhost:3000`

### Database Management

**PgAdmin Web Interface**: `http://localhost:5050`
- Email: `admin@topik.com`
- Password: `admin123`

**Prisma Studio**: Run `make db-studio` or `npm run prisma:studio`

### Available Commands

```bash
# Development
make dev              # Start dev server
make build            # Build for production
make start            # Start production server

# Docker
make docker-up        # Start PostgreSQL & PgAdmin
make docker-down      # Stop containers
make docker-restart   # Restart containers
make docker-reset     # Reset containers & data

# Database
make db-migrate       # Run migrations
make db-seed          # Seed sample data
make db-studio        # Open Prisma Studio
make db-test          # Test database connection
make db-reset         # Reset database

# Testing & Linting
make test             # Run tests
make lint             # Run ESLint
make lint-fix         # Fix ESLint errors

# Help
make help             # Show all commands
```

### Sample Data

The application includes 5 sample Korean vocabulary words:
- 안녕하세요 - Xin chào
- 감사합니다 - Cảm ơn
- 미안합니다 - Xin lỗi
- 네 - Vâng/Có
- 아니요 - Không

Database is seeded automatically during setup.

## 📁 Project Structure

```
/app                 # Next.js App Router pages
├── page.tsx         # Home dashboard
├── import/          # Data import functionality
├── library/         # Vocabulary browser
├── flashcards/      # Spaced repetition system
├── games/           # Interactive learning games
├── progress/        # Statistics and achievements
└── settings/        # User preferences

/components          # Reusable UI components
├── ui/              # shadcn/ui components
└── Navigation.tsx   # App navigation

/lib                 # Core utilities and types
├── types.ts         # TypeScript interfaces
├── database.ts      # IndexedDB wrapper
└── utils.ts         # Helper functions

/stores              # Zustand state management
├── vocabulary.ts    # Vocabulary data store
├── progress.ts      # Learning progress store
└── settings.ts      # User settings store

/utils               # Specialized utilities
├── speech.ts        # Web Speech API wrapper
├── romanization.ts  # Korean romanization
├── spaced-repetition.ts # SM-2 algorithm
└── import-parser.ts # Data parsing utilities

/data                # Static data and samples
└── sample-vocab.ts  # Sample vocabulary data
```

## 📊 Data Format

### Import Format
The application accepts vocabulary data in TSV (Tab-Separated Values) format:

```
STT	Từ vựng	Nghĩa
1	안녕하세요	Hello (formal)
2	감사합니다	Thank you
3	죄송합니다	I'm sorry
```

### Supported File Types
- `.tsv` files (recommended)
- `.csv` files with tab or comma separation
- Copy/paste from Excel or Google Sheets

### Data Structure
Each vocabulary entry includes:
- **STT**: Sequential number
- **Korean**: Korean vocabulary word/phrase
- **Meaning**: English translation
- **Level**: TOPIK level (1-6)
- **Tags**: Categories (greeting, verb, noun, etc.)
- **Pronunciation**: Romanized pronunciation (auto-generated)

## 🎯 Learning Features

### Spaced Repetition System
- Based on the proven SM-2 algorithm
- Adaptive scheduling based on your performance
- Optimal review intervals for long-term retention

### Audio Pronunciation
- Native Korean text-to-speech
- Adjustable playback speed
- Repeat functionality for practice

### Progress Tracking
- Overall learning statistics
- Performance metrics per category
- Achievement system with milestones

## 🌐 Deployment

See detailed deployment guides:
- **[Database & DevOps Setup](./DATABASE_README.md)** - PostgreSQL, Prisma, Docker
- **[Deployment Guide](./DEPLOYMENT.md)** - Vercel, VPS, Docker, CI/CD

### Quick Deploy Options

**Vercel** (Recommended for easy deployment):
```bash
npm i -g vercel
vercel
```

**Docker**:
```bash
docker build -t topik-app .
docker run -p 3000:3000 topik-app
```

**Production with Docker Compose**:
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Required for production:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## 🧪 API Endpoints

- `GET /api/health` - Health check & database status
- `GET /api/vocabulary` - Fetch all vocabulary
- `GET /api/vocabulary?query=안녕` - Search vocabulary
- `POST /api/vocabulary` - Add new vocabulary

## 🔒 Security

- Environment variables for sensitive data
- PostgreSQL with password authentication
- Docker container isolation
- SSL/TLS support for production
- Regular security audits via GitHub Actions

## 📊 Database Schema

Tables:
- `vocabulary` - Korean vocabulary items
- `vocab_progress` - Learning progress tracking
- `game_results` - Game performance history
- `user_stats` - Overall statistics
- `user_settings` - User preferences
- `study_sessions` - Study session logs

See [Prisma Schema](./prisma/schema.prisma) for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Korean language learning community
- Next.js team for the amazing framework
- shadcn/ui for beautiful components
- Prisma for excellent ORM
- All contributors and testers

## 📧 Contact

- GitHub: [@duynguyen291104](https://github.com/duynguyen291104)
- Repository: [korean-topik-learning-app](https://github.com/duynguyen291104/korean-topik-learning-app)

---

Made with ❤️ for Korean language learners

### Deploy to Vercel
1. **Connect to Vercel**
```bash
npx vercel
```

2. **Configure environment** (if needed)
```bash
# No environment variables required for basic functionality
```

3. **Deploy**
```bash
vercel --prod
```

### Build for Production
```bash
npm run build
npm start
```

## 📱 PWA Features

The app includes Progressive Web App capabilities:
- **Offline functionality**: Core features work without internet
- **Install prompt**: Add to home screen on mobile devices
- **Background sync**: Sync progress when connection returns

## 🔧 Configuration

### Settings Available
- **Theme**: Light/Dark/System preference
- **Language**: Korean TTS voice selection
- **Audio**: Playback speed and volume
- **Learning**: Spaced repetition intervals
- **Data**: Export/import user progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Check the `/docs` folder for detailed guides

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete Next.js setup with TypeScript
- ✅ Vocabulary import and management system
- ✅ Audio pronunciation with Web Speech API
- ✅ Responsive UI with dark/light mode
- ✅ IndexedDB data storage
- ✅ Sample vocabulary data (50 words)
- 🔄 Flashcards system (in progress)
- 🔄 Learning games (in progress)
- 🔄 PWA implementation (planned)

---

**Happy Learning! 🇰🇷 화이팅!**
