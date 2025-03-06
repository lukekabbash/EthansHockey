import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency, formatPercentage, formatDollarIndex } from '@/utils/formatters';
import type { AgentData, RanksData } from '@/api/dataService';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Tabs, 
  Tab, 
  Chip,
  Paper,
  Button,
  Divider,
  Avatar,
  Stack,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  RadialLinearScale, 
  PointElement, 
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement
);

// Define tabs for different visualizations
interface TabPanel {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanel> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AgentComparison: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [agentsData, setAgentsData] = useState<AgentData[]>([]);
  const [ranksData, setRanksData] = useState<RanksData[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AgentData[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filtering states
  const [minContractsTracked, setMinContractsTracked] = useState<string>('');
  const [minContractValue, setMinContractValue] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dollar-index');

  // Maximum number of agents that can be compared at once
  const MAX_COMPARE_AGENTS = 3;

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { agentsData, ranksData } = await fetchData();
        setAgentsData(agentsData);
        setRanksData(ranksData);
        
        // Pre-select the top 2 agents by dollar index
        const sortedAgents = [...agentsData]
          .filter(agent => agent['Agent Name'] && agent['Agent Name'] !== '(blank)' && agent['Agent Name'] !== 'Grand Total')
          .sort((a, b) => b['Dollar Index'] - a['Dollar Index']);
        
        if (sortedAgents.length >= 2) {
          setSelectedAgents([sortedAgents[0]['Agent Name'], sortedAgents[1]['Agent Name']]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, []);

  // Apply search and filters
  useEffect(() => {
    if (!loading && agentsData.length > 0) {
      let filteredResults = [...agentsData]
        .filter(agent => agent['Agent Name'] && agent['Agent Name'] !== '(blank)' && agent['Agent Name'] !== 'Grand Total');

      // Apply search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filteredResults = filteredResults.filter(agent => 
          agent['Agent Name'].toLowerCase().includes(term) ||
          agent['Agency Name'].toLowerCase().includes(term)
        );
      }

      // Apply minimum contracts tracked filter
      if (minContractsTracked && minContractsTracked !== '') {
        const minCT = parseInt(minContractsTracked, 10);
        if (!isNaN(minCT)) {
          filteredResults = filteredResults.filter(agent => agent['CT'] >= minCT);
        }
      }

      // Apply minimum contract value filter
      if (minContractValue && minContractValue !== '') {
        const minValue = parseInt(minContractValue, 10) * 1000000; // Convert from millions
        if (!isNaN(minValue)) {
          filteredResults = filteredResults.filter(agent => agent['Total Contract Value'] >= minValue);
        }
      }

      // Apply agency filter
      if (selectedAgency && selectedAgency !== '') {
        filteredResults = filteredResults.filter(agent => agent['Agency Name'] === selectedAgency);
      }

      // Apply sorting
      if (sortBy === 'dollar-index') {
        filteredResults.sort((a, b) => b['Dollar Index'] - a['Dollar Index']);
      } else if (sortBy === 'contracts-tracked') {
        filteredResults.sort((a, b) => b['CT'] - a['CT']);
      } else if (sortBy === 'contract-value') {
        filteredResults.sort((a, b) => b['Total Contract Value'] - a['Total Contract Value']);
      } else if (sortBy === 'win-percentage') {
        filteredResults.sort((a, b) => b['Won%'] - a['Won%']);
      } else if (sortBy === 'alphabetical') {
        filteredResults.sort((a, b) => a['Agent Name'].localeCompare(b['Agent Name']));
      }

      setSearchResults(filteredResults);
    }
  }, [loading, agentsData, searchTerm, minContractsTracked, minContractValue, selectedAgency, sortBy]);

  // Handle agent selection/deselection

  // Add an agent from search results
  const handleAddAgent = (agentName: string) => {
    if (selectedAgents.includes(agentName)) {
      return; // Agent already selected
    }
    
    if (selectedAgents.length < MAX_COMPARE_AGENTS) {
      setSelectedAgents([...selectedAgents, agentName]);
    }
  };

  // Remove an agent from comparison
  const handleRemoveAgent = (agentName: string) => {
    setSelectedAgents(selectedAgents.filter(name => name !== agentName));
  };

  // Handle search term changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle search via Autocomplete component
  const handleAutocompleteChange = (_: React.SyntheticEvent, value: string | null) => {
    if (value) {
      setSearchTerm(value);
      
      // Find the agent and add them if they exist
      const agent = agentsData.find(a => a['Agent Name'] === value);
      if (agent && selectedAgents.length < MAX_COMPARE_AGENTS && !selectedAgents.includes(value)) {
        setSelectedAgents([...selectedAgents, value]);
      }
    }
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle filter changes
  const handleMinContractsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinContractsTracked(event.target.value);
  };

  const handleMinContractValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinContractValue(event.target.value);
  };

