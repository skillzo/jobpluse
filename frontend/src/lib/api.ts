import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.headers["X-Request-ID"] = Math.random().toString(36).substring(7);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Job {
  id: string;
  title: string;
  company?: {
    name: string;
    website?: string;
  };
  location?: {
    city?: string;
    country?: string;
    raw: string;
  };
  url: string;
  description_md?: string;
  posted_at: string;
  remote: boolean;
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  pay_period?: string;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
}

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopSkill {
  id: string;
  name: string;
  job_count: number;
}

export interface SkillTrend {
  day: string;
  job_count: number;
}

export interface TopCompany {
  id: string;
  name: string;
  job_count: number;
}

export interface TopLocation {
  id: string;
  city?: string;
  country?: string;
  raw: string;
  job_count: number;
}

export interface DashboardKPIs {
  newJobs24h: number;
  newJobs7d: number;
  totalActiveJobs: number;
  totalCompanies: number;
}

// API functions
export const apiClient = {
  // Health check
  health: () => api.get("/health"),

  // Jobs
  getJobs: (params?: {
    search?: string;
    role?: string;
    skill?: string;
    location?: string;
    remote?: boolean;
    dateRange?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
  }) => api.get<JobSearchResult>("/jobs", { params }),

  getJobById: (id: string) => api.get<Job>(`/jobs/${id}`),

  // Analytics
  getTopSkills: (since: string = "7d") =>
    api.get<TopSkill[]>("/skills/top", { params: { since } }),

  getSkillTrend: (name: string, since: string = "30d") =>
    api.get<SkillTrend[]>(`/trends/skill/${name}`, { params: { since } }),

  getTopCompanies: (since: string = "7d") =>
    api.get<TopCompany[]>("/companies/top", { params: { since } }),

  getTopLocations: (since: string = "7d") =>
    api.get<TopLocation[]>("/locations/top", { params: { since } }),

  // Admin
  syncJobs: () => api.post("/admin/sync"),
};

export default apiClient;
