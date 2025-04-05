import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * EventBarChart - Displays event counts by category
 * @param {Array} data - Array of objects with category and count
 * @param {String} xKey - The key to use for X-axis
 * @param {String} yKey - The key to use for Y-axis
 * @param {Number} height - Chart height
 */
export const EventBarChart = ({ data, xKey, yKey, height = 300 }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xKey} 
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * EventLineChart - Displays event trends over time
 * @param {Array} data - Array of objects with date and count
 * @param {String} xKey - The key to use for X-axis (date)
 * @param {String} yKey - The key to use for Y-axis (count)
 * @param {Number} height - Chart height
 */
export const EventLineChart = ({ data, xKey, yKey, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xKey} 
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * EventPieChart - Displays distribution of events by category
 * @param {Array} data - Array of objects with name and value
 * @param {String} nameKey - The key to use for segment names
 * @param {String} valueKey - The key to use for segment values
 * @param {Number} height - Chart height
 */
export const EventPieChart = ({ data, nameKey, valueKey, height = 300 }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * ChartPanel - Container for charts with title and description
 */
export const ChartPanel = ({ title, description, children }) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '16px',
      margin: '16px 0'
    }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {description && <p style={{ color: '#666' }}>{description}</p>}
      {children}
    </div>
  );
}; 