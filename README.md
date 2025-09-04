# JobPulse

A lightweight job aggregation platform that pulls jobs from RemoteOK, normalizes data, and provides analytics and search capabilities.

## 🚀 Features

- **Job Ingestion**: Hourly sync from RemoteOK API
- **Data Processing**: Salary parsing (USD/GBP/NGN), location normalization, skills extraction
- **Search**: Full-text search with advanced filtering
- **Analytics**: Trends, top skills, companies, and locations
- **Dashboard**: Real-time KPIs and visualizations
- **Public API**: Read-only endpoints with caching and rate limiting
- **Modern UI**: Responsive React frontend with Tailwind CSS

## 🏗️ Architecture

```
JobPulse/
├── backend/          # Express.js API with TypeScript
├── frontend/         # React SPA with Vite
└── docker-compose.yml
```

### Backend Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Caching**: In-memory LRU cache
- **Scheduling**: node-cron for automated tasks
- **Logging**: Pino with file rotation

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for development)

### Using Docker Compose (Recommended)

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd JobPulse
   ```

2. **Start all services**:

   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Database: localhost:5432

### Manual Development Setup

#### Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run drizzle:generate
npm run drizzle:migrate
npm run seed:skills
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
cp env.example .env
# Edit .env with your API base URL
npm run dev
```

## 📊 API Endpoints

### Health Check

- `GET /health` - Health status

### Jobs

- `GET /jobs` - Search and filter jobs
- `GET /jobs/:id` - Get job details

### Analytics

- `GET /skills/top?since=7d` - Top skills
- `GET /trends/skill/:name?since=30d` - Skill trends
- `GET /companies/top?since=7d` - Top companies
- `GET /locations/top?since=7d` - Top locations

### Admin

- `POST /admin/sync` - Manual sync trigger

## 🗄️ Database Schema

### Core Tables

- `jobs` - Job listings with search vectors
- `companies` - Company information
- `locations` - Location data
- `skills` - Skills catalog
- `job_skills` - Job-skill relationships
- `ingestions` - Sync history

### Views & Materialized Views

- `mv_skill_counts_daily` - Daily skill counts
- `v_skill_cooccurrence` - Skill co-occurrence analysis

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://app:app@db:5432/jobpulse
REMOTEOK_API_URL=https://remoteok.com/api
FRONTEND_ORIGIN=http://localhost:5173
CRON_SCHEDULE=0 * * * *
LOG_LEVEL=info
```

#### Frontend (.env)

```env
VITE_API_BASE=http://localhost:4000
```

## 📈 Features in Detail

### Job Ingestion

- Fetches jobs from RemoteOK API hourly
- Parses salary information (USD, GBP, NGN)
- Normalizes locations (US, London, Nigeria)
- Extracts skills from job descriptions
- Handles duplicates and updates

### Data Processing

- **Salary Parsing**: Supports multiple currencies and formats
- **Location Normalization**: Maps to structured data
- **Skills Extraction**: Uses curated skills list with auto-discovery
- **Content Deduplication**: MD5 hashing for duplicate detection

### Search & Analytics

- **Full-text Search**: PostgreSQL search vectors
- **Advanced Filtering**: Role, skills, location, salary, date range
- **Trend Analysis**: Time-series data for skills
- **Top Rankings**: Companies, locations, skills

### Performance

- **Caching**: In-memory LRU cache with TTL
- **Rate Limiting**: Per-IP request limiting
- **Database Optimization**: Indexes, materialized views
- **CDN Ready**: Static asset optimization

## 🛠️ Development

### Scripts

#### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run drizzle:generate  # Generate migrations
npm run drizzle:migrate   # Run migrations
npm run seed:skills       # Seed skills data
npm run sync:once         # Run one-time sync
```

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Migrations

```bash
cd backend
npm run drizzle:generate
npm run drizzle:migrate
```

### Adding New Features

1. **Backend**: Follow clean architecture pattern

   - Domain entities in `src/domain/entities/`
   - Repositories in `src/domain/repositories/`
   - Services in `src/domain/services/`
   - Controllers in `src/presentation/controllers/`

2. **Frontend**: Component-based structure
   - Pages in `src/pages/`
   - Components in `src/components/`
   - API client in `src/lib/api.ts`

## 📊 Monitoring & Logging

- **Health Checks**: All services have health endpoints
- **Structured Logging**: Pino logger with request tracking
- **Error Handling**: Comprehensive error responses
- **Metrics**: Cache statistics and API usage

## 🔒 Security

- **CORS**: Configured for frontend origin
- **Rate Limiting**: Per-IP request limiting
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Drizzle ORM
- **XSS Protection**: Helmet.js middleware

## 🚀 Deployment

### Production Considerations

- Use environment-specific configurations
- Set up proper logging and monitoring
- Configure database backups
- Set up SSL/TLS certificates
- Configure CDN for static assets

### Scaling

- Database connection pooling
- Redis for distributed caching
- Load balancer for multiple instances
- Horizontal scaling with container orchestration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**JobPulse** - Making job market insights accessible and actionable.
