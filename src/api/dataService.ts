import axios from 'axios';
import Papa from 'papaparse';

// Local file paths
const AGENTS_CSV_PATH = '/Agents Tab.csv';
const AGENCIES_CSV_PATH = '/Agencies Tab.csv';
const PIBA_CSV_PATH = '/PIBA.csv';
const HEADSHOTS_PATH = '/headshots_cache/';

// Note: In a real application, we would need a backend service to parse Excel files
// For this demo, we'll simulate the data loading with mock data

export interface AgentData {
  'Agent Name': string;
  'Agency Name': string;
  'Dollar Index': number;
  'Won%': number;
  'CT': number;
  'Total Contract Value': number;
  'Total Player Value': number;
  'Dollars Captured Above/ Below Value': number;
  'Market Value Capture %': string;
  'Discount Rate': string;
  [key: string]: any;
}

export interface RanksData {
  'Agent Name': string;
  'Agency Name': string;
  'Dollar Index': number;
  'Index R': number;
  'WinR': number;
  'CTR': number;
  'TCV R': number;
  'TPV R': number;
  [key: string]: any;
}

export interface PIBAData {
  'Agent Name': string;
  'Agency Name': string;
  'Player Name': string;
  'Total Cost': number;
  'PC': number;
  'COST 18-19': number;
  'PC 18-19': number;
  'COST 19-20': number;
  'PC 19-20': number;
  'COST 20-21': number;
  'PC 20-21': number;
  'COST 21-22': number;
  'PC 21-22': number;
  'COST 22-23': number;
  'PC 22-23': number;
  'COST 23-24': number;
  'PC 23-24': number;
  'Dollars Captured Above/ Below Value': number;
  'Value Capture %': string;
  [key: string]: any;
}

export interface AgencyData {
  'Agency Name': string;
  'Dollar Index': number;
  'Won%': number;
  'CT': number;
  'Total Contract Value': number;
  'Index R': number;
  'WinR': number;
  'CTR': number;
  'TCV R': number;
  'TPV R': number;
  'Total Player Value': number;
  'Dollars Captured Above/ Below Value': number;
  'Market Value Capture %': string;
  'Discount Rate': string;
  [key: string]: any;
}