  const handleAgencyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedAgency(event.target.value as string);
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortBy(event.target.value as string);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinContractsTracked('');
    setMinContractValue('');
    setSelectedAgency('');
    setSortBy('dollar-index');
    setSearchTerm('');
  };

  // Get combined data for the selected agents
  const getSelectedAgentsData = () => {
    return selectedAgents.map(agentName => {
      const agentData = agentsData.find(a => a['Agent Name'] === agentName);
      const rankData = ranksData.find(r => r['Agent Name'] === agentName);
      
      if (agentData && rankData) {
        return { ...agentData, ...rankData };
      }
      
      return null;
    }).filter(data => data !== null) as (AgentData & RanksData)[];
  };

  // Generate colors for charts
  const getAgentColor = (index: number) => {
    const colors = [
      { primary: '#FFB81C', secondary: 'rgba(255, 184, 28, 0.2)' }, // Predators gold
      { primary: '#041E42', secondary: 'rgba(4, 30, 66, 0.2)' },    // Predators navy
      { primary: '#8A8D8F', secondary: 'rgba(138, 141, 143, 0.2)' } // Predators silver
    ];
    
    return colors[index % colors.length];
  };

  // Create radar chart data with fixed normalization
  const createRadarData = (selectedAgentsData: (AgentData & RanksData)[]) => {
    // Get maximum values for normalization
    const maxDollarIndex = Math.max(...selectedAgentsData.map(agent => agent['Dollar Index']), 2);
    const maxCT = Math.max(...selectedAgentsData.map(agent => agent['CT']), 20);
    const maxTCV = Math.max(...selectedAgentsData.map(agent => agent['Total Contract Value']), 50000000);
    
    return {
      labels: ['Dollar Index', 'Win %', 'Contracts Tracked', 'Total Contract Value', 'Value Capture %'],
      datasets: selectedAgentsData.map((agent, index) => {
        const colors = getAgentColor(index);
        
        // Normalize values to a 0-100 scale for radar chart with better scaling
        const normalizedDollarIndex = (agent['Dollar Index'] / maxDollarIndex) * 100;
        
        // Make sure Win % is properly scaled to percentage between 0-100
        const normalizedWinPercentage = agent['Won%'] * 100;
        
        // Make sure Contracts Tracked is properly normalized
        const normalizedCT = (agent['CT'] / maxCT) * 100;
        
        // Make sure Total Contract Value is properly normalized
        const normalizedTCV = (agent['Total Contract Value'] / maxTCV) * 100;
        
        // Extract percentage from string and cap at 100 for radar
        let valueCapture = 0;
        if (agent['Market Value Capture %']) {
          const capturePct = agent['Market Value Capture %'].replace('%', '');
          valueCapture = Math.min(Math.abs(parseFloat(capturePct)), 100);
        }
        
        return {
          label: agent['Agent Name'],
          data: [
            normalizedDollarIndex,
            normalizedWinPercentage,
            normalizedCT,
            normalizedTCV,
            valueCapture
          ],
          backgroundColor: colors.secondary,
          borderColor: colors.primary,
          borderWidth: 2,
        };
      })
    };
  };

  // Create bar chart data for comparing key metrics
  const createBarData = (selectedAgentsData: (AgentData & RanksData)[], metric: keyof (AgentData & RanksData)) => {
    return {
      labels: selectedAgentsData.map(agent => agent['Agent Name']),
      datasets: [
        {
          label: metric.toString(),
          data: selectedAgentsData.map(agent => agent[metric] as number),
          backgroundColor: selectedAgentsData.map((_, index) => getAgentColor(index).secondary),
          borderColor: selectedAgentsData.map((_, index) => getAgentColor(index).primary),
          borderWidth: 2,
        }
      ]
    };
  };

  // Render loading state
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  // Get validated selected agents data
  const selectedAgentsData = getSelectedAgentsData();
  
  // Get unique agency names for filter dropdown
  const agencyNames = [...new Set(agentsData
    .filter(agent => agent['Agency Name'] && agent['Agency Name'] !== '(blank)' && agent['Agency Name'] !== 'Grand Total')
    .map(agent => agent['Agency Name']))
  ].sort();
  
  // Get agent names for autocomplete - use search results instead of all agents
  const agentNames = searchResults.map(agent => agent['Agent Name']);
  
  // Create radar chart data
  const radarData = createRadarData(selectedAgentsData);
  
  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <CompareArrowsIcon sx={{ mr: 1, fontSize: 32 }} />
            Agent Comparison Tool
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Compare performance metrics and statistics between different agents side by side.
          </Typography>
        </Box>

        {/* Enhanced search and filter controls */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3}>
            {/* Search Bar with Autocomplete */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={agentNames}
                renderInput={(params) => (
                  <TextField 
                    {...params}
                    label="Search for an agent" 
                    variant="outlined"
                    onChange={handleSearchChange}
                    value={searchTerm}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    fullWidth
                  />
                )}
                onChange={handleAutocompleteChange}
                renderOption={(props, option) => {
                  const agent = agentsData.find(a => a['Agent Name'] === option);
                  if (!agent) return null;
                  
                  return (
                    <li {...props}>
                      <Box>
                        {option}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {agent['Agency Name']} | DI: ${agent['Dollar Index'].toFixed(2)} | CT: {agent['CT']}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
                filterOptions={(options) => {
                  // This allows our custom filtering to work with the Autocomplete
                  return options;
                }}
              />
            </Grid>

            {/* Sort Controls */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange as any}
                    startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="alphabetical">Alphabetical</MenuItem>
                    <MenuItem value="dollar-index">Dollar Index</MenuItem>
                    <MenuItem value="contracts-tracked">Contracts Tracked</MenuItem>
                    <MenuItem value="contract-value">Contract Value</MenuItem>
                    <MenuItem value="win-percentage">Win Percentage</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  startIcon={<FilterListIcon />}
                  onClick={toggleFilters}
                  sx={{ ml: 'auto' }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </Box>
            </Grid>

            {/* Filter Controls (Conditional) */}
            {showFilters && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Filters" />
                  </Divider>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Min Contracts Tracked"
                    type="number"
                    value={minContractsTracked}
                    onChange={handleMinContractsChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Min Contract Value (Millions)"
                    type="number"
                    value={minContractValue}
                    onChange={handleMinContractValueChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="agency-filter-label">Agency</InputLabel>
                    <Select
                      labelId="agency-filter-label"
                      value={selectedAgency}
                      label="Agency"
                      onChange={handleAgencyChange as any}
                    >
                      <MenuItem value="">All Agencies</MenuItem>
                      {agencyNames.map(agency => (
                        <MenuItem key={agency} value={agency}>{agency}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={resetFilters}
                      sx={{ mr: 2 }}
                    >
                      Reset Filters
                    </Button>
                  </Box>
                </Grid>
              </>
            )}

            {/* Search Results - always show filtered results, not just when there's a search term */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Available Agents ({searchResults.length} agents)
                </Typography>
                {(minContractsTracked || minContractValue || selectedAgency) && (
                  <Chip 
                    label="Filtered" 
                    size="small" 
                    color="info" 
                    onDelete={resetFilters}
                  />
                )}
              </Box>
              <Box sx={{ maxHeight: 200, overflow: 'auto', borderRadius: 1, border: '1px solid #e0e0e0', p: 1 }}>
                <Grid container spacing={1}>
                  {searchResults.slice(0, 20).map((agent) => (
                    <Grid item xs={12} sm={6} md={4} key={agent['Agent Name']}>
                      <Paper
                        elevation={1}
                        sx={{ 
                          p: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          '&:hover': { bgcolor: 'background.default' }
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {agent['Agent Name']}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {agent['Agency Name']} | CT: {agent['CT']} | ${agent['Dollar Index'].toFixed(2)}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          disabled={selectedAgents.includes(agent['Agent Name']) || selectedAgents.length >= MAX_COMPARE_AGENTS}
                          onClick={() => handleAddAgent(agent['Agent Name'])}
                          color="primary"
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                  {searchResults.length === 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                        No agents found matching your criteria
                      </Typography>
                    </Grid>
                  )}
                  {searchResults.length > 20 && (
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'text.secondary' }}>
                        Showing 20 of {searchResults.length} agents. Refine your search to see more specific results.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Selected Agents */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Agents for Comparison {selectedAgents.length > 0 ? `(${selectedAgents.length}/${MAX_COMPARE_AGENTS})` : ''}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedAgents.map((agentName, index) => (
                  <Chip
                    key={agentName}
                    label={agentName}
                    onDelete={() => handleRemoveAgent(agentName)}
                    sx={{ 
                      backgroundColor: getAgentColor(index).secondary,
                      borderColor: getAgentColor(index).primary,
                      borderWidth: 1,
                      borderStyle: 'solid',
                      color: 'text.primary',
                      '& .MuiChip-deleteIcon': {
                        color: getAgentColor(index).primary,
                      }
                    }}
                  />
                ))}
                {selectedAgents.length === 0 && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    Select agents to compare using the search or filters above
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Only show comparison if agents are selected */}
        {selectedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Comparison view tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Overview" icon={<AssessmentIcon />} iconPosition="start" />
                <Tab label="Key Metrics" icon={<MonetizationOnIcon />} iconPosition="start" />
                <Tab label="Radar Analysis" icon={<AccountBalanceIcon />} iconPosition="start" />
                <Tab label="Contracts" icon={<PeopleIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={4}>
                {selectedAgentsData.map((agent, index) => (
                  <Grid item xs={12} md={12 / selectedAgentsData.length} key={agent['Agent Name']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderTop: 4,
                          borderColor: getAgentColor(index).primary
                        }}
                        elevation={3}
                      >
                        <CardContent>
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: getAgentColor(index).primary, width: 56, height: 56 }}>
                              {agent['Agent Name'].charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {agent['Agent Name']}
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                {agent['Agency Name']}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Dollar Index:</Typography>
                              <Typography variant="body1" fontWeight="bold">{formatDollarIndex(agent['Dollar Index'])}</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Win Percentage:</Typography>
                              <Typography variant="body1" fontWeight="bold">{formatPercentage(agent['Won%'])}</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Contracts Tracked:</Typography>
                              <Typography variant="body1" fontWeight="bold">{agent['CT']}</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Total Contract Value:</Typography>
                              <Typography variant="body1" fontWeight="bold">{formatCurrency(agent['Total Contract Value'])}</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Market Value Capture:</Typography>
                              <Typography variant="body1" fontWeight="bold">{agent['Market Value Capture %']}</Typography>
                            </Box>
                          </Stack>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Ranking Position</Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Paper 
                                  elevation={0} 
                                  sx={{ 
                                    p: 1, 
                                    textAlign: 'center',
                                    bgcolor: 'background.default',
                                    borderRadius: 1
                                  }}
                                >
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getAgentColor(index).primary }}>
                                    #{agent['Index R']}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Dollar Index
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper 
                                  elevation={0} 
                                  sx={{ 
                                    p: 1, 
                                    textAlign: 'center',
                                    bgcolor: 'background.default',
                                    borderRadius: 1
                                  }}
                                >
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getAgentColor(index).primary }}>
                                    #{agent['WinR']}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Win Percentage
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Key Metrics Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Dollar Index Comparison</Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar
                          data={createBarData(selectedAgentsData, 'Dollar Index')}
                          options={barOptions}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Win Percentage Comparison</Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar
                          data={createBarData(selectedAgentsData, 'Won%')}
                          options={{
                            ...barOptions,
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 1,
                                ticks: {
                                  callback: function(value) {
                                    return (value as number * 100).toFixed(0) + '%';
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contracts Tracked Comparison</Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar
                          data={createBarData(selectedAgentsData, 'CT')}
                          options={barOptions}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Total Contract Value Comparison</Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar
                          data={createBarData(selectedAgentsData, 'Total Contract Value')}
                          options={{
                            ...barOptions,
                            scales: {
                              y: {
                                ticks: {
                                  callback: function(value) {
                                    return '$' + (value as number / 1000000).toFixed(0) + 'M';
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Radar Analysis Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Performance Radar Analysis</Typography>
                      <Box sx={{ height: 400 }}>
                        <Radar 
                          data={radarData}
                          options={{
                            scales: {
                              r: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                  stepSize: 20
                                }
                              }
                            },
                            plugins: {
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw as number;
                                    
                                    // Add normalized values for better understanding
                                    const metricIndex = context.dataIndex;
                                    const metricName = radarData.labels[metricIndex];
                                    const agent = selectedAgentsData.find(a => a['Agent Name'] === label);
                                    
                                    if (!agent) return label;
                                    
                                    let rawValue = 0;
                                    let unit = '';
                                    
                                    switch(metricName) {
                                      case 'Dollar Index':
                                        rawValue = agent['Dollar Index'];
                                        unit = '';
                                        break;
                                      case 'Win %':
                                        rawValue = agent['Won%'] * 100;
                                        unit = '%';
                                        break;
                                      case 'Contracts Tracked':
                                        rawValue = agent['CT'];
                                        unit = '';
                                        break;
                                      case 'Total Contract Value':
                                        rawValue = agent['Total Contract Value'] / 1000000;
                                        unit = 'M';
                                        break;
                                      case 'Value Capture %':
                                        rawValue = parseFloat(agent['Market Value Capture %']?.replace('%', '') || '0');
                                        unit = '%';
                                        break;
                                    }
                                    
                                    return `${label}: ${value.toFixed(1)}% (${rawValue.toFixed(1)}${unit})`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Radar Analysis Explanation</Typography>
                      <Typography variant="body2" paragraph>
                        The radar chart visualizes multiple performance metrics for each selected agent, normalized to a 0-100 scale for comparison:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          <strong>Dollar Index:</strong> Higher values indicate better performance in negotiating contracts.
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          <strong>Win %:</strong> The percentage of successful negotiations.
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          <strong>Contracts Tracked:</strong> Number of contracts the agent has negotiated.
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          <strong>Total Contract Value:</strong> The total monetary value of all contracts.
                        </Typography>
                        <Typography component="li" variant="body2">
                          <strong>Value Capture %:</strong> Percentage of potential value successfully captured in negotiations.
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        Values are normalized to allow comparison across different scales.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Contracts Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                {selectedAgentsData.map((agent, index) => (
                  <Grid item xs={12} key={agent['Agent Name']}>
                    <Card 
                      sx={{ 
                        borderLeft: 6,
                        borderColor: getAgentColor(index).primary,
                        mb: 2
                      }}
                    >
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" fontWeight="bold">{agent['Agent Name']}</Typography>
                            <Typography variant="body2" color="text.secondary">{agent['Agency Name']}</Typography>
                            <Box sx={{ mt: 2 }}>
                              <Typography component="div" variant="h6" sx={{ fontWeight: 'bold', color: getAgentColor(index).primary }}>
                                {agent['CT']}
                              </Typography>
                              <Typography variant="body2">Total Contracts</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom>Contract Value</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(agent['Total Contract Value'])}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Average per Contract: {formatCurrency(agent['Total Contract Value'] / (agent['CT'] || 1))}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom>Player Value</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(agent['Total Player Value'])}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Difference: {formatCurrency(agent['Dollars Captured Above/ Below Value'])}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom>Value Capture</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: agent['Market Value Capture %'].includes('-') ? 'error.main' : 'success.main' }}>
                              {agent['Market Value Capture %']}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Discount Rate: {agent['Discount Rate']}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default AgentComparison; 