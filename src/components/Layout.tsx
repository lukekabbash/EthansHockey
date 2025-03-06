import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
} from '@mui/material';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Predators logo
const PREDATORS_LOGO = 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Nashville_Predators_Logo_%282011%29.svg/1200px-Nashville_Predators_Logo_%282011%29.svg.png';

const drawerWidth = 280;

const navItems = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/agent-dashboard', label: 'Agent Dashboard', icon: <PersonIcon /> },
  { path: '/agency-dashboard', label: 'Agency Dashboard', icon: <BusinessIcon /> },
  { path: '/leaderboard', label: 'Leaderboard', icon: <LeaderboardIcon /> },
  { path: '/second-contracts-leaderboard', label: 'Second Contracts', icon: <AutoGraphIcon /> },
  { path: '/agent-comparison', label: 'Agent Compare', icon: <CompareArrowsIcon /> },
  { path: '/classifications', label: 'Classifications', icon: <CategoryIcon /> },
  { path: '/project-definitions', label: 'Project Definitions', icon: <InfoIcon /> },
];

const Layout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ 
      bgcolor: 'secondary.main', 
      color: 'secondary.contrastText', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: 1, 
        borderColor: 'rgba(255, 255, 255, 0.1)' 
      }}>
        <Box 
          component="img" 
          src={PREDATORS_LOGO} 
          alt="Nashville Predators Logo" 
          sx={{ height: 40, mr: 2 }} 
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Agent Insights
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              component={NavLink} 
              to={item.path} 
              sx={{ 
                py: 1.5,
                color: 'white',
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'secondary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'secondary.main',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: 'white', 
                minWidth: 40,
                transition: 'color 0.2s',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
              {location.pathname === item.path && (
                <Box 
                  component={motion.div}
                  layoutId="activeIndicator"
                  sx={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: 4, 
                    bgcolor: 'primary.main',
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Agent Insights Dashboard
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { md: 'none' },
          bgcolor: 'secondary.main',
          color: 'white',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box 
            component="img" 
            src={PREDATORS_LOGO} 
            alt="Nashville Predators Logo" 
            sx={{ height: 40, mr: 2 }} 
          />
          <Typography variant="h6" noWrap component="div">
            Agent Insights
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'secondary.main',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'secondary.main',
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 },
          bgcolor: 'background.default',
        }}
      >
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={location.pathname}
          sx={{ maxWidth: 1200, mx: 'auto' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 