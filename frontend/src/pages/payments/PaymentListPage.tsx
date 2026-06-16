import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";

import { paymentsApi } from "../../api/payments.api";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import { ROUTES } from "../../constants/routes";
import type { Payment } from "../../types/payment";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";
import { formatDateTime } from "../../utils/date";

export const PaymentListPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentsApi.list(),
  });

  const columns: ColumnsType<Payment> = [
    { 
      title: "Transaction ID", 
      dataIndex: "id", 
      width: 100,
      render: (text) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>#TX-{text}</span>
    },
    { 
      title: "Invoice ID", 
      dataIndex: "invoice",
      render: (text) => <span style={{ fontWeight: 500 }}>#INV-{text}</span>
    },
    { 
      title: "Customer ID", 
      dataIndex: "customer",
      render: (text) => <span>Customer #{text}</span>
    },
    { 
      title: "Amount Paid", 
      dataIndex: "amount", 
      render: (val) => <span style={{ fontWeight: 600, color: "#10b981" }}>{formatMoney(val)}</span> 
    },
    { 
      title: "Payment Method", 
      dataIndex: "method", 
      render: (val?: string) => (
        <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
          {val ? val.replace(/_/g, " ") : "-"}
        </span>
      )
    },
    { 
      title: "Reference Code", 
      dataIndex: "reference_code", 
      render: (value?: string) => value || "-" 
    },
    { 
      title: "Processed Date", 
      dataIndex: "processed_at", 
      render: (date) => date ? formatDateTime(date) : "-" 
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      render: (status?: string) => <StatusTag status={status} /> 
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Link to={`${ROUTES.payments}/${record.id}`}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Client-side filtering
  const allPayments = getListItems(query.data);
  const filteredPayments = allPayments.filter((item) => {
    const customerStr = String(item.customer || "");
    const invoiceStr = String(item.invoice || "");
    const referenceStr = String(item.reference_code || "");
    const methodStr = String(item.method || "");
    const idStr = String(item.id || "");
    
    const matchesSearch = 
      !searchText ||
      customerStr.toLowerCase().includes(searchText.toLowerCase()) ||
      invoiceStr.includes(searchText) ||
      referenceStr.toLowerCase().includes(searchText.toLowerCase()) ||
      methodStr.toLowerCase().includes(searchText.toLowerCase()) ||
      idStr.includes(searchText);
      
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Payments & Transactions"
        description="View transaction histories, payment methods, processing dates, and handle refunds."
      />
      
      <Card bordered={false}>
        {/* Table Filters Toolbar */}
        <div className="table-toolbar">
          <Input
            placeholder="Search by transaction, invoice, reference or method..."
            prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="table-search-input"
            allowClear
            style={{ width: 340, borderRadius: 8, height: 38 }}
          />
          
          <Select
            placeholder="Filter by Payment Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 220, height: 38 }}
            allowClear
            options={[
              { label: "Attempted", value: "attempted" },
              { label: "Pending", value: "pending" },
              { label: "Successful", value: "successful" },
              { label: "Failed", value: "failed" },
              { label: "Cancelled", value: "cancelled" },
              { label: "Refunded", value: "refunded" },
              { label: "Adjusted", value: "adjusted" },
            ]}
          />
        </div>

        {query.isError ? (
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredPayments}
            loading={query.isLoading}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </>
  );
};
