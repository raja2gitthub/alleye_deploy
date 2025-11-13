
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

interface ChartData {
  name: string;
  completed: number;
  inProgress: number;
}

interface CompletionRateChartProps {
    data: ChartData[];
    title: string;
}

const CompletionRateChart: React.FC<CompletionRateChartProps> = ({ data, title }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-main mb-4">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
            <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CompletionRateChart;
