import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[320px]">
      <h3 className="text-sm font-bold text-base-content/85 mb-2">Assets by Category</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-base-content/40 text-xs">
          No category data available
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="currentColor" className="text-base-content/40" />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-base-content/40" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: '#1f2937'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
export default CategoryChart;
