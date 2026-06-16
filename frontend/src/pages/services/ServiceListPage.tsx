import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";

import { servicesApi } from "../../api/services.api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import { ROUTES } from "../../constants/routes";
import type { SalonService } from "../../types/service";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";
import { ErrorState } from "../../components/common/ErrorState";

export const ServiceListPage = () => {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: () => servicesApi.list(),
  });

  const columns: ColumnsType<SalonService> = [
    { 
      title: "Service Name", 
      dataIndex: "name",
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    { 
      title: "Category", 
      dataIndex: "category", 
      render: (value?: string) => value || "-" 
    },
    { 
      title: "Duration", 
      dataIndex: "duration_minutes", 
      render: (value: number) => <span style={{ fontWeight: 500 }}>{value} mins</span> 
    },
    { 
      title: "Base Price", 
      dataIndex: "base_price", 
      render: (price) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{formatMoney(price)}</span> 
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
          <Link to={`${ROUTES.services}/${record.id}`}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Client-side filtering and categories extraction
  const allServices = getListItems(query.data);
  const categories = Array.from(new Set(allServices.map((s) => s.category).filter(Boolean)));

  const filteredServices = allServices.filter((item) => {
    const matchesSearch = 
      !searchText ||
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <PageHeader
        title="Service Catalog"
        description="Configure salon services, pricing structures, and standard execution duration times."
        actions={
          <Link to={`${ROUTES.services}/create`}>
            <Button type="primary" icon={<PlusOutlined />} className="login-button-gold">
              New Service
            </Button>
          </Link>
        }
      />
      
      <Card bordered={false}>
        {/* Table Filters Toolbar */}
        <div className="table-toolbar">
          <Input
            placeholder="Search by service name..."
            prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="table-search-input"
            allowClear
            style={{ width: 300, borderRadius: 8, height: 38 }}
          />
          
          <Select
            placeholder="Filter by Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 180, height: 38 }}
            allowClear
            options={categories.map((cat) => ({ label: cat, value: cat }))}
          />
        </div>

        {query.isError ? (
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredServices}
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
