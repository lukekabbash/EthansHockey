import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import type { AgentData, RanksData } from '@/api/dataService';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  TextField, 
  InputAdornment, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Paper,
  Collapse
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Define sort options
type SortField = 'agent' | 'agency' | 'value' | 'contracts';
type SortDirection = 'asc' | 'desc';

const Classifications: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [agentsData, setAgentsData] = useState<AgentData[]>([]);
  const [ranksData, setRanksData] = useState<RanksData[]>([]);
  const [selectedClassification, setSelectedClassification] = useState<string>('dollar-index');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Elite': true,
    'Great': true,
    'Good': true,
    'Average': true,
    'Below Average': true
  });
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  // Toggle section expanded/collapsed state
  const toggleSection = (section: string) => {
    setExpandedSections(prevState => ({
      ...prevState,
      [section]: !prevState[section]
    }));
  };

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // If clicking on the same field, toggle direction
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking on a new field, set it as the sort field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle agent click
  const handleAgentClick = (agentName: string) => {
    navigate(`/agent-dashboard?agent=${encodeURIComponent(agentName)}`);
  };

  // Handle agency click
  const handleAgencyClick = (agencyName: string) => {
    navigate(`/agency-dashboard?agency=${encodeURIComponent(agencyName)}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '64vh' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Loading classifications data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  // Define classification thresholds
  const dollarIndexThresholds = [
    { name: 'Elite', min: 1.5, color: 'bg-green-100 text-green-800', bgColor: '#e6f7e9', textColor: '#0f5132' },
    { name: 'Great', min: 1.2, max: 1.5, color: 'bg-blue-100 text-blue-800', bgColor: '#dbeafe', textColor: '#1e40af' },
    { name: 'Good', min: 1.0, max: 1.2, color: 'bg-indigo-100 text-indigo-800', bgColor: '#e0e7ff', textColor: '#3730a3' },
    { name: 'Average', min: 0.8, max: 1.0, color: 'bg-yellow-100 text-yellow-800', bgColor: '#fef3c7', textColor: '#92400e' },
    { name: 'Below Average', max: 0.8, color: 'bg-red-100 text-red-800', bgColor: '#fee2e2', textColor: '#b91c1c' }
  ];

  const winPercentageThresholds = [
    { name: 'Elite', min: 0.6, color: 'bg-green-100 text-green-800', bgColor: '#e6f7e9', textColor: '#0f5132' },
    { name: 'Great', min: 0.55, max: 0.6, color: 'bg-blue-100 text-blue-800', bgColor: '#dbeafe', textColor: '#1e40af' },
    { name: 'Good', min: 0.5, max: 0.55, color: 'bg-indigo-100 text-indigo-800', bgColor: '#e0e7ff', textColor: '#3730a3' },
    { name: 'Average', min: 0.45, max: 0.5, color: 'bg-yellow-100 text-yellow-800', bgColor: '#fef3c7', textColor: '#92400e' },
    { name: 'Below Average', max: 0.45, color: 'bg-red-100 text-red-800', bgColor: '#fee2e2', textColor: '#b91c1c' }
  ];

  const contractsTrackedThresholds = [
    { name: 'Elite', min: 30, color: 'bg-green-100 text-green-800', bgColor: '#e6f7e9', textColor: '#0f5132' },
    { name: 'Great', min: 20, max: 30, color: 'bg-blue-100 text-blue-800', bgColor: '#dbeafe', textColor: '#1e40af' },
    { name: 'Good', min: 10, max: 20, color: 'bg-indigo-100 text-indigo-800', bgColor: '#e0e7ff', textColor: '#3730a3' },
    { name: 'Average', min: 5, max: 10, color: 'bg-yellow-100 text-yellow-800', bgColor: '#fef3c7', textColor: '#92400e' },
    { name: 'Below Average', max: 5, color: 'bg-red-100 text-red-800', bgColor: '#fee2e2', textColor: '#b91c1c' }
  ];

  const totalContractValueThresholds = [
    { name: 'Elite', min: 100000000, color: 'bg-green-100 text-green-800', bgColor: '#e6f7e9', textColor: '#0f5132' },
    { name: 'Great', min: 50000000, max: 100000000, color: 'bg-blue-100 text-blue-800', bgColor: '#dbeafe', textColor: '#1e40af' },
    { name: 'Good', min: 25000000, max: 50000000, color: 'bg-indigo-100 text-indigo-800', bgColor: '#e0e7ff', textColor: '#3730a3' },
    { name: 'Average', min: 10000000, max: 25000000, color: 'bg-yellow-100 text-yellow-800', bgColor: '#fef3c7', textColor: '#92400e' },
    { name: 'Below Average', max: 10000000, color: 'bg-red-100 text-red-800', bgColor: '#fee2e2', textColor: '#b91c1c' }
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
        // Let the formatter handle the scaling
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

  // Get display name for the classification metric
  const getMetricDisplayName = () => {
    switch (selectedClassification) {
      case 'dollar-index':
        return 'Dollar Index';
      case 'win-percentage':
        return 'Win Percentage';
      case 'contracts-tracked':
        return 'Contracts Tracked';
      case 'total-contract-value':
        return 'Total Contract Value';
      default:
        return 'Value';
    }
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

    // Apply search term filter if provided
    const searchFiltered = searchTerm.trim() !== ''
      ? validData.filter(agent => 
          agent['Agent Name'].toLowerCase().includes(searchTerm.toLowerCase()) || 
          agent['Agency Name'].toLowerCase().includes(searchTerm.toLowerCase())
        )
      : validData;

    // Group by classification
    const groupedData: Record<string, (AgentData & RanksData)[]> = {};
    const thresholds = getThresholds();
    
    thresholds.forEach(threshold => {
      groupedData[threshold.name] = [];
    });

    searchFiltered.forEach(agent => {
      const value = getAgentValue(agent);
      const classification = getClassification(value);
      if (classification && groupedData[classification.name]) {
        groupedData[classification.name].push(agent as AgentData & RanksData);
      }
    });

    // Sort data in each group
    Object.keys(groupedData).forEach(key => {
      groupedData[key] = sortAgents(groupedData[key]);
    });

    return { groupedData, thresholds };
  };

  // Sort agents based on the current sort field and direction
  const sortAgents = (agents: (AgentData & RanksData)[]) => {
    return [...agents].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'agent':
          comparison = a['Agent Name'].localeCompare(b['Agent Name']);
          break;
        case 'agency':
          comparison = a['Agency Name'].localeCompare(b['Agency Name']);
          break;
        case 'value':
          comparison = getAgentValue(b) - getAgentValue(a);
          break;
        case 'contracts':
          comparison = b['CT'] - a['CT'];
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? -comparison : comparison;
    });
  };

  // Prepare the data
  const { groupedData, thresholds } = prepareData();

  // Get counts for each classification
  const getCounts = () => {
    return thresholds.map(threshold => ({
      name: threshold.name,
      count: groupedData[threshold.name].length
    }));
  };
  
  const counts = getCounts();
  const totalAgents = counts.reduce((sum, group) => sum + group.count, 0);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
        Agent Classifications
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="classification-select-label">Classification Metric</InputLabel>
              <Select
                labelId="classification-select-label"
                id="classification-select"
                value={selectedClassification}
                onChange={(e) => setSelectedClassification(e.target.value as string)}
                label="Classification Metric"
              >
                <MenuItem value="dollar-index">Dollar Index</MenuItem>
                <MenuItem value="win-percentage">Win Percentage</MenuItem>
                <MenuItem value="contracts-tracked">Contracts Tracked</MenuItem>
                <MenuItem value="total-contract-value">Total Contract Value</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search for agent or agency..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {counts.map(group => (
            <Chip 
              key={group.name} 
              label={`${group.name}: ${group.count}`} 
              sx={{ 
                bgcolor: thresholds.find(t => t.name === group.name)?.bgColor,
                color: thresholds.find(t => t.name === group.name)?.textColor,
                fontWeight: 'medium'
              }}
              onClick={() => {
                const section = document.getElementById(`section-${group.name}`);
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                  toggleSection(group.name);
                }
              }}
            />
          ))}
          <Chip 
            label={`Total: ${totalAgents} Agents`} 
            variant="outlined" 
            sx={{ fontWeight: 'medium' }}
          />
          {searchTerm && (
            <Chip 
              label={`Search: "${searchTerm}"`} 
              color="primary" 
              onDelete={clearSearch}
            />
          )}
        </Box>
      </Paper>
      
      <Box className="space-y-6">
        {thresholds.map(threshold => (
          <Card 
            key={threshold.name} 
            id={`section-${threshold.name}`}
            elevation={3} 
            sx={{ 
              mb: 3, 
              borderRadius: 2, 
              overflow: 'hidden',
              borderTop: 4,
              borderColor: threshold.textColor
            }}
          >
            <Box 
              sx={{ 
                px: 3, 
                py: 2, 
                bgcolor: threshold.bgColor,
                color: threshold.textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection(threshold.name)}
            >
              <Box>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  {threshold.name} Agents 
                  <Chip 
                    size="small" 
                    label={groupedData[threshold.name].length} 
                    sx={{ ml: 1, fontWeight: 'bold', bgcolor: 'white' }}
                  />
                </Typography>
                <Typography variant="body2">
                  {threshold.min && threshold.max && `${formatValue(threshold.min)} - ${formatValue(threshold.max)}`}
                  {threshold.min && !threshold.max && `≥ ${formatValue(threshold.min)}`}
                  {!threshold.min && threshold.max && `< ${formatValue(threshold.max)}`}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                sx={{ color: 'inherit' }}
              >
                {expandedSections[threshold.name] ? 
                  <KeyboardArrowUpIcon /> : 
                  <KeyboardArrowDownIcon />
                }
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections[threshold.name]} timeout={400} unmountOnExit>
              <CardContent sx={{ p: 0 }}>
                {groupedData[threshold.name].length > 0 ? (
                  <Box sx={{ 
                    overflow: 'auto', 
                    maxHeight: { xs: 350, md: 500 }, 
                    '& table': { borderCollapse: 'collapse', width: '100%' }
                  }}>
                    <table style={{ minWidth: '100%' }}>
                      <thead>
                        <tr>
                          <th 
                            style={{ 
                              padding: '16px', 
                              textAlign: 'left', 
                              backgroundColor: '#f9fafb', 
                              borderBottom: '1px solid #e5e7eb',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSortChange('agent')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Agent Name
                              {sortField === 'agent' && (
                                sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> 
                                : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </th>
                          <th 
                            style={{ 
                              padding: '16px', 
                              textAlign: 'left', 
                              backgroundColor: '#f9fafb', 
                              borderBottom: '1px solid #e5e7eb',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSortChange('agency')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Agency Name
                              {sortField === 'agency' && (
                                sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> 
                                : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </th>
                          <th 
                            style={{ 
                              padding: '16px', 
                              textAlign: 'left', 
                              backgroundColor: '#f9fafb', 
                              borderBottom: '1px solid #e5e7eb',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSortChange('value')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getMetricDisplayName()}
                              {sortField === 'value' && (
                                sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> 
                                : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </th>
                          <th 
                            style={{ 
                              padding: '16px', 
                              textAlign: 'left', 
                              backgroundColor: '#f9fafb', 
                              borderBottom: '1px solid #e5e7eb',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSortChange('contracts')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Contracts Tracked
                              {sortField === 'contracts' && (
                                sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> 
                                : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedData[threshold.name].map(agent => (
                          <tr key={agent['Agent Name']} style={{ 
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: 'white'
                          }}>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <Box
                                component="span"
                                onClick={() => handleAgentClick(agent['Agent Name'])}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'color 0.2s',
                                  position: 'relative',
                                  display: 'inline-block',
                                  fontWeight: 'medium',
                                  '&:hover': {
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                  }
                                }}
                              >
                                {agent['Agent Name']}
                              </Box>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <Box
                                component="span"
                                onClick={() => handleAgencyClick(agent['Agency Name'])}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'color 0.2s',
                                  position: 'relative',
                                  display: 'inline-block',
                                  '&:hover': {
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                  }
                                }}
                              >
                                {agent['Agency Name']}
                              </Box>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 'medium' }}>
                              {formatValue(getAgentValue(agent))}
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              {agent['CT']}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography>No agents in this classification{searchTerm ? ' matching your search.' : '.'}</Typography>
                  </Box>
                )}
              </CardContent>
            </Collapse>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Classifications;