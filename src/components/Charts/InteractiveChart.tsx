import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
  budget?: number;
  [key: string]: any;
}

interface InteractiveChartProps {
  type: 'pie' | 'bar' | 'line';
  data: ChartData[];
  title?: string;
  onSegmentClick?: (data: ChartData) => void;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  type,
  data,
  title,
  onSegmentClick,
  height = 300,
  colors = COLORS,
  showLegend = true,
  showTooltip = true
}) => {
  const handleClick = (data: any, index?: number) => {
    if (onSegmentClick) {
      onSegmentClick(data.payload || data);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs z-50">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Spent:</span> {' '}
              <span className="text-green-600 font-semibold">
                ${typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
              </span>
            </p>
            {data.budget && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Budget:</span> {' '}
                <span className="text-blue-600 font-semibold">
                  ${data.budget.toLocaleString()}
                </span>
              </p>
            )}
            {data.budget && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Percentage:</span> {' '}
                <span className={`font-semibold ${
                  data.percentage > 100 ? 'text-red-600' : data.percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {data.percentage ? data.percentage.toFixed(1) : ((data.value / data.budget) * 100).toFixed(1)}%
                </span>
              </p>
            )}
            {data.percentage > 100 && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Over budget by ${(data.value - data.budget).toFixed(2)}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to view details</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!showLegend || !payload) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSegmentClick && onSegmentClick(data[index])}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (type === 'pie') {
    const validData = data.filter(item => item.value > 0);
    
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
        )}
        <div className="relative">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={validData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, value }) => 
                  percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                }
                outerRadius={Math.min(height * 0.35, 120)}
                fill="#8884d8"
                dataKey="value"
                onClick={handleClick}
                className="cursor-pointer focus:outline-none"
              >
                {validData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || colors[index % colors.length]}
                    className="hover:opacity-80 transition-opacity duration-200"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend content={<CustomLegend />} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Bar 
              dataKey="value" 
              fill={colors[0]}
              onClick={handleClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ 
                r: 6, 
                className: "cursor-pointer",
                onClick: handleClick
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};