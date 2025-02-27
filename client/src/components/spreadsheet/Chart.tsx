import { FC, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell as RechartsCell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Cell } from '@shared/schema';
import { addressToPosition } from '@/lib/spreadsheet';

interface ChartProps {
  data: Record<string, Cell>;
  range: string;
  type: 'line' | 'bar' | 'pie';
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export const Chart: FC<ChartProps> = ({ data, range, type }) => {
  const chartData = useMemo(() => {
    // Convert spreadsheet data to chart format
    const [startCell, endCell] = range.split(':');
    const startPos = addressToPosition(startCell);
    const endPos = addressToPosition(endCell);

    const rows = [];

    // For horizontal data series (columns as series)
    for (let row = startPos.row; row <= endPos.row; row++) {
      const rowData: any = { name: `Row ${row + 1}` };

      for (let col = startPos.col; col <= endPos.col; col++) {
        const address = String.fromCharCode(65 + col) + (row + 1);
        const value = parseFloat(data[address]?.value || '0');
        rowData[`Series ${col - startPos.col + 1}`] = isNaN(value) ? 0 : value;
      }

      rows.push(rowData);
    }

    return rows;
  }, [data, range]);

  const renderLineChart = () => (
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {Object.keys(chartData[0] || {})
        .filter(key => key !== 'name')
        .map((key, index) => (
          <Line 
            key={key}
            type="monotone" 
            dataKey={key} 
            stroke={COLORS[index % COLORS.length]} 
          />
        ))}
    </LineChart>
  );

  const renderBarChart = () => (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {Object.keys(chartData[0] || {})
        .filter(key => key !== 'name')
        .map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={COLORS[index % COLORS.length]} 
          />
        ))}
    </BarChart>
  );

  const renderPieChart = () => {
    // For pie chart, use only the first row of data
    const pieData = Object.entries(chartData[0] || {})
      .filter(([key]) => key !== 'name')
      .map(([key, value]) => ({
        name: key,
        value
      }));

    return (
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {pieData.map((entry, index) => (
            <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  };

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? renderLineChart() :
         type === 'bar' ? renderBarChart() :
         renderPieChart()}
      </ResponsiveContainer>
    </Card>
  );
};