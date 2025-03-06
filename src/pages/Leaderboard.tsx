import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency } from '@/utils/formatters';
import type { RanksData } from '@/api/dataService';
import { useNavigate } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ranksData, setRanksData] = useState<RanksData[]>([]);
  const [filterMinContracts, setFilterMinContracts] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { ranksData } = await fetchData();
        
        // Debug: Log the CT values
        console.log('Contracts Tracked values:', ranksData.map(agent => ({
          name: agent['Agent Name'],
          ct: agent['CT'],
          rawCT: agent['CT']
        })));
        
        setRanksData(ranksData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  // Define manual exclusion list
  const excludedAgents = new Set([
    "Patrik Aronsson", 
    "Chris McAlpine", 
    "David Kaye", 
    "Thomas Lynn", 
    "Patrick Sullivan"
  ]);

  // Filter and sort the data
  const filteredData = ranksData
    .filter(agent => {
      const name = agent['Agent Name'];
      // Exclude specific agents and empty/special values
      if (!name || name === '' || name === '(blank)' || name === 'Grand Total' || excludedAgents.has(name)) {
        return false;
      }
      // Apply minimum contracts filter if enabled
      if (filterMinContracts && agent['CT'] < 10) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b['Dollar Index'] - a['Dollar Index'])
    .slice(0, 90); // Take top 90

  // Handle navigation to agent dashboard
  const handleAgentClick = (agentName: string) => {
    // Navigate to agent dashboard with the agent name as a query parameter
    navigate(`/agent-dashboard?agent=${encodeURIComponent(agentName)}`);
  };

  // Handle navigation to agency dashboard
  const handleAgencyClick = (agencyName: string) => {
    // Navigate to agency dashboard with the agency name as a query parameter
    navigate(`/agency-dashboard?agency=${encodeURIComponent(agencyName)}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Agent Leaderboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Overall Standings (by Dollar Index)</h2>
        
        <div className="mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={filterMinContracts}
              onChange={() => setFilterMinContracts(!filterMinContracts)}
            />
            <span className="ml-2 text-gray-700">Only show agents with at least 10 Contracts Tracked</span>
          </label>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dollar Index
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contracts Tracked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((agent, index) => (
                <tr key={agent['Agent Name']} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium cursor-pointer transition-all duration-200 relative"
                    onClick={() => handleAgentClick(agent['Agent Name'])}
                  >
                    <span className="relative z-10 hover:text-yellow-500 hover:font-bold transition-all duration-200">{agent['Agent Name']}</span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer transition-all duration-200 relative"
                    onClick={() => handleAgencyClick(agent['Agency Name'])}
                  >
                    <span className="relative z-10 hover:text-yellow-500 hover:font-bold transition-all duration-200">{agent['Agency Name']}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(agent['Dollar Index'])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent['CT']}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 