import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";

import { appointmentsApi } from "../../api/appointments.api";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import { ROUTES } from "../../constants/routes";
import type { Appointment } from "../../types/appointment";
import { getListItems } from "../../utils/apiResponse";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/error";

export const AppointmentListPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.appointments.list(),
    queryFn: () => appointmentsApi.list(),
  });

  const columns: ColumnsType<Appointment> = [
    { 
      title: "ID", 
      dataIndex: "id", 
      width: 90,
      render: (text) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>#{text}</span>
    },
    { 
      title: "Customer", 
      dataIndex: "customer",
      render: (_, record) => <span style={{ fontWeight: 500 }}>{record.customer_details?.full_name || record.customer || "-"}</span>
    },
    { 
      title: "Staff Specialist", 
      dataIndex: "staff",
      render: (_, record) => <span>{record.employee_details?.full_name || record.staff || "-"}</span>
    },
    { title: "Start Date & Time", dataIndex: "scheduled_start", render: (value) => formatDateTime(value) },
    { title: "End Date & Time", dataIndex: "scheduled_end", render: (value) => formatDateTime(value) },
    { 
      title: "Booking Status", 
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
          <Link to={`${ROUTES.appointments}/${record.id}`}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Client-side filtering
  const allAppointments = getListItems(query.data);
  const filteredAppointments = allAppointments.filter((item) => {
    // Check search text matches customer or staff name
    const customerStr = item.customer_details?.full_name || String(item.customer || "");
    const staffStr = item.employee_details?.full_name || String(item.staff || "");
    const idStr = String(item.id || "");
    
    const matchesSearch = 
      !searchText ||
      customerStr.toLowerCase().includes(searchText.toLowerCase()) ||
      staffStr.toLowerCase().includes(searchText.toLowerCase()) ||
      idStr.includes(searchText);
      
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Appointments Workspace"
        description="Monitor, check-in, and manage guest bookings and salon service workflows."
        actions={
          <Link to={`${ROUTES.appointments}/create`}>
            <Button type="primary" icon={<PlusOutlined />} className="login-button-gold">
              New Appointment
            </Button>
          </Link>
        }
      />
      
      <Card bordered={false}>
        {/* Table Filters Toolbar */}
        <div className="table-toolbar">
          <Input
            placeholder="Search by customer, staff or booking ID..."
            prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="table-search-input"
            allowClear
            style={{ width: 320, borderRadius: 8, height: 38 }}
          />
          
          <Select
            placeholder="Filter by Booking Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 220, height: 38 }}
            allowClear
            options={[
              { label: "Requested", value: "requested" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Arrived", value: "arrived" },
              { label: "In Service", value: "in_service" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        </div>

        {query.isError ? (
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredAppointments}
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
