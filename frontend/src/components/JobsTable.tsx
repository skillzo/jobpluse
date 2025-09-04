import { Link } from "react-router-dom";
import { Job } from "../lib/api";
import { format, parseISO } from "date-fns";

interface JobsTableProps {
  jobs: Job[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

const JobsTable = ({
  jobs,
  loading,
  pagination,
  onPageChange,
}: JobsTableProps) => {
  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return "Not specified";

    const currencySymbol =
      currency === "USD"
        ? "$"
        : currency === "GBP"
        ? "£"
        : currency === "NGN"
        ? "₦"
        : currency || "";

    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    }

    return `${currencySymbol}${(min || max || 0).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No jobs found</div>
        <p className="text-gray-400 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Link
                to={`/jobs/${job.id}`}
                className="text-lg font-semibold text-primary-600 hover:text-primary-700"
              >
                {job.title}
              </Link>

              <div className="mt-2 space-y-1">
                {job.company && (
                  <p className="text-gray-700">
                    <span className="font-medium">{job.company.name}</span>
                  </p>
                )}

                {job.location && (
                  <p className="text-gray-600 text-sm">
                    📍{" "}
                    {job.location.city ||
                      job.location.country ||
                      job.location.raw}
                    {job.remote && (
                      <span className="ml-2 text-green-600">🌐 Remote</span>
                    )}
                  </p>
                )}

                <p className="text-gray-600 text-sm">
                  📅 Posted {formatDate(job.posted_at)}
                </p>

                {(job.min_salary || job.max_salary) && (
                  <p className="text-gray-600 text-sm">
                    💰{" "}
                    {formatSalary(job.min_salary, job.max_salary, job.currency)}
                  </p>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="ml-4">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-sm"
              >
                Apply
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsTable;
