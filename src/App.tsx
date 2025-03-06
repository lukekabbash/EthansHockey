import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AgentDashboard from './pages/AgentDashboard';
import AgencyDashboard from './pages/AgencyDashboard';
import Leaderboard from './pages/Leaderboard';
import SecondContractsLeaderboard from './pages/SecondContractsLeaderboard';
import Classifications from './pages/Classifications';
import ProjectDefinitions from './pages/ProjectDefinitions';
import AgentComparison from './pages/AgentComparison';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="agent-dashboard" element={<AgentDashboard />} />
        <Route path="agency-dashboard" element={<AgencyDashboard />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="second-contracts-leaderboard" element={<SecondContractsLeaderboard />} />
        <Route path="classifications" element={<Classifications />} />
        <Route path="project-definitions" element={<ProjectDefinitions />} />
        <Route path="agent-comparison" element={<AgentComparison />} />
      </Route>
    </Routes>
  );
};

export default App; 