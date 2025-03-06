import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency } from '@/utils/formatters';
import type { RanksData } from '@/api/dataService';

interface SecondContractData {
  'Agent Name': string;
  'Agency Name': string;
  'Dollar Index': number;
  'Total Contract Value': number;
}

const SecondContractsLeaderboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ranksData, setRanksData] = useState<RanksData[]>([]);
  const [secondContractsData, setSecondContractsData] = useState<SecondContractData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { ranksData } = await fetchData();
        setRanksData(ranksData);
        
        // Create a map from agent name -> agency name
        const agencyMap = ranksData.reduce((map, agent) => {
          if (agent['Agent Name'] && agent['Agency Name']) {
            map[agent['Agent Name']] = agent['Agency Name'];
          }
          return map;
        }, {} as Record<string, string>);
        
        // Manually defined data from the original dashboard
        // In a real implementation, this would come from the API
        const secondContracts = [
          { "Agent Name": "Peter Wallen", "Dollar Index": 0.68, "Total Contract Value": 35600000 },
          { "Agent Name": "Mika Rautakallio", "Dollar Index": 0.72, "Total Contract Value": 42270000 },
          { "Agent Name": "Brian & Scott Bartlett", "Dollar Index": 0.81, "Total Contract Value": 86500000 },
          { "Agent Name": "Jordan Neumann & George Bazos", "Dollar Index": 0.82, "Total Contract Value": 82500000 },
          { "Agent Name": "Judd Moldaver", "Dollar Index": 0.83, "Total Contract Value": 133170000 },
          { "Agent Name": "Pat Brisson", "Dollar Index": 0.87, "Total Contract Value": 116885714 },
          { "Agent Name": "Richard Evans", "Dollar Index": 0.95, "Total Contract Value": 85000000 },
          { "Agent Name": "Paul Capizzano", "Dollar Index": 0.97, "Total Contract Value": 17825000 },
          { "Agent Name": "Kurt Overhardt", "Dollar Index": 1.00, "Total Contract Value": 97650000 },
          { "Agent Name": "Claude Lemieux", "Dollar Index": 1.02, "Total Contract Value": 48000000 },
          { "Agent Name": "Andre Rufener", "Dollar Index": 1.06, "Total Contract Value": 36000000 },
          { "Agent Name": "Craig Oster", "Dollar Index": 1.06, "Total Contract Value": 72500000 },
          { "Agent Name": "Gerry Johannson", "Dollar Index": 1.07, "Total Contract Value": 57500000 },
          { "Agent Name": "Allain Roy", "Dollar Index": 1.08, "Total Contract Value": 21000000 },
          { "Agent Name": "Darryl Wolski", "Dollar Index": 1.09, "Total Contract Value": 10000000 },
          { "Agent Name": "J.P. Barry", "Dollar Index": 1.10, "Total Contract Value": 74000000 },
          { "Agent Name": "Jeff Jackson", "Dollar Index": 1.11, "Total Contract Value": 33000000 },
          { "Agent Name": "Matt Keator", "Dollar Index": 1.12, "Total Contract Value": 28000000 },
          { "Agent Name": "Darren Ferris", "Dollar Index": 1.13, "Total Contract Value": 33000000 },
          { "Agent Name": "Kevin Epp", "Dollar Index": 1.14, "Total Contract Value": 25000000 }
        ];
        
        // Add agency names to the second contracts data
        const secondContractsWithAgency = secondContracts.map(contract => ({
          ...contract,
          'Agency Name': agencyMap[contract['Agent Name']] || 'Unknown Agency'
        }));
        
        setSecondContractsData(secondContractsWithAgency);
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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Second Contracts Leaderboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Overall Standings - Second Contracts (by Dollar Index)</h2>
        
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent['Agent Name']}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent['Agency Name']}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent['Dollar Index'].toFixed(2)}
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