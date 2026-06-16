import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface AppointmentBarPoint {
  label: string;
  count: number;
}

interface AppointmentBarChartProps {
  data: AppointmentBarPoint[];
}

export const AppointmentBarChart = ({ data }: AppointmentBarChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
      <CartesianGrid strokeDasharray="4 4" stroke="#eae6df" vertical={false} />
      <XAxis 
        dataKey="label" 
        tickLine={false} 
        axisLine={false} 
        tick={{ fill: "var(--color-muted)", fontSize: 12 }} 
      />
      <YAxis 
        allowDecimals={false} 
        tickLine={false} 
        axisLine={false} 
        tick={{ fill: "var(--color-muted)", fontSize: 12 }} 
      />
      <Tooltip 
        contentStyle={{ 
          background: "var(--color-surface)", 
          border: "1px solid var(--app-border)", 
          borderRadius: 8, 
          boxShadow: "var(--shadow-card)" 
        }} 
      />
      <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={28} />
    </BarChart>
  </ResponsiveContainer>
);
