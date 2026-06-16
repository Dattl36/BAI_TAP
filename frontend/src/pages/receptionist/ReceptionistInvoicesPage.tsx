import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Row, Col, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";

import { invoicesApi } from "../../api/invoices.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { Invoice } from "../../types/invoice";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";

const formatDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const ReceptionistInvoicesPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.invoices.list(),
    queryFn: () => invoicesApi.list(),
  });

  const columns: ColumnsType<Invoice> = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text) => (
        <span style={{ fontWeight: 700, color: "#b89a63", fontFamily: "'Outfit', monospace" }}>
          #HD-{text}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: 110,
      render: (text) => <Tag color="geekblue" style={{ borderRadius: 6 }}>KH #{text}</Tag>,
    },
    {
      title: "Lịch hẹn",
      dataIndex: "appointment",
      key: "appointment",
      width: 110,
      render: (val) =>
        val ? (
          <Tag style={{ borderRadius: 6 }}>#LH-{val}</Tag>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (val) => <span style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(val)}</span>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_due",
      key: "total_due",
      width: 130,
      render: (val) => <span style={{ fontWeight: 500 }}>{formatMoney(val)}</span>,
    },
    {
      title: "Còn lại",
      dataIndex: "balance_due",
      key: "balance_due",
      width: 130,
      render: (val) => (
        <span style={{ fontWeight: 700, color: Number(val) > 0 ? "#ef4444" : "#10b981" }}>
          {formatMoney(val)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status?: string) => <StatusTag status={status} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      fixed: "right" as const,
      render: (_, record) => (
        <Link to={`/receptionist/invoices/${record.id}`}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            style={{ borderRadius: 8, background: "#b89a63", borderColor: "#b89a63", fontSize: 12 }}
          >
            Thanh toán
          </Button>
        </Link>
      ),
    },
  ];

  const allInvoices = getListItems(query.data);
  const filtered = useMemo(() => allInvoices.filter((item) => {
    const matchesSearch =
      !searchText ||
      String(item.id).includes(searchText) ||
      String(item.customer).includes(searchText);
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [allInvoices, searchText, statusFilter]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "#1f2937" }}>
          Quản lý hóa đơn
        </Typography.Title>
        <Typography.Text style={{ color: "#6b7280", fontSize: 14 }}>
          Xem và xử lý thanh toán hóa đơn dịch vụ
        </Typography.Text>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={9}>
              <Input
                placeholder="Tìm theo mã hóa đơn hoặc khách hàng..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: 10, height: 40 }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: "100%", height: 40 }}
                options={[
                  { label: "Nháp", value: "draft" },
                  { label: "Đã xuất", value: "issued" },
                  { label: "Đã thanh toán", value: "paid" },
                ]}
              />
            </Col>
          </Row>
        </div>

        {query.isError ? (
          <div style={{ padding: 32 }}>
            <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            loading={query.isLoading}
            rowKey="id"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `Tổng cộng ${t} hóa đơn`,
              style: { padding: "16px 24px" },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <FileTextOutlined style={{ fontSize: 40, color: "#d1d5db", marginBottom: 12 }} />
                  <div style={{ color: "#9ca3af" }}>Chưa có hóa đơn nào</div>
                </div>
              ),
            }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};
