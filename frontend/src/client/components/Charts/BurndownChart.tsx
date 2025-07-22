import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BurndownChartProps {
  data: Array<{
    day: number;
    remaining: number;
    ideal: number;
  }>;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-poppins font-semibold text-lg lg:text-xl xl:text-2xl text-secondary-2 mb-4 lg:mb-6">
        Burndown Chart - Sprint Actuel
      </h3>
      <div className="w-full h-[300px] lg:h-[400px] xl:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Jours', position: 'insideBottom', offset: -10 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Tâches restantes', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ideal" 
              stroke="#9CA3AF" 
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Idéal"
              dot={{ fill: '#9CA3AF', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="remaining" 
              stroke="#5b229b" 
              strokeWidth={3}
              name="Réel"
              dot={{ fill: '#5b229b', strokeWidth: 2, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};