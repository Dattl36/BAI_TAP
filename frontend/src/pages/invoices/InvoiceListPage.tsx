import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";

import { invoicesApi } from "../../api/invoices.api";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import { ROUTES } from "../../constants/routes";
import type { Invoice } from "../../types/invoice";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";
import { formatDateTime } from "../../utils/date";

export const InvoiceListPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.invoices.list(),
    queryFn: () => invoicesApi.list(),
  });

  const columns: ColumnsType<Invoice> = [
    { 
      title: "Invoice ID", 
      dataIndex: "id", 
      width: 100,
      render: (text) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>#INV-{text}</span>
    },
    { 
      title: "Customer ID", 
      dataIndex: "customer",
      render: (text) => <span style={{ fontWeight: 500 }}>Customer #{text}</span>
    },
    { 
      title: "Appointment ID", 
      dataIndex: "appointment",
      render: (text) => <span>Appointment #{text}</span>
    },
    { 
      title: "Total Due", 
      dataIndex: "total_due", 
      render: (val) => <span style={{ fontWeight: 600 }}>{formatMoney(val)}</span> 
    },
    { 
      title: "Paid Amount", 
      dataIndex: "paid_amount", 
      render: (val) => <span style={{ color: "#10b981", fontWeight: 500 }}>{formatMoney(val)}</span> 
    },
    { 
      title: "Balance", 
      dataIndex: "balance_due", 
      render: (val) => {
        const balance = Number(val);
        return (
          <span style={{ fontWeight: 600, color: balance > 0 ? "#ef4444" : "var(--color-muted)" }}>
            {formatMoney(val)}
          </span>
        );
      }
    },
    { 
      title: "Issued Date", 
      dataIndex: "issued_at", 
      render: (date) => date ? formatDateTime(date) : <span style={{ color: "var(--color-muted)" }}>Draft</span>
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
          <Link to={`${ROUTES.invoices}/${record.id}`}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              Details
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Client-side filtering
  const allInvoices = getListItems(query.data);
  const filteredInvoices = allInvoices.filter((item) => {
    const customerStr = String(item.customer || "");
    const idStr = String(item.id || "");
    const appointmentStr = String(item.appointment || "");
    
    const matchesSearch = 
      !searchText ||
      customerStr.toLowerCase().includes(searchText.toLowerCase()) ||
      appointmentStr.includes(searchText) ||
      idStr.includes(searchText);
      
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Invoices & Billing"
        description="Monitor client payments, reward point adjustments, vouchers, and issue billing invoices."
      />
      
      <Card bordered={false}>
        {/* Table Filters Toolbar */}
        <div className="table-toolbar">
          <Input
            placeholder="Search by invoice, customer or booking ID..."
            prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="table-search-input"
            allowClear
            style={{ width: 320, borderRadius: 8, height: 38 }}
          />
          
          <Select
            placeholder="Filter by Invoice Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 220, height: 38 }}
            allowClear
            options={[
              { label: "Draft", value: "draft" },
              { label: "Issued", value: "issued" },
              { label: "Partially Paid", value: "partially_paid" },
              { label: "Paid", value: "paid" },
              { label: "Adjusted", value: "adjusted" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        </div>

        {query.isError ? (
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredInvoices}
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
