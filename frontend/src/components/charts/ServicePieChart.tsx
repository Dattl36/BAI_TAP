import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface ServicePiePoint {
  label: string;
  value: number;
}

interface ServicePieChartProps {
  data: ServicePiePoint[];
}

const colors = ["#bca374", "#d4b26f", "#8e8a80", "#c5a880", "#e5d3b3"];

export const ServicePieChart = ({ data }: ServicePieChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie 
        data={data} 
        dataKey="value" 
        nameKey="label" 
        innerRadius={60} 
        outerRadius={85} 
        paddingAngle={4}
      >
        {data.map((entry, index) => (
          <Cell key={entry.label} fill={colors[index % colors.length]} stroke="var(--color-surface)" strokeWidth={2} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          background: "var(--color-surface)", 
          border: "1px solid var(--app-border)", 
          borderRadius: 8, 
          boxShadow: "var(--shadow-card)" 
        }} 
      />
    </PieChart>
  </ResponsiveContainer>
);
