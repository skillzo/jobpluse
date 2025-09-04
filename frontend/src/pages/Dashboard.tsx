import { useState, useEffect } from "react";
import { apiClient, TopSkill, TopCompany, TopLocation } from "../lib/api";
import KpiTiles from "../components/KpiTiles";
import SkillBarChart from "../components/SkillBarChart";
import TopCompaniesList from "../components/TopCompaniesList";
import TopLocationsList from "../components/TopLocationsList";

const Dashboard = () => {
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [topLocations, setTopLocations] = useState<TopLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [skillsRes, companiesRes, locationsRes] = await Promise.all([
          apiClient.getTopSkills("7d"),
          apiClient.getTopCompanies("7d"),
          apiClient.getTopLocations("7d"),
        ]);

        setTopSkills(skillsRes.data);
        setTopCompanies(companiesRes.data);
        setTopLocations(locationsRes.data);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Job market insights and trends</p>
      </div>

      <KpiTiles />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Skills (7 days)</h2>
          <SkillBarChart data={topSkills} />
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              Top Companies (7 days)
            </h2>
            <TopCompaniesList companies={topCompanies} />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              Top Locations (7 days)
            </h2>
            <TopLocationsList locations={topLocations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
