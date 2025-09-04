import { useState } from "react";

interface FiltersProps {
  filters: {
    search: string;
    role: string;
    skill: string;
    location: string;
    remote: boolean | undefined;
    dateRange: string;
    salaryMin: string;
    salaryMax: string;
  };
  onFilterChange: (filters: any) => void;
}

const Filters = ({ filters, onFilterChange }: FiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      role: "",
      skill: "",
      location: "",
      remote: undefined,
      dateRange: "",
      salaryMin: "",
      salaryMax: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== undefined
  );

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary text-sm"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary text-sm"
          >
            {isExpanded ? "Hide" : "Show"} Advanced
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Search jobs..."
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <input
            type="text"
            value={filters.role}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder="Job title..."
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill
          </label>
          <input
            type="text"
            value={filters.skill}
            onChange={(e) => handleChange("skill", e.target.value)}
            placeholder="Required skill..."
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="City, country..."
            className="input"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remote
            </label>
            <select
              value={
                filters.remote === undefined ? "" : filters.remote.toString()
              }
              onChange={(e) =>
                handleChange(
                  "remote",
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              className="input"
            >
              <option value="">Any</option>
              <option value="true">Remote only</option>
              <option value="false">On-site only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleChange("dateRange", e.target.value)}
              className="input"
            >
              <option value="">Any time</option>
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Salary
            </label>
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => handleChange("salaryMin", e.target.value)}
              placeholder="Minimum salary..."
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Salary
            </label>
            <input
              type="number"
              value={filters.salaryMax}
              onChange={(e) => handleChange("salaryMax", e.target.value)}
              placeholder="Maximum salary..."
              className="input"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
