import { TopLocation } from "../lib/api";

interface TopLocationsListProps {
  locations: TopLocation[];
}

const TopLocationsList = ({ locations }: TopLocationsListProps) => {
  return (
    <div className="space-y-3">
      {locations.slice(0, 10).map((location, index) => (
        <div
          key={location.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {location.city || location.country || location.raw}
              </p>
              {location.city && location.country && (
                <p className="text-sm text-gray-500">{location.country}</p>
              )}
              <p className="text-sm text-gray-500">{location.job_count} jobs</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {location.job_count}
            </div>
          </div>
        </div>
      ))}

      {locations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No location data available
        </div>
      )}
    </div>
  );
};

export default TopLocationsList;
