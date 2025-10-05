import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MarketSparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const MarketSparkline: React.FC<MarketSparklineProps> = ({
  data,
  color,
  width = 100,
  height = 30
}) => {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};