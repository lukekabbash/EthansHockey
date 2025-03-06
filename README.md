# Agent Dashboard React

A React implementation of the Agent Dashboard, providing a modern and responsive user interface for analyzing hockey agent and agency data.

## Features

- **Agent Dashboard**: View detailed information about individual agents, including financial metrics, rankings, and client information.
- **Agency Dashboard**: Explore data about hockey agencies, including their financial performance and top clients.
- **Leaderboard**: See rankings of top agents based on various metrics.
- **Second Contracts Leaderboard**: View performance metrics for agents negotiating second contracts.
- **Classifications**: Categorize agents based on different performance metrics.
- **Project Definitions**: Learn about the key metrics and data sources used in the project.

## Technologies Used

- React
- TypeScript
- React Router
- Chart.js
- Tailwind CSS
- Axios

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/agent-dashboard-react.git
   cd agent-dashboard-react
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
agent-dashboard-react/
├── public/               # Static assets
├── src/                  # Source code
│   ├── api/              # API services
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

## Data Source

This project uses data from the original Agent Dashboard, which is sourced from publicly available information about hockey agents, agencies, and player contracts.

## Building for Production

To build the application for production:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is licensed under the ISC License.

## Acknowledgments

- Original Agent Dashboard creators for the data and concept
- The React, TypeScript, and Tailwind CSS communities for their excellent tools and documentation 