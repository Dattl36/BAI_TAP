import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Row, Col, Table, Tag, Typography, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";

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
    {
      title: "Mã KH",
      dataIndex: "code",
      width: 90,
      render: (value?: string) => (
        <span style={{ fontWeight: 700, color: "#b89a63", fontSize: 12, fontFamily: "'Outfit', monospace" }}>
          {value || "—"}
        </span>
      ),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "full_name",
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={32}
            style={{ background: "linear-gradient(135deg, #b89a63, #8a6e3f)", fontSize: 13, flexShrink: 0 }}
          >
            {text?.charAt(0)?.toUpperCase() || <UserOutlined />}
          </Avatar>
          <span style={{ fontWeight: 600, color: "#1f2937" }}>{text || "—"}</span>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 130,
      render: (val) => val ? <span style={{ fontFamily: "monospace" }}>{val}</span> : <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 200,
      ellipsis: true,
      render: (val) => val ? <a href={`mailto:${val}`} style={{ color: "#6366f1" }}>{val}</a> : <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Hạng thành viên",
      dataIndex: "loyalty_tier",
      width: 140,
      render: (val) => {
        if (!val) return <span style={{ color: "#9ca3af" }}>—</span>;
        const tierColors: Record<string, string> = {
          bronze: "orange",
          silver: "default",
          gold: "gold",
          platinum: "purple",
        };
        return (
          <Tag color={tierColors[val?.toLowerCase()] ?? "default"} style={{ borderRadius: 6, fontWeight: 600 }}>
            {val}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 110,
      render: (status?: string) => <StatusTag status={status} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_, record) => (
        <Link to={`/receptionist/customers/${record.id}`}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            style={{ borderRadius: 8, background: "#b89a63", borderColor: "#b89a63", fontSize: 12 }}
          >
            Xem hồ sơ
          </Button>
        </Link>
      ),
    },
  ];

  const allCustomers = getListItems(query.data);
  const filtered = useMemo(() => allCustomers.filter((item) => {
    const matchesSearch =
      !searchText ||
      item.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.includes(searchText) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [allCustomers, searchText, statusFilter]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "#1f2937" }}>
          Cơ sở dữ liệu khách hàng
        </Typography.Title>
        <Typography.Text style={{ color: "#6b7280", fontSize: 14 }}>
          Tìm kiếm, tra cứu và quản lý hồ sơ khách hàng
        </Typography.Text>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder="Tìm theo tên, số điện thoại, email hoặc mã KH..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: 10, height: 40 }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: "100%", height: 40 }}
                options={[
                  { label: "Đang hoạt động", value: "active" },
                  { label: "Không hoạt động", value: "inactive" },
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
            scroll={{ x: 900 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `Tổng cộng ${t} khách hàng`,
              style: { padding: "16px 24px" },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <TeamOutlined style={{ fontSize: 40, color: "#d1d5db", marginBottom: 12 }} />
                  <div style={{ color: "#9ca3af" }}>Không tìm thấy khách hàng nào</div>
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
