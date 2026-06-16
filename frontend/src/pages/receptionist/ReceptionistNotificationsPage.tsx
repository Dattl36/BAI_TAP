import { Card, Table, Tag, Typography, Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";

const MOCK_ALERTS = [
  {
    id: 1,
    type: "schedule",
    message: "Stylist Marcus Vance đề xuất chặn lịch ngày 16/06/2026.",
    date: "Hôm nay",
    isRead: false,
  },
  {
    id: 2,
    type: "complaint",
    message: "Khách hàng Charlotte York gửi khiếu nại về voucher SPA50.",
    date: "Hôm qua",
    isRead: false,
  },
  {
    id: 3,
    type: "system",
    message: "Hệ thống đã sao lưu dữ liệu thành công lúc 02:00.",
    date: "Hôm qua",
    isRead: true,
  },
];

const TYPE_TAG: Record<string, { label: string; color: string }> = {
  schedule: { label: "Lịch hẹn", color: "blue" },
  complaint: { label: "Khiếu nại", color: "red" },
  system: { label: "Hệ thống", color: "default" },
  payment: { label: "Thanh toán", color: "green" },
};

export const ReceptionistNotificationsPage = () => {
  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (type: string) => {
        const t = TYPE_TAG[type] ?? { label: type, color: "default" };
        return (
          <Tag color={t.color} style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
            {t.label}
          </Tag>
        );
      },
    },
    {
      title: "Nội dung thông báo",
      dataIndex: "message",
      key: "message",
      render: (text: string, record: (typeof MOCK_ALERTS)[0]) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {!record.isRead && (
            <Badge status="processing" color="#b89a63" style={{ marginTop: 4, flexShrink: 0 }} />
          )}
          <span style={{ fontWeight: record.isRead ? 400 : 600, color: record.isRead ? "#6b7280" : "#1f2937" }}>
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "date",
      key: "date",
      width: 110,
      render: (date: string) => (
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{date}</span>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "#1f2937" }}>
          Cảnh báo &amp; Thông báo
        </Typography.Title>
        <Typography.Text style={{ color: "#6b7280", fontSize: 14 }}>
          Theo dõi các thông báo hệ thống và cảnh báo quan trọng
        </Typography.Text>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={MOCK_ALERTS}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <BellOutlined style={{ fontSize: 40, color: "#d1d5db", marginBottom: 12 }} />
                <div style={{ color: "#9ca3af" }}>Không có thông báo nào</div>
              </div>
            ),
          }}
          rowClassName={(record) => record.isRead ? "" : ""}
        />
      </Card>
    </div>
  );
};
