import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";

import { customersApi } from "../../api/customers.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { Customer } from "../../types/customer";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

export const ReceptionistCustomersPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: () => customersApi.list(),
  });

  const columns: ColumnsType<Customer> = [
    { title: "Code", dataIndex: "code", render: (value?: string) => <span style={{ fontWeight: 600 }}>{value || "-"}</span> },
    { title: "Full Name", dataIndex: "full_name", render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Phone", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Status", dataIndex: "status", render: (status?: string) => <StatusTag status={status} /> },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Link to={`/receptionist/customers/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />} size="small">
            View History
          </Button>
        </Link>
      ),
    },
  ];

  const allCustomers = getListItems(query.data);
  const filtered = allCustomers.filter((item) => {
    const matchesSearch = 
      !searchText ||
      item.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.includes(searchText) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <div className="table-toolbar">
        <Input
          placeholder="Search clients..."
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
          style={{ width: 180, height: 38 }}
          allowClear
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
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
