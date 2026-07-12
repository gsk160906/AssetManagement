import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AssetStatusData {
  name: string;
  value: number;
}

interface AssetStatusChartProps {
  data: AssetStatusData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280', '#ec4899'];

export const AssetStatusChart: React.FC<AssetStatusChartProps> = ({ data }) => {
  const filteredData = data.filter((item) => item.value > 0);

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[320px]">
      <h3 className="text-sm font-bold text-base-content/85 mb-2">Asset Status Distribution</h3>
      {filteredData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-base-content/40 text-xs">
          No asset data available
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {filteredData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '10px', 
                  fontSize: '11px',
                  color: '#1f2937'
                }} 
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
                wrapperStyle={{ fontSize: '11px', paddingBottom: '5px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
export default AssetStatusChart;
