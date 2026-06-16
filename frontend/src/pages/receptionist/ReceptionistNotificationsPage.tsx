import { Card, Table, Typography } from "antd";

export const ReceptionistNotificationsPage = () => {
  const alerts = [
    { id: 1, message: "Stylist Specialist Marcus Vance requested a schedule block on June 16, 2026.", date: "Today" },
    { id: 2, message: "Client Charlotte York submitted a billing dispute regarding voucher SPA50.", date: "Yesterday" }
  ];

  const columns = [
    { title: "Notification Alarm", dataIndex: "message", key: "message", render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Date Received", dataIndex: "date", key: "date" }
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <Table dataSource={alerts} columns={columns} rowKey="id" pagination={false} size="middle" />
    </Card>
  );
};
