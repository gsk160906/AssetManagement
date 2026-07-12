import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MaintenanceTrendData {
  month: string;
  cost: number;
}

interface MaintenanceChartProps {
  data: MaintenanceTrendData[];
}

export const MaintenanceChart: React.FC<MaintenanceChartProps> = ({ data }) => {
  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[320px]">
      <h3 className="text-sm font-bold text-base-content/85 mb-2">Monthly Maintenance Costs</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-base-content/40 text-xs">
          No cost trend data available
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="currentColor" className="text-base-content/40" />
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
              <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
export default MaintenanceChart;
