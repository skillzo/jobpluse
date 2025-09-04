import { useState, useEffect } from "react";
import { apiClient, TopSkill, SkillTrend } from "../lib/api";
import TrendLineChart from "../components/TrendLineChart";

const Trends = () => {
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [skillTrend, setSkillTrend] = useState<SkillTrend[]>([]);
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopSkills = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getTopSkills("7d");
        setTopSkills(response.data);
        if (response.data.length > 0) {
          setSelectedSkill(response.data[0].name);
        }
      } catch (err) {
        setError("Failed to load skills data");
        console.error("Skills error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSkills();
  }, []);

  useEffect(() => {
    const fetchSkillTrend = async () => {
      if (!selectedSkill) return;

      try {
        setTrendLoading(true);
        const response = await apiClient.getSkillTrend(
          selectedSkill,
          timeRange
        );
        setSkillTrend(response.data);
      } catch (err) {
        console.error("Trend error:", err);
      } finally {
        setTrendLoading(false);
      }
    };

    fetchSkillTrend();
  }, [selectedSkill, timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Trends</h1>
        <p className="text-gray-600">
          Track job demand for specific skills over time
        </p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input"
            >
              {topSkills.map((skill) => (
                <option key={skill.id} value={skill.name}>
                  {skill.name} ({skill.job_count} jobs)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {trendLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <TrendLineChart data={skillTrend} skillName={selectedSkill} />
        )}
      </div>
    </div>
  );
};

export default Trends;
