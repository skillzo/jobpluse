# JobPulse Frontend

A React-based frontend for the JobPulse job aggregation platform.

## Features

- **Dashboard**: KPIs, top skills, companies, and locations
- **Trends**: Skill demand trends over time with interactive charts
- **Explore**: Job search with advanced filtering and pagination
- **Job Details**: Detailed job information with apply links
- **Responsive Design**: Mobile-friendly interface
- **Chart Export**: Export charts as PNG images

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router
- **HTTP Client**: Axios
- **Image Export**: html-to-image

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment setup**:

   ```bash
   cp env.example .env
   # Edit .env with your API base URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

### Production Build

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Preview the build**:
   ```bash
   npm run preview
   ```

## Environment Variables

| Variable        | Description          | Default                 |
| --------------- | -------------------- | ----------------------- |
| `VITE_API_BASE` | Backend API base URL | `http://localhost:4000` |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable components
├── lib/           # API client and utilities
├── pages/         # Page components
└── styles/        # Global styles
```

## Pages

### Dashboard

- KPI tiles showing job statistics
- Top skills bar chart
- Top companies and locations lists

### Trends

- Skill selection dropdown
- Time range selection
- Interactive line chart with export functionality

### Explore

- Advanced job search filters
- Job listings with pagination
- Quick apply links

### Job Detail

- Complete job information
- Skills and requirements
- Company details
- Direct apply link

## Components

### Charts

- `SkillBarChart` - Bar chart for top skills
- `TrendLineChart` - Line chart for skill trends

### Lists

- `TopCompaniesList` - Company rankings
- `TopLocationsList` - Location rankings

### UI

- `KpiTiles` - Dashboard metrics
- `Filters` - Search and filter controls
- `JobsTable` - Job listings with pagination
- `Navigation` - Main navigation bar

## API Integration

The frontend communicates with the backend through the `apiClient` in `src/lib/api.ts`. All API calls include:

- Request/response interceptors
- Error handling
- TypeScript types
- Request ID tracking

## Docker

Build and run with Docker:

```bash
docker build -t jobpulse-frontend .
docker run -p 80:80 jobpulse-frontend
```

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation link in `src/components/Navigation.tsx`

### Adding New Components

1. Create the component in `src/components/`
2. Export it as default
3. Import and use in pages

### Styling

- Use Tailwind CSS classes
- Custom components defined in `src/styles/index.css`
- Responsive design with mobile-first approach

## Performance

- Code splitting with React Router
- Lazy loading for charts
- Optimized bundle size with Vite
- Static asset caching
- Image optimization
