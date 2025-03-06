import React, { useState, useEffect } from 'react';
import { fetchData } from '@/api/dataService';
import { formatCurrency, formatRank, formatDollarIndex } from '@/utils/formatters';
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
import type { AgentData, RanksData, PIBAData } from '@/api/dataService';

// Icons for metric cards
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

const AgentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [agentsData, setAgentsData] = useState<AgentData[]>([]);
  const [ranksData, setRanksData] = useState<RanksData[]>([]);
  const [pibaData, setPibaData] = useState<PIBAData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agentInfo, setAgentInfo] = useState<AgentData | null>(null);
  const [rankInfo, setRankInfo] = useState<RanksData | null>(null);
  const [vcpData, setVcpData] = useState<{ [key: string]: number | null }>({});
  const [agentPlayers, setAgentPlayers] = useState<PIBAData[]>([]);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { agentsData, ranksData, pibaData } = await fetchData();
        setAgentsData(agentsData);
        setRanksData(ranksData);
        setPibaData(pibaData);
        
        // Check if agent parameter exists in the URL
        const queryParams = new URLSearchParams(location.search);
        const agentParam = queryParams.get('agent');
        
        if (agentParam) {
          // Find the agent in the loaded data
          const foundAgent = agentsData.find(a => a['Agent Name'] === agentParam);
          if (foundAgent) {
            setSelectedAgent(agentParam);
            setNotificationOpen(true);
          }
        }
        
        // If no agent is selected, default to the first agent
        if (!selectedAgent && agentsData.length > 0) {
          setSelectedAgent(agentsData[0]['Agent Name']);
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
    if (selectedAgent && agentsData.length > 0 && ranksData.length > 0) {
      const agent = agentsData.find(a => a['Agent Name'] === selectedAgent);
      const rank = ranksData.find(r => r['Agent Name'] === selectedAgent);
      
      if (agent) setAgentInfo(agent);
      if (rank) setRankInfo(rank);
      
      // Compute VCP data for the selected agent
      if (pibaData.length > 0) {
        const players = pibaData.filter(p => p['Agent Name'] === selectedAgent);
        setAgentPlayers(players);
        computeVcpForAgent(players);
      }
    }
  }, [selectedAgent, agentsData, ranksData, pibaData]);

  const computeVcpForAgent = (agentPlayers: PIBAData[]) => {
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
      
      agentPlayers.forEach(player => {
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

  // Handle navigation to agency dashboard
  const handleAgencyClick = (agencyName: string) => {
    // Navigate to agency dashboard with the agency name as a query parameter
    navigate(`/agency-dashboard?agency=${encodeURIComponent(agencyName)}`);
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

  const agentNames = ranksData
    .map(agent => agent['Agent Name'])
    .filter(name => name && name !== '' && name !== '(blank)' && name !== 'Grand Total')
    .sort((a, b) => a.split(' ').pop()!.localeCompare(b.split(' ').pop()!));

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

  // Get top clients for the selected agent
  const topClients = agentPlayers
    .sort((a, b) => Number(b['Total Cost'] || 0) - Number(a['Total Cost'] || 0))
    .slice(0, 3);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      {/* Notification for when agent is selected from leaderboard */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          Showing data for agent: {selectedAgent}
        </Alert>
      </Snackbar>
      
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}>
        Agent Overview Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel id="agent-select-label">Select an Agent</InputLabel>
          <Select
            labelId="agent-select-label"
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            label="Select an Agent"
            sx={{ bgcolor: 'white' }}
          >
            {agentNames.map(name => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {agentInfo && rankInfo && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
              {selectedAgent} - 
              <Box 
                component="span" 
                onClick={() => handleAgencyClick(agentInfo['Agency Name'])}
                sx={{ 
                  cursor: 'pointer',
                  display: 'inline-block',
                  px: 1,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  }
                }}
              >
                {agentInfo['Agency Name']}
              </Box>
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
                  value={formatDollarIndex(rankInfo['Dollar Index'])}
                  icon={<AttachMoneyIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Win %" 
                  value={`${(agentInfo['Won%'] * 100).toFixed(1)}%`}
                  icon={<EmojiEventsIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Contracts Tracked" 
                  value={agentInfo['CT']}
                  icon={<AssignmentIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Total Contract Value" 
                  value={formatCurrency(agentInfo['Total Contract Value'])}
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
                  value={formatCurrency(agentInfo['Total Player Value'])}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Dollars Captured Above/Below Value" 
                  value={formatCurrency(agentInfo['Dollars Captured Above/ Below Value'])}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Market Value Capture %" 
                  value={agentInfo['Market Value Capture %']}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LeaderboardIcon sx={{ mr: 1, color: 'primary.main' }} />
              Agent Rankings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Dollar Index Rank" 
                  value={formatRank(rankInfo['Index R'], 90)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Win % Rank" 
                  value={formatRank(rankInfo['WinR'], 90)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Contracts Tracked Rank" 
                  value={formatRank(rankInfo['CTR'], 90)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Total Contract Value Rank" 
                  value={formatRank(rankInfo['TCV R'], 90)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard 
                  title="Total Player Value Rank" 
                  value={formatRank(rankInfo['TPV R'], 90)}
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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Cost</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player Contribution</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dollars Captured</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Value Capture %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agentPlayers.map((player) => (
                    <TableRow
                      key={player['Player Name']}
                      sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell component="th" scope="row">
                        {player['Player Name']}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(player['Total Cost'] || 0))}</TableCell>
                      <TableCell>{formatCurrency(Number(player['PC'] || 0))}</TableCell>
                      <TableCell>{formatCurrency(Number(player['Dollars Captured Above/ Below Value'] || 0))}</TableCell>
                      <TableCell>{player['Value Capture %']}</TableCell>
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

export default AgentDashboard; 