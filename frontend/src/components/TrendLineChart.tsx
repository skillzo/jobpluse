import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SkillTrend } from "../lib/api";
import { toPng } from "html-to-image";
import { useRef } from "react";
import { format, parseISO } from "date-fns";

interface TrendLineChartProps {
  data: SkillTrend[];
  skillName: string;
}

const TrendLineChart = ({ data, skillName }: TrendLineChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement("a");
        link.download = `${skillName
          .toLowerCase()
          .replace(/\s+/g, "-")}-trend.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to export chart:", error);
      }
    }
  };

  const chartData = data.map((item) => ({
    date: format(parseISO(item.day), "MMM dd"),
    jobs: item.job_count,
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

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {skillName} Job Demand Trend
        </h3>
        <p className="text-sm text-gray-600">
          {data.length} data points showing job count over time
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No trend data available for {skillName}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value} jobs`, "Job Count"]}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="jobs"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendLineChart;
