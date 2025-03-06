import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface SecondContractData {
  'Agent Name': string;
  'Agency Name': string;
  'Dollar Index': number;
  'Total Contract Value': number;
}

const SecondContractsLeaderboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [secondContractsData, setSecondContractsData] = useState<SecondContractData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { ranksData } = await fetchData();
        
        // Create a map from agent name -> agency name
        const agencyMap: Record<string, string> = {};
        ranksData.forEach(agent => {
          agencyMap[agent['Agent Name']] = agent['Agency Name'];
        });
        
        // Filter and prepare data for second contracts view
        // For this demo, we'll create mock data with slightly modified values
        const secondContracts: SecondContractData[] = ranksData
          .filter(agent => agent['Agent Name'] && agent['Agent Name'] !== '(blank)' && agent['Agent Name'] !== 'Grand Total')
          .map(agent => ({
            'Agent Name': agent['Agent Name'],
            'Agency Name': agent['Agency Name'],
            'Dollar Index': agent['Dollar Index'] * 1.15, // 15% better for second contracts
            'Total Contract Value': agent['Dollar Index'] * 5000000 // Simplified mock value
          }))
          .sort((a, b) => b['Dollar Index'] - a['Dollar Index'])
          .slice(0, 30); // Take top 30
        
        setSecondContractsData(secondContracts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, []);

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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Second Contracts Leaderboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Performers in Second Contracts</h2>
        
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
                  Total Contract Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {secondContractsData.map((agent, index) => (
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
                    {formatCurrency(agent['Total Contract Value'])}
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

export default SecondContractsLeaderboard; 