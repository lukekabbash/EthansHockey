import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';
import { getPlayerHeadshotUrl } from '@/api/dataService';

interface PlayerCardProps {
  playerName: string;
  imageUrl?: string;
  totalCost: number;
  deliveryValue?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  playerName, 
  imageUrl, 
  totalCost, 
  deliveryValue
}) => {
  const placeholderImage = "https://upload.wikimedia.org/wikipedia/en/3/3a/05_NHL_Shield.svg";
  const headshotUrl = imageUrl || getPlayerHeadshotUrl(playerName);
  
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
        overflow: 'hidden',
        borderLeft: 4,
        borderColor: 'primary.main',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          p: 2,
          bgcolor: 'secondary.main',
          color: 'white',
        }}>
          <Avatar 
            src={headshotUrl} 
            alt={`${playerName} headshot`}
            sx={{ 
              width: 56, 
              height: 56, 
              border: 2, 
              borderColor: 'primary.main',
            }}
            imgProps={{
              onError: (e) => {
                const target = e.target as HTMLImageElement;
                target.src = placeholderImage;
              }
            }}
          />
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {playerName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Total Cost: {formatCurrency(totalCost)}
            </Typography>
          </Box>
        </Box>
        
        {deliveryValue !== undefined && (
          <Box sx={{ 
            p: 2, 
            bgcolor: deliveryValue >= 0 ? 'success.light' : 'error.light',
            color: deliveryValue >= 0 ? 'success.dark' : 'error.dark',
            fontWeight: 'bold',
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Delivery Value: {deliveryValue >= 0 ? '+' : ''}{formatCurrency(deliveryValue)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerCard; 