import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface StatusDataPoint {
  name: string;
  value: number;
}

interface AppointmentStatusChartProps {
  data: StatusDataPoint[];
}

const COLORS: Record<string, string> = {
  Requested: "#3b82f6", // Blue
  Confirmed: "#10b981", // Green
  Arrived: "#06b6d4",   // Cyan
  "In Service": "#8b5cf6", // Purple
  Completed: "#bca374",  // Gold/yellow premium
  Invoiced: "#d4b26f",   // Soft Gold
  Cancelled: "#ef4444",  // Red
  "No Show": "#f59e0b",  // Orange
};

export const AppointmentStatusChart = ({ data }: AppointmentStatusChartProps) => {
  // Filter out zero value slices
  const activeData = data.filter((d) => d.value > 0);

  // Fallback data if everything is empty
  const chartData = activeData.length > 0 ? activeData : [{ name: "No Bookings", value: 1 }];
  const fallbackColors = ["#eae6df"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={65}
          outerRadius={85}
          paddingAngle={3}
        >
          {chartData.map((entry) => {
            const color = activeData.length > 0 ? COLORS[entry.name] || "#8e8a80" : fallbackColors[0];
            return <Cell key={entry.name} fill={color} stroke="var(--color-surface)" strokeWidth={2} />;
          })}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: 8,
            boxShadow: "var(--shadow-card)",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: "var(--color-muted)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
