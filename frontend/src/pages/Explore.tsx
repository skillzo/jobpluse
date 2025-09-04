import { useState, useEffect } from "react";
import { apiClient, Job, JobSearchResult } from "../lib/api";
import JobsTable from "../components/JobsTable";
import Filters from "../components/Filters";

const Explore = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    skill: "",
    location: "",
    remote: undefined as boolean | undefined,
    dateRange: "",
    salaryMin: "",
    salaryMax: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit: pagination.limit,
        remote: filters.remote,
        salaryMin: filters.salaryMin
          ? parseFloat(filters.salaryMin)
          : undefined,
        salaryMax: filters.salaryMax
          ? parseFloat(filters.salaryMax)
          : undefined,
      };

      const response = await apiClient.getJobs(params);
      const result: JobSearchResult = response.data;

      setJobs(result.jobs);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError("Failed to load jobs");
      console.error("Jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg">{error}</div>
        <button onClick={() => fetchJobs()} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Jobs</h1>
        <p className="text-gray-600">
          Search and filter through available job opportunities
        </p>
      </div>

      <Filters filters={filters} onFilterChange={handleFilterChange} />

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Jobs ({pagination.total} total)
          </h2>
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          )}
        </div>

        <JobsTable
          jobs={jobs}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Explore;
