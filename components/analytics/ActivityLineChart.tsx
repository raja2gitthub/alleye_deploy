
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

interface ChartData {
  date: string;
  logins: number;
  completions: number;
}
interface ActivityLineChartProps {
    data: ChartData[];
    title: string;
}

const ActivityLineChart: React.FC<ActivityLineChartProps> = ({ data, title }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-main mb-4">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="logins" stroke="#4f46e5" name="User Logins" />
            <Line type="monotone" dataKey="completions" stroke="#10b981" name="Content Completions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ActivityLineChart;
