# JobPulse Backend

A Node.js/Express backend for the JobPulse job aggregation platform.

## Features

- **Job Ingestion**: Hourly sync from RemoteOK API
- **Data Processing**: Salary parsing, location normalization, skills extraction
- **Search**: Full-text search with PostgreSQL
- **Analytics**: Trends, top skills, companies, and locations
- **Caching**: In-memory LRU cache with TTL
- **Rate Limiting**: Per-IP rate limiting
- **Logging**: Structured logging with Pino
- **Scheduling**: Automated tasks with node-cron

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: LRU Cache
- **Logging**: Pino
- **Scheduling**: node-cron
- **Validation**: Zod

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment setup**:

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:

   ```bash
   # Generate migrations
   npm run drizzle:generate

   # Run migrations
   npm run drizzle:migrate

   # Seed skills
   npm run seed:skills
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Production Setup

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

## API Endpoints

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

## Environment Variables

| Variable           | Description                  | Default                    |
| ------------------ | ---------------------------- | -------------------------- |
| `NODE_ENV`         | Environment                  | `development`              |
| `PORT`             | Server port                  | `4000`                     |
| `DATABASE_URL`     | PostgreSQL connection string | Required                   |
| `REMOTEOK_API_URL` | RemoteOK API URL             | `https://remoteok.com/api` |
| `FRONTEND_ORIGIN`  | Frontend CORS origin         | `http://localhost:5173`    |
| `CRON_SCHEDULE`    | Ingestion schedule           | `0 * * * *` (hourly)       |
| `LOG_LEVEL`        | Log level                    | `info`                     |

## Database Schema

The application uses the following main tables:

- `jobs` - Job listings with search vectors
- `companies` - Company information
- `locations` - Location data
- `skills` - Skills catalog
- `job_skills` - Job-skill relationships
- `ingestions` - Sync history

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run drizzle:generate` - Generate migrations
- `npm run drizzle:migrate` - Run migrations
- `npm run seed:skills` - Seed skills data
- `npm run sync:once` - Run one-time sync

## Architecture

The application follows a clean architecture pattern:

```
src/
├── config/          # Configuration
├── domain/          # Business logic
│   ├── entities/    # Data models
│   ├── repositories/# Data access
│   └── services/    # Business services
├── infrastructure/  # External concerns
│   ├── db/         # Database
│   ├── http/       # HTTP layer
│   ├── logging/    # Logging
│   └── scheduler/  # Cron jobs
└── presentation/   # Controllers
```

## Docker

Build and run with Docker:

```bash
docker build -t jobpulse-backend .
docker run -p 4000:4000 jobpulse-backend
```

## Monitoring

- Health check: `GET /health`
- Logs: Written to `logs/app.log`
- Metrics: Available via cache stats
