import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";

import { customersApi } from "../../api/customers.api";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import { ROUTES } from "../../constants/routes";
import type { Customer } from "../../types/customer";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

export const CustomerListPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: () => customersApi.list(),
  });

  const columns: ColumnsType<Customer> = [
    { 
      title: "Code", 
      dataIndex: "code", 
      render: (value?: string) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{value || "-"}</span> 
    },
    { 
      title: "Full Name", 
      dataIndex: "full_name",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    { title: "Phone", dataIndex: "phone", render: (value?: string) => value || "-" },
    { title: "Email", dataIndex: "email", render: (value?: string) => value || "-" },
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
          <Link to={`${ROUTES.customers}/${record.id}`}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Client-side filtering
  const allCustomers = getListItems(query.data);
  const filteredCustomers = allCustomers.filter((item) => {
    const matchesSearch = 
      !searchText ||
      item.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.includes(searchText) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Customers Registry"
        description="View and manage verified salon customer accounts and history."
        actions={
          <Link to={`${ROUTES.customers}/create`}>
            <Button type="primary" icon={<PlusOutlined />} className="login-button-gold">
              New Customer
            </Button>
          </Link>
        }
      />
      
      <Card bordered={false}>
        {/* Table Filters Toolbar */}
        <div className="table-toolbar">
          <Input
            placeholder="Search by name, phone or code..."
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
              { label: "Archived", value: "archived" },
            ]}
          />
        </div>

        {query.isError ? (
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCustomers}
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
