import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Container,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';

// Predators logo
const PREDATORS_LOGO = 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Nashville_Predators_Logo_%282011%29.svg/1200px-Nashville_Predators_Logo_%282011%29.svg.png';

const HomePage: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const navItems = [
    { path: '/agent-dashboard', label: 'Agent Dashboard', icon: <PersonIcon fontSize="large" />, description: 'View detailed information about individual agents' },
    { path: '/agency-dashboard', label: 'Agency Dashboard', icon: <BusinessIcon fontSize="large" />, description: 'Explore data about hockey agencies' },
    { path: '/leaderboard', label: 'Leaderboard', icon: <LeaderboardIcon fontSize="large" />, description: 'See rankings of top agents' },
    { path: '/second-contracts-leaderboard', label: 'Second Contracts', icon: <AutoGraphIcon fontSize="large" />, description: 'View second contract performance metrics' },
    { path: '/classifications', label: 'Classifications', icon: <CategoryIcon fontSize="large" />, description: 'Categorize agents based on performance' },
    { path: '/project-definitions', label: 'Project Definitions', icon: <InfoIcon fontSize="large" />, description: 'Learn about key metrics and data sources' },
  ];

  return (
    <Container maxWidth="lg">
      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ textAlign: 'center', mb: 6, mt: 4 }}
      >
        <Box 
          component="img" 
          src={PREDATORS_LOGO} 
          alt="Nashville Predators Logo" 
          sx={{ height: 100, mb: 2 }} 
        />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
          Agent Insights Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Comprehensive analytics and insights about hockey agents and agencies
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #041E42 0%, #072a5c 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Welcome to the Agent Insights Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            This dashboard provides comprehensive analytics and insights about hockey agents and agencies.
            Navigate through different sections using the sidebar menu or the cards below.
          </Typography>
        </Box>
        
        <Grid 
          container 
          spacing={3} 
          component={motion.div}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {navItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.path} component={motion.div} variants={itemAnimation}>
              <Card 
                component={motion.div}
                whileHover={{ 
                  y: -10,
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.2 }
                }}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Box sx={{ 
                    color: 'primary.main', 
                    mb: 2,
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 184, 28, 0.1)',
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', opacity: 0.8 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Button 
                      component={Link} 
                      to={item.path} 
                      variant="contained" 
                      color="primary"
                      sx={{ 
                        fontWeight: 'bold',
                        px: 3,
                        py: 1,
                      }}
                    >
                      Explore
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          borderLeft: 6,
          borderColor: 'primary.main',
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
          About This Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This dashboard visualizes data about hockey agents and agencies, providing insights into their performance,
          contract negotiations, and client relationships. The data is sourced from publicly available information
          and is updated regularly. 
        </Typography>
      </Paper>
    </Container>
  );
};

export default HomePage; 