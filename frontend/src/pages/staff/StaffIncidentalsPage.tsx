import { Card, Table } from "antd";

export const StaffIncidentalsPage = () => {
  const incidentals = [
    { id: 1, name: "Premium L'Oreal Color Tube", price: "$35.00" },
    { id: 2, name: "Luxury Organic Moroccan Scalp Oil", price: "$25.00" },
  ];

  const columns = [
    { title: "Material Name", dataIndex: "name", key: "name", render: (text: string) => <strong>{text}</strong> },
    { title: "Price", dataIndex: "price", key: "price" },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <Table dataSource={incidentals} columns={columns} rowKey="id" pagination={false} size="middle" />
    </Card>
  );
};
