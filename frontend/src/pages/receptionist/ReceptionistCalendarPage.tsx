import { Card, Calendar, Badge, Alert, Space, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";

export const ReceptionistCalendarPage = () => {
  const getListData = (value: Dayjs) => {
    let listData: { type: string; content: string }[] = [];
    if (value.date() === 15) {
      listData = [
        { type: "warning", content: "A112 Aromatherapy - Elena Mitchell" },
        { type: "success", content: "A115 Premium Nails - Clara Reynolds" },
      ];
    }
    return listData;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type as any} text={item.content} style={{ fontSize: 10 }} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <Typography.Paragraph type="secondary">
          Visual monthly grid planner. Select any date to inspect stylist schedules.
        </Typography.Paragraph>
      </div>
      <Calendar cellRender={dateCellRender} />
    </Card>
  );
};
