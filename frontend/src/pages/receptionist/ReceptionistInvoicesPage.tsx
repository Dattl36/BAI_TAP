import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";

import { invoicesApi } from "../../api/invoices.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { Invoice } from "../../types/invoice";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";

export const ReceptionistInvoicesPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.invoices.list(),
    queryFn: () => invoicesApi.list(),
  });

  const columns: ColumnsType<Invoice> = [
    { title: "Invoice ID", dataIndex: "id", key: "id", render: (text) => <span style={{ fontWeight: 600 }}>#INV-{text}</span> },
    { title: "Customer ID", dataIndex: "customer", key: "customer", render: (text) => <span>Customer #{text}</span> },
    { title: "Total Due", dataIndex: "total_due", key: "total_due", render: (val) => formatMoney(val) },
    { title: "Balance Due", dataIndex: "balance_due", key: "balance_due", render: (val) => <span style={{ fontWeight: 600 }}>{formatMoney(val)}</span> },
    { title: "Status", dataIndex: "status", key: "status", render: (status?: string) => <StatusTag status={status} /> },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Link to={`/receptionist/invoices/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />} size="small">
            Checkout desk
          </Button>
        </Link>
      ),
    },
  ];

  const allInvoices = getListItems(query.data);
  const filtered = allInvoices.filter((item) => {
    const matchesSearch = !searchText || String(item.id).includes(searchText) || String(item.customer).includes(searchText);
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <div className="table-toolbar">
        <Input
          placeholder="Search by invoice code..."
          prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="table-search-input"
          allowClear
          style={{ width: 300, borderRadius: 8, height: 38 }}
        />
        
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200, height: 38 }}
          allowClear
          options={[
            { label: "Draft", value: "draft" },
            { label: "Issued", value: "issued" },
            { label: "Paid", value: "paid" },
          ]}
        />
      </div>

      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          loading={query.isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      )}
    </Card>
  );
};
