import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            JobPulse
          </Link>

          <div className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/trends"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/trends")
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Trends
            </Link>
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/explore")
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
