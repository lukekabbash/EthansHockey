import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import type { AgentData, RanksData } from '@/api/dataService';

const Classifications: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [agentsData, setAgentsData] = useState<AgentData[]>([]);
  const [ranksData, setRanksData] = useState<RanksData[]>([]);
  const [selectedClassification, setSelectedClassification] = useState<string>('dollar-index');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { agentsData, ranksData } = await fetchData();
        setAgentsData(agentsData);
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

  // Define classification thresholds
  const dollarIndexThresholds = [
    { name: 'Elite', min: 1.5, color: 'bg-green-100 text-green-800' },
    { name: 'Great', min: 1.2, max: 1.5, color: 'bg-blue-100 text-blue-800' },
    { name: 'Good', min: 1.0, max: 1.2, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Average', min: 0.8, max: 1.0, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Below Average', max: 0.8, color: 'bg-red-100 text-red-800' }
  ];

  const winPercentageThresholds = [
    { name: 'Elite', min: 0.6, color: 'bg-green-100 text-green-800' },
    { name: 'Great', min: 0.55, max: 0.6, color: 'bg-blue-100 text-blue-800' },
    { name: 'Good', min: 0.5, max: 0.55, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Average', min: 0.45, max: 0.5, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Below Average', max: 0.45, color: 'bg-red-100 text-red-800' }
  ];

  const contractsTrackedThresholds = [
    { name: 'Elite', min: 30, color: 'bg-green-100 text-green-800' },
    { name: 'Great', min: 20, max: 30, color: 'bg-blue-100 text-blue-800' },
    { name: 'Good', min: 10, max: 20, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Average', min: 5, max: 10, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Below Average', max: 5, color: 'bg-red-100 text-red-800' }
  ];

  const totalContractValueThresholds = [
    { name: 'Elite', min: 100000000, color: 'bg-green-100 text-green-800' },
    { name: 'Great', min: 50000000, max: 100000000, color: 'bg-blue-100 text-blue-800' },
    { name: 'Good', min: 25000000, max: 50000000, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Average', min: 10000000, max: 25000000, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Below Average', max: 10000000, color: 'bg-red-100 text-red-800' }
  ];

  // Get the appropriate thresholds based on the selected classification
  const getThresholds = () => {
    switch (selectedClassification) {
      case 'dollar-index':
        return dollarIndexThresholds;
      case 'win-percentage':
        return winPercentageThresholds;
      case 'contracts-tracked':
        return contractsTrackedThresholds;
      case 'total-contract-value':
        return totalContractValueThresholds;
      default:
        return dollarIndexThresholds;
    }
  };

  // Get the appropriate value from an agent based on the selected classification
  const getAgentValue = (agent: AgentData | RanksData) => {
    switch (selectedClassification) {
      case 'dollar-index':
        return (agent as RanksData)['Dollar Index'];
      case 'win-percentage':
        return (agent as AgentData)['Won%'];
      case 'contracts-tracked':
        return (agent as AgentData)['CT'];
      case 'total-contract-value':
        return (agent as AgentData)['Total Contract Value'];
      default:
        return 0;
    }
  };

  // Format the value based on the selected classification
  const formatValue = (value: number) => {
    switch (selectedClassification) {
      case 'dollar-index':
        return formatCurrency(value);
      case 'win-percentage':
        return formatPercentage(value);
      case 'contracts-tracked':
        return value.toString();
      case 'total-contract-value':
        return formatCurrency(value);
      default:
        return value.toString();
    }
  };

  // Get the classification for an agent based on the selected metric
  const getClassification = (value: number) => {
    const thresholds = getThresholds();
    for (const threshold of thresholds) {
      if (threshold.min && threshold.max) {
        if (value >= threshold.min && value < threshold.max) {
          return threshold;
        }
      } else if (threshold.min) {
        if (value >= threshold.min) {
          return threshold;
        }
      } else if (threshold.max) {
        if (value < threshold.max) {
          return threshold;
        }
      }
    }
    return thresholds[thresholds.length - 1]; // Default to the last classification
  };

  // Filter and prepare data for display
  const prepareData = () => {
    // Combine agent and rank data
    const combinedData = ranksData.map(rank => {
      const agent = agentsData.find(a => a['Agent Name'] === rank['Agent Name']);
      return agent ? { ...agent, ...rank } : rank;
    });

    // Filter out invalid entries
    const validData = combinedData.filter(agent => {
      const name = agent['Agent Name'];
      return name && name !== '' && name !== '(blank)' && name !== 'Grand Total';
    });

    // Group by classification
    const groupedData: Record<string, (AgentData & RanksData)[]> = {};
    const thresholds = getThresholds();
    
    thresholds.forEach(threshold => {
      groupedData[threshold.name] = [];
    });

    validData.forEach(agent => {
      const value = getAgentValue(agent);
      const classification = getClassification(value);
      if (classification && groupedData[classification.name]) {
        groupedData[classification.name].push(agent as AgentData & RanksData);
      }
    });

    return { groupedData, thresholds };
  };

  const { groupedData, thresholds } = prepareData();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Agent Classifications</h1>
      
      <div className="mb-6">
        <label htmlFor="classification-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Classification Metric:
        </label>
        <select
          id="classification-select"
          value={selectedClassification}
          onChange={(e) => setSelectedClassification(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="dollar-index">Dollar Index</option>
          <option value="win-percentage">Win Percentage</option>
          <option value="contracts-tracked">Contracts Tracked</option>
          <option value="total-contract-value">Total Contract Value</option>
        </select>
      </div>
      
      <div className="space-y-8">
        {thresholds.map(threshold => (
          <div key={threshold.name} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className={`px-6 py-4 ${threshold.color}`}>
              <h2 className="text-lg font-semibold">{threshold.name} Agents</h2>
              <p className="text-sm">
                {threshold.min && threshold.max && `${formatValue(threshold.min)} - ${formatValue(threshold.max)}`}
                {threshold.min && !threshold.max && `≥ ${formatValue(threshold.min)}`}
                {!threshold.min && threshold.max && `< ${formatValue(threshold.max)}`}
              </p>
            </div>
            
            {groupedData[threshold.name].length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedData[threshold.name]
                    .sort((a, b) => getAgentValue(b) - getAgentValue(a))
                    .map(agent => (
                      <tr key={agent['Agent Name']}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent['Agent Name']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent['Agency Name']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(getAgentValue(agent))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-4 text-sm text-gray-500">
                No agents in this classification.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classifications;