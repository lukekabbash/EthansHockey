import React, { useState, useEffect } from 'react';
import { fetchAgenciesData, fetchData } from '@/api/dataService';
import { formatCurrency, formatRank, formatDollarIndex, formatPercentage } from '@/utils/formatters';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid, 
  Paper, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import MetricCard from '@/components/MetricCard';
import LineChart from '@/components/LineChart';
import PlayerCard from '@/components/PlayerCard';
import type { AgencyData, PIBAData } from '@/api/dataService';

// Icons for metric cards
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import BusinessIcon from '@mui/icons-material/Business';

const AgencyDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [agenciesData, setAgenciesData] = useState<AgencyData[]>([]);
  const [pibaData, setPibaData] = useState<PIBAData[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [agencyInfo, setAgencyInfo] = useState<AgencyData | null>(null);
  const [vcpData, setVcpData] = useState<{ [key: string]: number | null }>({});
  const [agencyPlayers, setAgencyPlayers] = useState<PIBAData[]>([]);
  const [agencyAgents, setAgencyAgents] = useState<string[]>([]);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchAgenciesData();
        
        // Ensure we properly handle the data structure with type safety
        let agencies: AgencyData[] = [];
        if (Array.isArray(response)) {
          agencies = response;
        } else if (response && typeof response === 'object') {
          // Use type assertion for the response
          const typedResponse = response as { agenciesData?: AgencyData[] };
          agencies = typedResponse.agenciesData || [];
        }
        
        setAgenciesData(agencies);
        
        const { pibaData } = await fetchData();
        setPibaData(pibaData);
        
        // Check if agency parameter exists in the URL
        const queryParams = new URLSearchParams(location.search);
        const agencyParam = queryParams.get('agency');
        
        if (agencyParam) {
          // Find the agency in the loaded data
          const foundAgency = agencies.find((a: AgencyData) => a['Agency Name'] === agencyParam);
          if (foundAgency) {
            setSelectedAgency(agencyParam);
            setNotificationOpen(true);
          }
        }
        
        // If no agency is selected, default to the first agency
        if (!selectedAgency && agencies.length > 0) {
          setSelectedAgency(agencies[0]['Agency Name']);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, [location.search]);

  useEffect(() => {
    if (selectedAgency && agenciesData.length > 0) {
      const agency = agenciesData.find(a => a['Agency Name'] === selectedAgency);
      
      if (agency) setAgencyInfo(agency);
      
      // Compute VCP data for the selected agency
      if (pibaData.length > 0) {
        const players = pibaData.filter(p => p['Agency Name'] === selectedAgency);
        setAgencyPlayers(players);
        
        // Get unique agent names for this agency
        const agents = [...new Set(players.map(p => p['Agent Name']))];
        setAgencyAgents(agents);
        
        computeVcpForAgency(players);
      }
    }
  }, [selectedAgency, agenciesData, pibaData]);

  const computeVcpForAgency = (agencyPlayers: PIBAData[]) => {
    const seasons = [
      { year: '2018-19', costCol: 'COST 18-19', pcCol: 'PC 18-19' },
      { year: '2019-20', costCol: 'COST 19-20', pcCol: 'PC 19-20' },
      { year: '2020-21', costCol: 'COST 20-21', pcCol: 'PC 20-21' },
      { year: '2021-22', costCol: 'COST 21-22', pcCol: 'PC 21-22' },
      { year: '2022-23', costCol: 'COST 22-23', pcCol: 'PC 22-23' },
      { year: '2023-24', costCol: 'COST 23-24', pcCol: 'PC 23-24' }
    ];
    
    const vcp: { [key: string]: number | null } = {};
    
    seasons.forEach(({ year, costCol, pcCol }) => {
      let totalCost = 0;
      let totalPc = 0;
      
      agencyPlayers.forEach(player => {
        const cost = Number(player[costCol as keyof PIBAData] || 0);
        const pc = Number(player[pcCol as keyof PIBAData] || 0);
        
        if (!isNaN(cost)) totalCost += cost;
        if (!isNaN(pc)) totalPc += pc;
      });
      
      vcp[year] = totalPc > 0 ? Math.round((totalCost / totalPc) * 100) : null;
    });
    
    setVcpData(vcp);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  // Handle navigation to agent dashboard
  const handleAgentClick = (agentName: string) => {
    // Navigate to agent dashboard with the agent name as a query parameter
    navigate(`/agent-dashboard?agent=${encodeURIComponent(agentName)}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
        <Typography variant="h6">{error}</Typography>
      </Paper>
    );
  }

  const agencyNames = agenciesData
    .map(agency => agency['Agency Name'])
    .filter(name => name && name !== '' && name !== '(blank)' && name !== 'Grand Total')
    .sort();

  const vcpChartData = {
    labels: Object.keys(vcpData),
    datasets: [
      {
        label: 'Value Capture Percentage',
        data: Object.values(vcpData).map(v => v || 0),
        borderColor: '#FFB81C', // Predators gold
        backgroundColor: 'rgba(255, 184, 28, 0.2)',
      },
    ],
  };

  // Get top clients for the selected agency
  const topClients = agencyPlayers
    .sort((a, b) => Number(b['Total Cost'] || 0) - Number(a['Total Cost'] || 0))
    .slice(0, 3);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      {/* Notification for when agency is selected from leaderboard */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          Showing data for agency: {selectedAgency}
        </Alert>
      </Snackbar>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box 
          component="img" 
          src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Nashville_Predators_Logo_%282011%29.svg/1200px-Nashville_Predators_Logo_%282011%29.svg.png" 
          alt="Nashville Predators Logo" 
          sx={{ height: 50, mr: 2 }} 
        />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
          Agency Insights Dashboard
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel id="agency-select-label">Select an Agency</InputLabel>
          <Select
            labelId="agency-select-label"
            id="agency-select"
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
            label="Select an Agency"
            sx={{ bgcolor: 'white' }}
          >
            {agencyNames.map(name => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {agencyInfo && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              {selectedAgency}
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
              Financial Breakdown
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Dollar Index" 
                  value={formatDollarIndex(agencyInfo['Dollar Index'])}
                  icon={<AttachMoneyIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Win %" 
                  value={formatPercentage(agencyInfo['Won%'])}
                  icon={<EmojiEventsIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Contracts Tracked" 
                  value={agencyInfo['CT']}
                  icon={<AssignmentIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Total Contract Value" 
                  value={formatCurrency(agencyInfo['Total Contract Value'])}
                  icon={<AccountBalanceIcon />}
                />
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LeaderboardIcon sx={{ mr: 1, color: 'primary.main' }} />
              Additional Metrics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Total Player Value" 
                  value={formatCurrency(agencyInfo['Total Player Value'])}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Dollars Captured Above/Below Value" 
                  value={formatCurrency(agencyInfo['Dollars Captured Above/ Below Value'])}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Market Value Capture %" 
                  value={agencyInfo['Market Value Capture %']}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LeaderboardIcon sx={{ mr: 1, color: 'primary.main' }} />
              Agency Rankings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Dollar Index Rank" 
                  value={formatRank(agencyInfo['Index R'], 74)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Win % Rank" 
                  value={formatRank(agencyInfo['WinR'], 74)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Contracts Tracked Rank" 
                  value={formatRank(agencyInfo['CTR'], 74)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Total Contract Value Rank" 
                  value={formatRank(agencyInfo['TCV R'], 74)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Total Player Value Rank" 
                  value={formatRank(agencyInfo['TPV R'], 74)}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <LeaderboardIcon sx={{ mr: 1, color: 'primary.main' }} />
              Year-by-Year VCP Trend
            </Typography>
            
            <Box sx={{ height: 400 }}>
              <LineChart 
                title="Value Capture Percentage Over Time" 
                labels={vcpChartData.labels} 
                datasets={vcpChartData.datasets} 
              />
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main' }} />
              Biggest Clients
            </Typography>
            
            <Grid container spacing={3}>
              {topClients.map(client => (
                <Grid item xs={12} sm={6} md={4} key={client['Player Name']}>
                  <PlayerCard 
                    playerName={client['Player Name']} 
                    totalCost={Number(client['Total Cost'] || 0)}
                    deliveryValue={Number(client['Dollars Captured Above/ Below Value'] || 0)}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              Agency Agents ({agencyAgents.length})
            </Typography>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="agents table">
                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agent Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clients</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agencyAgents.map((agentName) => {
                    const agentClients = agencyPlayers.filter(p => p['Agent Name'] === agentName);
                    return (
                      <TableRow
                        key={agentName}
                        sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                      >
                        <TableCell 
                          component="th" 
                          scope="row"
                          onClick={() => handleAgentClick(agentName)}
                          sx={{ 
                            cursor: 'pointer',
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: 'primary.main',
                                fontWeight: 'bold',
                              }
                            }}
                          >
                            {agentName}
                          </Box>
                        </TableCell>
                        <TableCell>{agentClients.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              All Clients
            </Typography>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="clients table">
                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agent Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Cost</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player Contribution</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dollars Captured</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agencyPlayers.map((player) => (
                    <TableRow
                      key={player['Player Name']}
                      sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell component="th" scope="row">
                        {player['Player Name']}
                      </TableCell>
                      <TableCell>{player['Agent Name']}</TableCell>
                      <TableCell>{formatCurrency(Number(player['Total Cost'] || 0))}</TableCell>
                      <TableCell>{formatCurrency(Number(player['PC'] || 0))}</TableCell>
                      <TableCell>{formatCurrency(Number(player['Dollars Captured Above/ Below Value'] || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AgencyDashboard; 