// Helper function to clean and parse numeric values
const parseNumericValue = (value: string): number => {
  if (!value || value === '(blank)' || value === 'Grand Total') return 0;
  
  // Handle special case for dollar values
  if (typeof value === 'string') {
    // Remove $ signs, commas, spaces, and handle parentheses for negative values
    let cleanedValue = value.replace(/[$,\s]/g, '');
    
    // Handle parentheses notation for negative numbers: (123) -> -123
    if (cleanedValue.startsWith('(') && cleanedValue.endsWith(')')) {
      cleanedValue = '-' + cleanedValue.substring(1, cleanedValue.length - 1);
    }
    
    // Parse as float
    const parsedValue = parseFloat(cleanedValue);
    
    // Return 0 if NaN
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  // If it's already a number, just return it
  if (typeof value === 'number') {
    return value;
  }
  
  return 0;
};

// Helper function to parse percentage values
const parsePercentage = (value: string): number => {
  if (!value) return 0;
  
  // Remove % sign and trim whitespace
  const cleanedValue = value.replace(/%/g, '').trim();
  
  // Parse as float and divide by 100
  const parsedValue = parseFloat(cleanedValue) / 100;
  
  // Return 0 if NaN
  return isNaN(parsedValue) ? 0 : parsedValue;
};

// Function to get player headshot URL
export const getPlayerHeadshotUrl = (playerName: string): string => {
  if (!playerName) return '';
  
  // Convert player name to lowercase and replace spaces with underscores
  const formattedName = playerName.toLowerCase().replace(/\s+/g, '_');
  
  // Return the URL to the headshot
  return `${HEADSHOTS_PATH}${formattedName}.jpg`;
};

// Function to fetch and parse CSV data
const fetchCSV = async (url: string): Promise<any[]> => {
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Debug: Log the headers and first row
          if (results.data.length > 0) {
            console.log('CSV Headers:', Object.keys(results.data[0]));
            console.log('First row sample:', results.data[0]);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching CSV from ${url}:`, error);
    throw error;
  }
};

// Process agents data
const processAgentsData = (data: any[]): AgentData[] => {
  return data
    .filter(row => row['Agent Name'] && row['Agent Name'] !== '(blank)' && row['Agent Name'] !== 'Grand Total')
    .map(row => {
      // Log the raw data to debug
      console.log('Raw agent data:', row);
      
      return {
        'Agent Name': row['Agent Name'],
        'Agency Name': row['Agency Name'],
        'Dollar Index': parseNumericValue(row[' Dollar Index '] || row['Dollar Index']),
        'Won%': parsePercentage(row['Won%']),
        'CT': parseNumericValue(row['CT']),
        'Total Contract Value': parseNumericValue(row[' Total Contract Value '] || row['Total Contract Value']),
        'Total Player Value': parseNumericValue(row[' Total Player Value '] || row['Total Player Value']),
        'Dollars Captured Above/ Below Value': parseNumericValue(row[' Dollars Captured Above/ Below Value '] || row['Dollars Captured Above/ Below Value']),
        'Market Value Capture %': row['Market Value Capture %'],
        'Discount Rate': row['Discount Rate'],
      };
    });
};

// Process agencies data - combine by agency name
const processAgenciesData = (data: any[]): AgencyData[] => {
  // First, filter out invalid rows
  const validRows = data.filter(row => 
    row['Agency Name'] && 
    row['Agency Name'] !== '(blank)' && 
    row['Agency Name'] !== 'Grand Total'
  );
  
  // Get unique agency names
  const uniqueAgencyNames = [...new Set(validRows.map(row => row['Agency Name']))];
  
  // Create a map to store aggregated data for each agency
  const agencyMap: Record<string, AgencyData> = {};
  
  // Initialize the map with empty data for each agency
  uniqueAgencyNames.forEach(agencyName => {
    agencyMap[agencyName] = {
      'Agency Name': agencyName,
      'Dollar Index': 0,
      'Won%': 0,
      'CT': 0,
      'Total Contract Value': 0,
      'Index R': 0,
      'WinR': 0,
      'CTR': 0,
      'TCV R': 0,
      'TPV R': 0,
      'Total Player Value': 0,
      'Dollars Captured Above/ Below Value': 0,
      'Market Value Capture %': '0%',
      'Discount Rate': '0%',
    };
  });
  
  // Aggregate data for each agency
  validRows.forEach(row => {
    const agencyName = row['Agency Name'];
    const agency = agencyMap[agencyName];
    
    // For the first valid row for each agency, set the values
    if (agency['Dollar Index'] === 0) {
      agency['Dollar Index'] = parseNumericValue(row[' Dollar Index '] || row['Dollar Index']);
      agency['Won%'] = parsePercentage(row['Won%']);
      agency['CT'] = parseNumericValue(row['CT']);
      agency['Total Contract Value'] = parseNumericValue(row[' Total Contract Value '] || row['Total Contract Value']);
      agency['Index R'] = parseNumericValue(row['Index R']);
      agency['WinR'] = parseNumericValue(row['WinR']);
      agency['CTR'] = parseNumericValue(row['CTR']);
      agency['TCV R'] = parseNumericValue(row['TCV R']);
      agency['TPV R'] = parseNumericValue(row['TPV R']);
      agency['Total Player Value'] = parseNumericValue(row[' Total Player Value '] || row['Total Player Value']);
      agency['Dollars Captured Above/ Below Value'] = parseNumericValue(row[' Dollars Captured Above/ Below Value '] || row['Dollars Captured Above/ Below Value']);
      agency['Market Value Capture %'] = row['Market Value Capture %'];
      agency['Discount Rate'] = row['Discount Rate'];
    }
  });
  
  // Convert the map to an array
  return Object.values(agencyMap);
};

// Process PIBA data
const processPIBAData = (data: any[]): PIBAData[] => {
  return data
    .filter(row => row['Combined Names'] && row['Combined Names'] !== '(blank)' && row['Combined Names'] !== 'Grand Total')
    .map(row => {
      // Log the raw data to debug
      console.log('Raw PIBA data:', row);
      
      return {
        'Agent Name': row['Agent Name'],
        'Agency Name': row['Agency Name'],
        'Player Name': row['Combined Names'],
        'Total Cost': parseNumericValue(row[' Total Cost ']),
        'PC': parseNumericValue(row[' Total PC ']),
        'COST 18-19': parseNumericValue(row[' COST 18-19 ']),
        'PC 18-19': parseNumericValue(row[' PC 18-19 ']),
        'COST 19-20': parseNumericValue(row[' COST 19-20 ']),
        'PC 19-20': parseNumericValue(row[' PC 19-20 ']),
        'COST 20-21': parseNumericValue(row[' COST 20-21 ']),
        'PC 20-21': parseNumericValue(row[' PC 20-21 ']),
        'COST 21-22': parseNumericValue(row[' COST 21-22 ']),
        'PC 21-22': parseNumericValue(row[' PC 21-22 ']),
        'COST 22-23': parseNumericValue(row[' COST 22-23 ']),
        'PC 22-23': parseNumericValue(row[' PC 22-23 ']),
        'COST 23-24': parseNumericValue(row[' COST 23-24 ']),
        'PC 23-24': parseNumericValue(row[' PC 23-24 ']),
        'Dollars Captured Above/ Below Value': parseNumericValue(row[' Dollars Captured Above/ Below Value ']),
        'Value Capture %': row['Value Capture %'],
      };
    });
};

// Main data fetching function
export const fetchData = async () => {
  try {
    console.log('Fetching data from local CSV files');
    
    // Fetch all CSV files
    const [agentsRawData, pibaRawData] = await Promise.all([
      fetchCSV(AGENTS_CSV_PATH),
      fetchCSV(PIBA_CSV_PATH),
    ]);
    
    // Process the data
    const agentsData = processAgentsData(agentsRawData);
    
    // For ranks data, we'll use the same agents data but sort it differently
    // In a real app, this might come from a different source
    const ranksData = [...agentsData].map(agent => ({
      'Agent Name': agent['Agent Name'],
      'Agency Name': agent['Agency Name'],
      'Dollar Index': agent['Dollar Index'],
      // Generate ranks based on sorting
      'Index R': 0, // Will be calculated below
      'WinR': 0,
      'CTR': 0,
      'TCV R': 0,
      'TPV R': 0,
    }));
    
    // Calculate ranks
    const sortByDollarIndex = [...ranksData].sort((a, b) => b['Dollar Index'] - a['Dollar Index']);
    sortByDollarIndex.forEach((agent, index) => {
      const original = ranksData.find(a => a['Agent Name'] === agent['Agent Name']);
      if (original) original['Index R'] = index + 1;
    });
    
    const sortByWinPercentage = [...agentsData].sort((a, b) => b['Won%'] - a['Won%']);
    sortByWinPercentage.forEach((agent, index) => {
      const original = ranksData.find(a => a['Agent Name'] === agent['Agent Name']);
      if (original) original['WinR'] = index + 1;
    });
    
    const sortByCT = [...agentsData].sort((a, b) => b['CT'] - a['CT']);
    sortByCT.forEach((agent, index) => {
      const original = ranksData.find(a => a['Agent Name'] === agent['Agent Name']);
      if (original) original['CTR'] = index + 1;
    });
    
    const sortByTCV = [...agentsData].sort((a, b) => b['Total Contract Value'] - a['Total Contract Value']);
    sortByTCV.forEach((agent, index) => {
      const original = ranksData.find(a => a['Agent Name'] === agent['Agent Name']);
      if (original) original['TCV R'] = index + 1;
    });
    
    const sortByTPV = [...agentsData].sort((a, b) => b['Total Player Value'] - a['Total Player Value']);
    sortByTPV.forEach((agent, index) => {
      const original = ranksData.find(a => a['Agent Name'] === agent['Agent Name']);
      if (original) original['TPV R'] = index + 1;
    });
    
    const pibaData = processPIBAData(pibaRawData);
    
    return {
      agentsData,
      ranksData,
      pibaData
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Fetch agencies data
export const fetchAgenciesData = async () => {
  try {
    console.log('Fetching agencies data from local CSV file');
    
    const agenciesRawData = await fetchCSV(AGENCIES_CSV_PATH);
    return processAgenciesData(agenciesRawData);
  } catch (error) {
    console.error('Error fetching agencies data:', error);
    throw error;
  }
}; 