import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DepartmentData {
  name: string;
  value: number;
}

interface DepartmentChartProps {
  data: DepartmentData[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => {
  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[320px]">
      <h3 className="text-sm font-bold text-base-content/85 mb-2">Assets per Department</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-base-content/40 text-xs">
          No department data available
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(229, 231, 235, 0.3)" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="currentColor" className="text-base-content/40" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="currentColor" className="text-base-content/40" width={110} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: '#1f2937'
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
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
export default DepartmentChart;
