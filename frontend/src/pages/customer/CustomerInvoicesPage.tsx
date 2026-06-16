import { Card, Table, Typography, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DollarOutlined } from "@ant-design/icons";

import { invoicesApi } from "../../api/invoices.api";
import { StatusTag } from "../../components/common/StatusTag";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { normalizePaginatedResponse } from "../../utils/apiResponse";
import type { Invoice } from "../../types/invoice";

const columns: ColumnsType<Invoice> = [
  { 
    title: "Invoice Code", 
    dataIndex: "id", 
    render: (text) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>#INV-{text}</span> 
  },
  { 
    title: "Service Date", 
    dataIndex: "created_at",
    render: (text) => text ? new Date(text).toLocaleDateString() : "TBD"
  },
  { 
    title: "Subtotal", 
    dataIndex: "subtotal",
    render: (val) => `${Number(val || 0).toLocaleString()} VND`
  },
  { 
    title: "Loyalty Discount", 
    dataIndex: "reward_discount",
    render: (val) => <span style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>-${Number(val || 0).toLocaleString()} VND</span>
  },
  { 
    title: "Total Billed", 
    dataIndex: "total_due",
    render: (val) => <strong style={{ fontSize: 14 }}>{Number(val || 0).toLocaleString()} VND</strong>
  },
  { 
    title: "Status", 
    dataIndex: "status", 
    render: (status) => <StatusTag status={status} /> 
  },
];

export const CustomerInvoicesPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["invoices", "list"],
    queryFn: () => invoicesApi.list({ ordering: "-created_at" }),
  });

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const invoicesList = normalizePaginatedResponse(data || []).results;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Your Invoices & Receipts
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          View transaction details and redeem loyalty histories.
        </Typography.Paragraph>
      </div>

      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        {invoicesList.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={invoicesList} 
            rowKey="id" 
            pagination={false}
            size="middle"
          />
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <DollarOutlined style={{ fontSize: 48, color: "var(--color-primary)", marginBottom: 16, opacity: 0.7 }} />
            <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, margin: "0 0 8px" }}>
              No Invoices Found
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ maxWidth: 450, margin: "0 auto 24px" }}>
              You haven't completed any paid services yet. Book your first visit to experience our premium care!
            </Typography.Paragraph>
            <Link to="/customer/book">
              <Button type="primary" className="login-button-gold">
                Book a Service
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
