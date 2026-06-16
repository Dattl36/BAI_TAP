import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RevenuePoint {
  label: string;
  revenue: number;
}

interface RevenueLineChartProps {
  data: RevenuePoint[];
}

export const RevenueLineChart = ({ data }: RevenueLineChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
      <CartesianGrid strokeDasharray="4 4" stroke="#eae6df" vertical={false} />
      <XAxis 
        dataKey="label" 
        tickLine={false} 
        axisLine={false} 
        tick={{ fill: "var(--color-muted)", fontSize: 12 }} 
      />
      <YAxis 
        tickLine={false} 
        axisLine={false} 
        tick={{ fill: "var(--color-muted)", fontSize: 12 }} 
        tickFormatter={(value: number) => `$${value}`}
      />
      <Tooltip 
        contentStyle={{ 
          background: "var(--color-surface)", 
          border: "1px solid var(--app-border)", 
          borderRadius: 8, 
          boxShadow: "var(--shadow-card)" 
        }} 
        formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} 
      />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="var(--color-primary)" 
        strokeWidth={3} 
        dot={{ r: 5, fill: "var(--color-surface)", stroke: "var(--color-primary)", strokeWidth: 2 }} 
        activeDot={{ r: 7, strokeWidth: 0 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
