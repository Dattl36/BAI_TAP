import { Card, Typography } from "antd";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
  onClick?: () => void;
}

export const StatCard = ({ title, value, icon, iconBg, iconColor, loading, onClick }: StatCardProps) => (
  <Card
    variant="borderless"
    className="rcpt-stat-card"
    style={{ cursor: onClick ? "pointer" : "default" }}
    onClick={onClick}
  >
    <div className="stat-content">
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{loading ? "—" : value}</div>
      </div>
      <div
        className="stat-icon-box"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
    </div>
  </Card>
);
