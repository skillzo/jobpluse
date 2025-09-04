import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TopSkill } from "../lib/api";
import { toPng } from "html-to-image";
import { useRef } from "react";

interface SkillBarChartProps {
  data: TopSkill[];
}

const SkillBarChart = ({ data }: SkillBarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement("a");
        link.download = "skills-chart.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to export chart:", error);
      }
    }
  };

  const chartData = data.slice(0, 10).map((skill) => ({
    name: skill.name,
    jobs: skill.job_count,
  }));

  return (
    <div ref={chartRef} className="relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleExport}
          className="btn btn-secondary text-sm"
          title="Export as PNG"
        >
          📷
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value} jobs`, "Job Count"]}
            labelFormatter={(label: string) => `Skill: ${label}`}
          />
          <Bar dataKey="jobs" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillBarChart;
