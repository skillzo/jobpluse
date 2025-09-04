import { TopCompany } from "../lib/api";

interface TopCompaniesListProps {
  companies: TopCompany[];
}

const TopCompaniesList = ({ companies }: TopCompaniesListProps) => {
  return (
    <div className="space-y-3">
      {companies.slice(0, 10).map((company, index) => (
        <div
          key={company.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900">{company.name}</p>
              <p className="text-sm text-gray-500">{company.job_count} jobs</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary-600">
              {company.job_count}
            </div>
          </div>
        </div>
      ))}

      {companies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No company data available
        </div>
      )}
    </div>
  );
};

export default TopCompaniesList;
