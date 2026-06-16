import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Input, Table, Tag, Typography, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, CreditCardOutlined } from "@ant-design/icons";

import { paymentsApi } from "../../api/payments.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { Payment } from "../../types/payment";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";

const METHOD_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ ngân hàng",
  transfer: "Chuyển khoản",
  qr: "QR Code",
  momo: "MoMo",
  vnpay: "VNPay",
};

const formatDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const ReceptionistPaymentsPage = () => {
  const [searchText, setSearchText] = useState("");

  const query = useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentsApi.list(),
  });

  const columns: ColumnsType<Payment> = [
    {
      title: "Mã giao dịch",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text) => (
        <span style={{ fontWeight: 700, color: "#b89a63", fontFamily: "'Outfit', monospace" }}>#GD-{text}</span>
      ),
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "invoice",
      key: "invoice",
      width: 120,
      render: (text) => <Tag style={{ borderRadius: 6 }}>#HD-{text}</Tag>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (val) => (
        <span style={{ fontWeight: 700, color: "#10b981" }}>{formatMoney(val)}</span>
      ),
    },
    {
      title: "Hình thức",
      dataIndex: "method",
      width: 130,
      render: (val) => (
        <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 600 }}>
          {METHOD_LABELS[val] ?? val}
        </Tag>
      ),
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "reference_code",
      width: 150,
      render: (val) =>
        val ? (
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#374151" }}>{val}</span>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (val) => <span style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(val)}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status?: string) => <StatusTag status={status} />,
    },
  ];

  const allPayments = getListItems(query.data);
  const filtered = useMemo(() => allPayments.filter((item) =>
    !searchText ||
    String(item.id).includes(searchText) ||
    String(item.reference_code ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
    String(item.invoice).includes(searchText)
  ), [allPayments, searchText]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "#1f2937" }}>
          Sổ đăng ký giao dịch
        </Typography.Title>
        <Typography.Text style={{ color: "#6b7280", fontSize: 14 }}>
          Theo dõi lịch sử thu chi và thanh toán dịch vụ
        </Typography.Text>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <Row>
            <Col xs={24} sm={14} md={10}>
              <Input
                placeholder="Tìm theo mã giao dịch, hóa đơn hoặc tham chiếu..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: 10, height: 40 }}
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
            scroll={{ x: 900 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `Tổng cộng ${t} giao dịch`,
              style: { padding: "16px 24px" },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <CreditCardOutlined style={{ fontSize: 40, color: "#d1d5db", marginBottom: 12 }} />
                  <div style={{ color: "#9ca3af" }}>Chưa có giao dịch nào</div>
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
