import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, className = '' }) => {
  return (
    <Card 
      component={motion.div}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: 4,
        borderColor: 'primary.main',
        boxShadow: 3,
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && (
            <Box sx={{ mr: 1, color: 'primary.main' }}>
              {icon}
            </Box>
          )}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard; 