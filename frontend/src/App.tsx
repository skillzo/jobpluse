import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Trends from "./pages/Trends";
import Explore from "./pages/Explore";
import JobDetail from "./pages/JobDetail";
import Navigation from "./components/Navigation";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
