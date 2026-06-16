import React, { ReactNode } from "react";
import { Card, Typography } from "antd";

interface TodayStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export const TodayStatsCard: React.FC<TodayStatsCardProps> = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
}) => {
  return (
    <Card className="staff-stat-card" bordered={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
            {title}
          </Typography.Text>
          <Typography.Title level={2} style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            {value}
          </Typography.Title>
        </div>
        <div 
          className="staff-stat-icon-wrapper"
          style={{ 
            backgroundColor: iconBg, 
            color: iconColor 
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
