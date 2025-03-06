import React from 'react';

const ProjectDefinitions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Project Definitions</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Dollar Index</h3>
            <p className="mt-1 text-gray-600">
              The Dollar Index is a proprietary metric that measures an agent's ability to negotiate contracts 
              relative to a player's expected value. A Dollar Index of 1.0 means the agent negotiates contracts 
              at exactly the expected value. Values above 1.0 indicate the agent negotiates contracts above 
              expected value, while values below 1.0 indicate contracts below expected value.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Win Percentage</h3>
            <p className="mt-1 text-gray-600">
              Win Percentage represents the proportion of contracts where an agent negotiated a value higher 
              than the player's expected value. A Win Percentage of 0.500 means the agent negotiates above 
              expected value 50% of the time.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Contracts Tracked (CT)</h3>
            <p className="mt-1 text-gray-600">
              The total number of contracts negotiated by an agent that are included in our database.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Contract Value (TCV)</h3>
            <p className="mt-1 text-gray-600">
              The sum of all contract values negotiated by an agent, measured in dollars.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Value Capture Percentage (VCP)</h3>
            <p className="mt-1 text-gray-600">
              VCP measures the percentage of a player's total value that an agent captures in contract 
              negotiations. It is calculated as (Total Cost / Player Contribution) * 100. A VCP of 100% 
              means the agent negotiated contracts equal to the player's contribution value.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
        <p className="text-gray-600">
          This dashboard uses data compiled from various public sources, including:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
          <li>Publicly available contract information</li>
          <li>Player performance statistics</li>
          <li>Agent-player relationships</li>
          <li>Agency affiliations</li>
        </ul>
        <p className="mt-4 text-gray-600">
          Player expected values are calculated using a proprietary model that considers 
          performance metrics, age, position, and market conditions.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Classifications</h2>
        <p className="text-gray-600">
          Agents are classified into the following categories based on their performance metrics:
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <span className="w-20 font-medium text-gray-900">Elite:</span>
            <span className="text-gray-600">Top-tier performance, significantly above average</span>
          </div>
          <div className="flex items-center">
            <span className="w-20 font-medium text-gray-900">Great:</span>
            <span className="text-gray-600">Well above average performance</span>
          </div>
          <div className="flex items-center">
            <span className="w-20 font-medium text-gray-900">Good:</span>
            <span className="text-gray-600">Above average performance</span>
          </div>
          <div className="flex items-center">
            <span className="w-20 font-medium text-gray-900">Average:</span>
            <span className="text-gray-600">Performance around the league average</span>
          </div>
          <div className="flex items-center">
            <span className="w-20 font-medium text-gray-900">Below Average:</span>
            <span className="text-gray-600">Performance below the league average</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDefinitions; 