import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ title, labels, datasets, className = '' }) => {
  // Customize the chart with Predators colors
  const customizedDatasets = datasets.map(dataset => ({
    ...dataset,
    borderColor: '#FFB81C', // Predators gold
    backgroundColor: 'rgba(255, 184, 28, 0.2)', // Transparent gold
    borderWidth: 3,
    pointBackgroundColor: '#041E42', // Predators navy
    pointBorderColor: '#FFB81C',
    pointHoverBackgroundColor: '#FFB81C',
    pointHoverBorderColor: '#041E42',
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.3, // Smooth curve
  }));

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            weight: 'bold',
          },
          color: '#041E42', // Predators navy
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#041E42',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        caretSize: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
          color: '#041E42',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
          color: '#041E42',
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    },
  };

  const data = {
    labels,
    datasets: customizedDatasets,
  };

  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
          {title}
        </Typography>
        <Box sx={{ height: 350, position: 'relative' }}>
          <Line options={options} data={data} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineChart; 