import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient, Job } from "../lib/api";
import { format, parseISO } from "date-fns";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await apiClient.getJobById(id);
        setJob(response.data);
      } catch (err) {
        setError("Failed to load job details");
        console.error("Job detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

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
    return format(parseISO(dateString), "MMMM dd, yyyy");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg">{error || "Job not found"}</div>
        <Link to="/explore" className="btn btn-primary mt-4">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          to="/explore"
          className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
        >
          ← Back to Jobs
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>

        <div className="flex flex-wrap gap-4 text-gray-600">
          {job.company && (
            <div className="flex items-center">
              <span className="font-medium">{job.company.name}</span>
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary-600 hover:text-primary-700"
                >
                  (Website)
                </a>
              )}
            </div>
          )}

          {job.location && (
            <div className="flex items-center">
              📍 {job.location.city || job.location.country || job.location.raw}
            </div>
          )}

          <div className="flex items-center">
            📅 Posted {formatDate(job.posted_at)}
          </div>

          {job.remote && (
            <div className="flex items-center text-green-600">🌐 Remote</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            {job.description_md ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                  {job.description_md}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500">No description available</p>
            )}
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Button */}
          <div className="card">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full text-center"
            >
              Apply for this position
            </a>
          </div>

          {/* Job Details */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Job Details</h3>
            <div className="space-y-3">
              {(job.min_salary || job.max_salary) && (
                <div>
                  <span className="font-medium text-gray-700">Salary:</span>
                  <div className="text-gray-900">
                    {formatSalary(job.min_salary, job.max_salary, job.currency)}
                  </div>
                </div>
              )}

              {job.location && (
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <div className="text-gray-900">
                    {job.location.city && job.location.country
                      ? `${job.location.city}, ${job.location.country}`
                      : job.location.raw}
                  </div>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Work Type:</span>
                <div className="text-gray-900">
                  {job.remote ? "Remote" : "On-site"}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Posted:</span>
                <div className="text-gray-900">{formatDate(job.posted_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
